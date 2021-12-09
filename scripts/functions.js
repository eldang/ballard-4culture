






function showHideLayer(layerName, markerNames, showOnly=false, hideOnly=false) {
	var visibility = map.getLayoutProperty(layerName, 'visibility');
		if ((visibility === 'visible' || hideOnly) && !showOnly) {
			map.setLayoutProperty(layerName, 'visibility', 'none');
			this.className = '';
			for (i in markerNames) {
				if (document.getElementById(markerNames[i]) !== null) {
					document.getElementById(markerNames[i]).classList.add('inactive');
				}
			}
		} else {
			this.className = 'active';
			map.setLayoutProperty(layerName, 'visibility', 'visible');
			for (i in markerNames) {
				if (document.getElementById(markerNames[i]) !== null) {
					document.getElementById(markerNames[i]).classList.remove('inactive');
				}
			}
	}
}





function populateZoomControl(selectID, sourceID, fieldName, layerName) {
	polygons = getPolygons(sourceID, fieldName);
	var select = document.getElementById(selectID);
	select.options[0] = new Option(layerName, "-108,25,-88,37,0");
	updateURL();
	for (i in polygons) {
		select.options[select.options.length] = new Option(
			polygons[i].name,
			polygons[i].bbox.toString() + ',' + polygons[i].name
		);
		if (urlParams["zoomto"] && urlParams["zoomto"].toString() === polygons[i].name.toString()) {
			if (showHouseDistricts) {
				zoomToPolygon(sourceID, polygons[i].bbox.toString() + ',' + polygons[i].name, 'house_dist');
			} else if (showSenateDistricts) {
				zoomToPolygon(sourceID, polygons[i].bbox.toString() + ',' + polygons[i].name, 'senate_dist');
			}
		}
	}
	map.setLayoutProperty(sourceID + '-poly', 'visibility', 'none');
// IMPORTANT: these paint properties define the appearance of the mask layer that deemphasises districts outside the one we've zoomed to.  They will overrule anything that's set when that mask layer was loaded.
	map.setPaintProperty(sourceID + '-poly', 'fill-color', 'rgba(200, 200, 200, 0.7)');
	map.setPaintProperty(sourceID + '-poly', 'fill-outline-color', 'rgba(200, 200, 200, 0.1)');
}



// from https://www.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/
// Because features come from tiled vector data, feature geometries may be split
// or duplicated across tile boundaries and, as a result, features may appear
// multiple times in query results.
function getUniqueFeatures(array, comparatorProperty) {
	var existingFeatureKeys = {};
	var uniqueFeatures = array.filter(function(el) {
		if (existingFeatureKeys[el.properties[comparatorProperty]]) {
			return false;
		} else {
			existingFeatureKeys[el.properties[comparatorProperty]] = true;
			return true;
		}
	});

	return uniqueFeatures;
}

// apply map filters persistently
function setFilter(sourceID) {
	if (filterStates.year) {
		if (filterStates.district) {
			map.setFilter(
				sourceID,
				['all',
					['<=', 'year', filterStates.year.toString()],
					['==', filterStates.district.field, filterStates.district.val.toString()]
				]
			);
		} else {
			map.setFilter(
				sourceID,
				['<=', 'year', filterStates.year.toString()]
			);
		}
		/*
		map.setPaintProperty(
			sourceID,
			'icon-opacity',
			[
				"interpolate",
				["linear"],
				['-', filterStates.year, ['number', ['get', 'year']]],
				0, 1,
				(filterStates.year - 2008 - 1), 0
			]
		);
		*/
	} else {
		console.log('something`s wrong, there should never be no year filter', filterStates);
	}
}



function updateURL(district='0') {
	var newURL = window.location.pathname;
	var newTitle = 'Raise Your Hand Texas programs'
	if (showHouseDistricts) {
		newURL += '?districts=house';
	} else if (showSenateDistricts) {
		newURL += '?districts=senate';
	}
	if (district === '0') {
		if (showHouseDistricts) {
			newTitle += ' by House District ';
		} else if (showSenateDistricts) {
			newTitle += ' by Senate District';
		}
	} else {
		newURL += (newURL.indexOf('?')) ? '&' : '?';
		newURL += 'zoomto=' + district;
		newTitle += ' in '
		if (showHouseDistricts) {
			newTitle += 'House ';
		} else if (showSenateDistricts) {
			newTitle += 'Senate ';
		}
		newTitle += 'District ' + district;
	}
	history.pushState({id: 'zoomto'}, newTitle, newURL);
	document.title = newTitle;
}

// this event listener forces a page reload when going back through the history, even if only a parameter has changed
window.addEventListener('popstate', function() {
	if (history.state && history.state.id === 'zoomto') {
		location.reload();
	}
})






function setVisibilityState(params) {
	if ((params.visibleOnLoad === undefined) || (params.visibleOnLoad === false)) {
		if ((params.legendID !== undefined) && (params.legendID !== false)) {
			document.getElementById(params.legendID).classList.add('inactive');
		}
		return 'none';
	} else {
		if ((params.legendID !== undefined) && (params.legendID !== false)) {
			document.getElementById(params.legendID).classList.remove('inactive');
		}
		return 'visible';
	}
}





function parseBooleanField(data, ifTrue, ifFalse) {
	if (typeof(data) === undefined || data === null || data === '' || (!data && ifFalse === '')) {
		return '';
	} else {
		return '<span class="varname">' + (data ? ifTrue : ifFalse) + '</span><br />';
	}
}



// workaround for Github Pages not support LFS objects, based on
// https://github.com/git-lfs/git-lfs/issues/1342#issuecomment-467321479
// https://media.githubusercontent.com/media/_Username_/_Project_/_Branch_/_Path_to_file_
function fixLink(link, subdir='') {
	if (subdir !== '') {
		link = subdir + '/' + link;
	}
	if ((window.location.hostname).includes('github')) {
		link = 'https://media.githubusercontent.com/media/eldang/ballard-4culture/main/' + link;
	}
	console.log(link);
	return link;
}


function parseTextField(data, fieldName, replacements=[]) {
	let html = '';
	if (typeof(data) !== undefined && data !== null && data !== '') {
		if (fieldName !== '') {
			html += '<span class="varname">' + fieldName + '</span>: ';
		}
		if (replacements.length > 0) {
			data = data.replaceAll(replacements[0], replacements[1]);
		}
		html += data + '<br />';
	}
	return html;
};


function parseTextArray(data, fieldName) {
	let html = '';
	if (data.length > 0) {
		if (fieldName !== undefined) {
			html += '<span class="varname">' + fieldName + '</span>: ';
		}
		for (let i in data) {
			if (i > 0) {
				html += ', ';
			}
			html += data[i];
		}
		html += '<br />';
	}
	return html;
}


function parseAudioArray(data, fieldName) {
	let html = '';
	if (data.length > 0) {
		if (fieldName !== undefined) {
			html += '<span class="varname">' + fieldName + '</span>:<br />';
		}
		for (let i in data) {
			html += '<audio controls src="' + fixLink(data[i], 'mp3') + '" type="audio/mpeg">';
			html += '<a href="' + fixLink(data[i], 'mp3') + '">' + data[i] + '</a>'; // this part serves as a fallback: if someone's browser can't play the audio inline they'll see a download link instead
			html += '</audio>';
		}
		html += '<br />';
	}
	return html;
}



function parseLink(data, subdir, fieldName) {
	let html = '';
	if (data !== '') {
		html += '<a href="' + fixLink(data, subdir) + '">'
		html += fieldName ? fieldName : 'Link';
		html += '</a><br />';
	}
	return html;
}


function parseLinkArray(data, subdir, fieldName) {
	let html = '';
	if (data.length > 0) {
		if (fieldName !== undefined) {
			html += '<span class="varname">' + fieldName + '</span>:<br />';
		}
		for (let i in data) {
			html += '<a href="' + fixLink(data[i], subdir) + '">';
			html += data[i] + '</a> ';
		}
		html += '<br />';
	}
	return html;
}



function parseImages(data, subdir, fieldName) {
	let html = '';
	if (data.length > 0) {
		if (fieldName !== undefined) {
			html += '<span class="varname">' + fieldName + '</span>: ';
		}
		for (let i in data) {
			html += '<img src="' + subdir + '/' + data[i] + '" />';
		}
	}
	return html;
}



// Popups for a place, also listing all the people at that place
function fillpopup(data) {
	let ids = JSON.parse(data.people);
	let html = "<h3>" + data.address + '</h3>';
	let names = '';
	let entries = '';
	for (i in ids) {
		let person = people[ids[i]];
		console.log(person);
		names += '<li><a href="#person-' + i + '">' + person.name + '</a></li>';
		entries += '<p id="person-' + i + '">';
		entries += parseTextField(person['other_names'], 'Other names', ['_', ' ']);
		entries += parseTextField(person['description'], '');
		entries += parseTextField(person['birthplace'], 'Birthplace', ['_', ' ']);
		// born_in_ballard field intentionally skipped because it's redundant with the above
		entries += parseTextArray(person['heritage'], 'Family heritage');
		entries += parseTextField(person['year_born'], 'Born');
		entries += parseBooleanField(person['ballard_childhood'], 'Childhood in Ballard', 'Childhood not in Ballard');
		entries += parseTextField(person['gender'], 'Gender');
		entries += parseTextField(person['profession'], 'Profession');
		// occupation field skipped because it looks like a messier version of the above
		entries += parseTextArray(person['family_professions'], 'Family trade');
		entries += parseTextArray(person['employers'], 'Employer[s]');
		entries += parseTextField(person['legacy_business_connection'], 'Legacy business connection');
		entries += parseTextField(person['association'], 'Association involvement');
		entries += parseBooleanField(person['bhs_grad'], 'Ballard High School graduate', '');
		entries += parseTextField(person['bhs_year'], 'Graduation year');
		entries += parseAudioArray(person['mp3'], 'Audio');
		entries += parseLink(person['transcripts'][0], 'transcripts', 'Transcript');
		entries += parseImages(person['images'], 'images');
		entries += parseLinkArray(person['other_media'], 'other_media', 'Additional Media');
		entries += '</p>';
	}
	if (names === '' && entries === '') {
		console.log('Missing data for popup', ids, data);
		html += '<p>No records found.</p>';
	} else {
		html += '<div id="personTabs">';
		html += '<ul>' + names + '</ul>';
		html += entries;
		html += '</div>';
	}

	return html; //this will return the string to the calling function
}



