import json
import logging
import os
import shutil
import time

from src import google


LOGLEVEL = 'DEBUG'
# get these by inspecting the sharing link in Google Drive.  The ID is the
# whole sequence between (e.g.) https://docs.google.com/spreadsheets/d/
# and /edit or between https://drive.google.com/drive/folders/ and ?usp=sharing
FILE_IDS = {
    'spreadsheet': '122PnHx_kzVnvxOaExUeuA0OeZthBYkqqYeRR7e-B7jk',
    'mp3': '1t2ZBOf-3ixjSyDoLtmJf_t-XBpwP2Zfj',
    'images': '1JQsg96WdZrjb6otbvL0eRSBequGnZcay',
    'transcripts': '1Zv0k_76iRj7Nl70d2xaMZduw-qKvoJrG',
    'other_media': '1qA7AlI83glWavg-hCAYVAs27UN2VD5NJ'
}
OUTPUT_FILES = {
    'people': 'people.json',
    'places': 'places.geojson'
}



logging.basicConfig(
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
    datefmt='%Y%m%d %H:%M:%S'
)
logger = logging.getLogger(__name__)



def sync() -> None:
    logger.setLevel(LOGLEVEL)
    logger.info('Starting run')
    tmpDir = 'temp_' + time.strftime('%Y%m%d_%H%M_%S')
    logger.debug('Creating temp directory: ' + tmpDir)
    os.mkdir(tmpDir)
    data = google.readSheet(tmpDir, FILE_IDS['spreadsheet'], LOGLEVEL)
    people = _processPeople(data['people'])
    people = _addMaterials(people, data['people to materials'])
    places = _processPlaces(data['places'])
    people, places = _dataJoin(people, places, data['people to places'])
    with open(os.path.join(tmpDir, OUTPUT_FILES['people']), 'w') as f:
        f.write(json.dumps(people, indent='\t'))
    logger.info('Wrote ' + OUTPUT_FILES['people'])
    with open(os.path.join(tmpDir, OUTPUT_FILES['places']), 'w') as f:
        f.write(json.dumps(_makeGeoJSON(places), indent='\t'))
    logger.info('Wrote ' + OUTPUT_FILES['places'])
    mediaDirs = google.fetchMedia(tmpDir, people, FILE_IDS, LOGLEVEL)
    _moveFiles(tmpDir, mediaDirs)
    shutil.rmtree(tmpDir)
    logger.info('Run complete')




def _processPeople(people: []) -> {}:
    result = {}
    for row in people:
        person = {
            'name': row['name'],
            'description': row['description'],
            'year_born': None,
            'gender': row['gender'],
            'other_names': row['other names'],
            'birthplace': row['place of birth'],
            'occupation': row['occupation'],
            'born_in_ballard': False,
            'profession': row['Profession'].replace('_', ' '),
            'ballard_childhood': False,
            'legacy_business_connection': row['Which one'],
            'association': row['Association'],
            'cht_mhb': row['CHT_MHB'],
            'bhs_grad': False,
            'bhs_year': None,
            'heritage': [],
            'mp3': [],
            'transcripts': [row['transcript']],
            'images': [],
            'other_media': [],
            'places': [],
            'employers': [],
            'family_professions': [],
            'places': []
        }
        if row['year born'] != '':
            person['year_born'] = int(float(row['year born']))
        if row['BHS year'] != '':
            person['bhs_year'] = row['BHS year'].replace('_', ' ')
            try: # round number to int if it's a number
                float(person['bhs_year'])
                person['bhs_year'] = str(int(float(person['bhs_year'])))
            except: # don't raise an error if not, because some rows have notes
                pass
        if 'Y' in row['born in Ballard']:
            person['born_in_ballard'] = True
        if 'Y' in row['ballard childhood']:
            person['ballard_childhood'] = True
        if 'Y' in row['B High School grad']:
            person['bhs_grad'] = True
        for key in row.keys():
            if 'audio' in key and '.' in row[key]:
                person['mp3'].append(row[key])
            elif 'photo' in key and '.' in row[key]:
                person['images'].append(row[key])
            elif key == 'other materials' and '.' in row[key]:
                person['other_media'].append(row[key])
            elif 'heritage' in key and row[key] != '':
                for entry in row[key].split('_'):
                    if entry not in person['heritage']:
                        person['heritage'].append(entry)
            elif 'employer' in key and row[key] != '':
                person['employers'].append(row[key])
            elif 'Family Profession' in key and row[key] != '':
                person['family_professions'].append(row[key])
        result[int(float(row['people_id']))] = person
    logger.info('Processed ' + str(len(result)) + ' person enties')
    return result



def _processPlaces(places: []) -> {}:
    result = {}
    for row in places:
        place = {
            'type': row['type'],
            'address': row['address'],
            'lat': float(row['lat']),
            'long': float(row['long']),
            'name': row['place name'].replace('_', ' '),
            'people': []
        }
        if place['name'] == '':
            place['name'] = place['address'].split(',')[0]
        result[int(float(row['place_id']))] = place
    logger.info('Processed ' + str(len(result)) + ' place entries')
    return result



def _addMaterials(people: {}, materials: []) -> {}:
    currentPerson = None
    n = 0
    for row in materials:
        if row['people_id'] != '':
            currentPerson = int(float(row['people_id']))
        item = row['other_materials']
        if item != '' and item not in people[currentPerson]['other_media']:
            people[currentPerson]['other_media'].append(item)
            n = n + 1
    logger.debug('Added ' + str(n) +' additional materials to person entries')
    return people



def _dataJoin(people: {}, places: {}, links: []):
    unjoinedPeople = list(people.keys())
    unjoinedPlaces = list(places.keys())
    nJoinedPeople = 0
    nJoinedPlaces = 0
    for row in links:
        person = int(float(row['person']))
        place = int(float(row['place_id']))
        if person not in people.keys():
            raise RuntimeError(
                'Person ID ' + row['person'] +
                ' in "people to places" not found in "people".'
            )
        elif person in unjoinedPeople:
            unjoinedPeople.remove(person)
            nJoinedPeople += 1
        if place not in places.keys():
            raise RuntimeError(
                'Place ID ' + row['place_id'] +
                ' in "people to places" not found in "places".'
            )
        elif place in unjoinedPlaces:
            unjoinedPlaces.remove(place)
            nJoinedPlaces +=1
        if place not in people[person]['places']:
            people[person]['places'].append(place)
        if person not in places[place]['people']:
            places[place]['people'].append(person)
    if unjoinedPeople != []:
        logger.warning('The following people have no associated places:')
        for i in unjoinedPeople:
            print(str(i) + ': ' + str(people[i]))
    if unjoinedPlaces != []:
        logger.warning('The following places have no associated people:')
        for i in unjoinedPlaces:
            print(str(i) + ': ' + str(places[i]))
    logger.info(
        'Connected ' + str(nJoinedPeople) + ' people to places and ' +
        str(nJoinedPlaces) + ' places to people.'
    )
    return people, places



def _makeGeoJSON(places: {}) -> {}:
    features = []
    for i in places.keys():
        place = places[i]
        geom = {
            "type": "Point",
            "coordinates": [place['long'], place['lat']]
        }
        props = {
            'id': i,
            'type': place['type'],
            'address': place['address'],
            'people': place['people'],
            'name': place['name']
        }
        features.append({
            'type': 'Feature',
            'properties': props,
            'geometry': geom
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }



def _moveFiles(tmpDir: str, mediaDirs: {}) -> None:
    for key in OUTPUT_FILES.keys():
        shutil.copy(os.path.join(tmpDir, OUTPUT_FILES[key]), '../data')
    for key in mediaDirs.keys():
        for file in mediaDirs[key]:
            shutil.copy(file, '../' + key)


if __name__ == '__main__':
    sync()
