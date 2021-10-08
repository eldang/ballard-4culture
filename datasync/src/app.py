import logging
import os
import shutil
import time

from src import google


LOGLEVEL = 'DEBUG'
# get these by inspecting the sharing link in Google Drive.  The ID is the
# whole sequence between (e.g.) https://docs.google.com/spreadsheets/d/
# and /edit
FILE_IDS = {
    'spreadsheet': '122PnHx_kzVnvxOaExUeuA0OeZthBYkqqYeRR7e-B7jk'
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
    content = google.readSheet(tmpDir, FILE_IDS['spreadsheet'], LOGLEVEL)
    data = {}
    data['people'] = _processPeople(content['people'])
    print(data)
    shutil.rmtree(tmpDir)
    logger.info('Run complete')




def _processPeople(people) -> [{}]:
    result = []
    for row in people:
        person = {
            'id': row['people_id'],
            'name': row['name'],
            'description': row['description'],
            'year_born': row['year born'],
            'gender': row['gender'],
            'other_names': row['other names'],
            'birthplace': row['place of birth'],
            'occupation': row['occupation'],
            'employer': row['employer'],
            'born_in_ballard': False,
            'profession': row['Profession'].replace('_', ' '),
            'ballard_childhood': False,
            'legacy_business_connection': row['Which one'],
            'association': row['Association'],
            'cht_mhb': row['CHT_MHB'],
            'bhs_grad': False,
            'bhs_year': row['BHS year'].replace('_', ' '),
            'heritage': [],
            'audio': [],
            'transcript': row['transcript'],
            'photos': [],
            'other_materials': [],
            'places': [],
            'employers': [],
            'family_professions': []
        }
        if 'Y' in row['born in Ballard']:
            person['born_in_ballard'] = True
        if 'Y' in row['ballard childhood']:
            person['ballard_childhood'] = True
        if 'Y' in row['B High School grad']:
            person['bhs_grad'] = True
        for key in row.keys():
            if 'audio' in key and '.' in row[key]:
                person['audio'].append(row[key])
            elif 'photo' in key and '.' in row[key]:
                person['photos'].append(row[key])
            elif key == 'other materials' and '.' in row[key]:
                person['other_materials'].append(row[key])
            elif 'heritage' in key and row[key] != '':
                for entry in row[key].split('_'):
                    if entry not in person['heritage']:
                        person['heritage'].append(entry)
            elif 'employer' in key and row[key] != '':
                person['employers'].append(row[key])
            elif 'Family Profession' in key and row[key] != '':
                person['family_professions'].append(row[key])
        result.append(person)
    return result





if __name__ == '__main__':
    sync()
