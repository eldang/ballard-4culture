// store this as a global variable so that the stats box can always access the current value
var filterStates = {
	year: false,
	district: false
};
// store the year relating to any currently-displayed popup, so it can be cleaned up if necessary
var popupYear = 0;
// assign all new popups to this variable so we can remove them as needed
var popup;
// first we check for the URL parameter '?districts=senate'.  If found, we'll show state senate districts; otherwise state house
var urlParams = {};
window.location.href.replace(
	/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {urlParams[key] = value;}
);
var showHouseDistricts = true;
var showSenateDistricts = false;
if (
	(
		urlParams["districts"] && (
			urlParams["districts"].toLowerCase().indexOf("sen") > -1
			||
			urlParams["districts"].toLowerCase() === 's'
		)
	) || (
		urlParams["Districts"] && (
			urlParams["Districts"].toLowerCase().indexOf("sen") > -1
			||
			urlParams["Districts"].toLowerCase() === 's'
		)
	) || (
		urlParams["display"] && (
			urlParams["display"].toLowerCase().indexOf("sen") > -1
			||
			urlParams["display"].toLowerCase() === 's'
		)
	) || (
		urlParams["Display"] && (
			urlParams["Display"].toLowerCase().indexOf("sen") > -1
			||
			urlParams["Display"].toLowerCase() === 's'
		)
	)
) {
	showHouseDistricts = false;
	showSenateDistricts = true;
}
// now we can check the two showXDistricts variables anywhere that we might introduce House or Senate districts to decide which one to show






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

//These are the four functions written by Eldan that power the zoom-to-district feature
// runWhenLoadComplete() checks if the map has finished loading data, and once it has then it calls the next one.
//populateZoomControl() fills the dropdowns with options generated from reading the data layers for all the district names.
//getPolygons() does the actual work of fetching the district names
//zoomToPolygon() zooms the map to the district extent

function runWhenLoadComplete() {
	if (!map.getLayer('raising-school-leaders-points')) {
		setTimeout(runWhenLoadComplete, 100);
	}
	else {
		moveYearSlider('slider', 'active-year', 0); // calling this with a 0 increment will make sure that the filter, caption and slider position all match.  Without doing this, the browser seems to keep the slider position between refreshes, but reset the filter and caption so they get out of sync.
		if (showHouseDistricts) {
			populateZoomControl("house-districts-control", "state-house-districts", "District", "Texas House Districts");
			map.moveLayer('state-house-districts-lines');
		}
		if (showSenateDistricts) {
			populateZoomControl("senate-districts-control", "state-senate-districts", "District", "Texas Senate Districts");
			map.moveLayer('state-senate-districts-lines');
		}
		// using a timeout here to stop this from running before the big Raising School Leaders layer has finished loading
		setTimeout(function(){
			map.moveLayer('raising-school-leaders-points');
			map.moveLayer('charles-butt-scholars-points');
			map.moveLayer('raising-blended-learners-campuses-points');
			map.moveLayer('raising-texas-teachers-points');
		}, 100);
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

function removeElement(id) {
	var elementToRemove = document.getElementById(id);
	if (elementToRemove) {
		elementToRemove.parentNode.removeChild(elementToRemove);
	}
}

function getPolygons(sourceID, nameField) {
	layerID = map.getSource(sourceID).vectorLayerIds[0];
	features = map.querySourceFeatures(sourceID, {'sourceLayer': layerID})
	polygons = [];
	existingItems = [];
	for (i in features) {
		existing = existingItems.indexOf(features[i].properties[nameField]);
		if (existing > -1) {
			polygons[existing].bbox = getFeatureBounds(
				features[i].toJSON().geometry.coordinates,
				polygons[existing].bbox
			);
		}
		else {
			existingItems.push(features[i].properties[nameField]);
			polygons.push({
				name: features[i].properties[nameField],
				bbox: getFeatureBounds(features[i].toJSON().geometry.coordinates)
			});
		}
	}
	polygons.sort(function(a, b){
		var x = a.name;
		var y = b.name;
		if (x < y) {return -1;}
		if (x > y) {return 1;}
		return 0;
	});
	return polygons;
}

function getFeatureBounds(coords, startingBBOX) {
	if (startingBBOX === undefined) {
		minX = 180;
		maxX = -180;
		minY = 90;
		maxY = -90;
	}
	else {
		minX = startingBBOX[0][0];
		maxX = startingBBOX[1][0];
		minY = startingBBOX[0][1];
		maxY = startingBBOX[1][1];
	}
	for (i in coords) {
		// coords may be a simple array of coords, or an array of arrays if it's a multipolygon
		for (j in coords[i]) {
			if (!(coords[i][j][0] instanceof Array)) {
				if (coords[i][j][0] < minX) { minX = coords[i][j][0]; }
				if (coords[i][j][0] > maxX) { maxX = coords[i][j][0]; }
				if (coords[i][j][1] < minY) { minY = coords[i][j][1]; }
				if (coords[i][j][1] > maxY) { maxY = coords[i][j][1]; }
			}
			else {
				for (k in coords[i][j]) {
					if (coords[i][j][k][0] < minX) { minX = coords[i][j][k][0]; }
					if (coords[i][j][k][0] > maxX) { maxX = coords[i][j][k][0]; }
					if (coords[i][j][k][1] < minY) { minY = coords[i][j][k][1]; }
					if (coords[i][j][k][1] > maxY) { maxY = coords[i][j][k][1]; }
				}
			}
		}
	}
	return [[minX, minY], [maxX, maxY]];
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

// Update the year slider and corresponding map filter
function updateYearSlider(numberID, year) {
	filterStates.year = parseInt(year, 10);
	for (i in loadedPointLayers) {
		setFilter(loadedPointLayers[i][0]);
	}
	// update text in the UI
	document.getElementById(numberID).innerText = year;
	setTimeout(function(){ updateStatsBox(); }, 100);
}

function moveYearSlider(sliderID, numberID, increment, loop=false) {
	slider = document.getElementById(sliderID);
	minYear = parseInt(slider.min, 10);
	currentYear = parseInt(slider.value, 10);
	maxYear = parseInt(slider.max, 10);

	desiredYear = currentYear + increment;

	if (loop) { // if we're looping then wrap any overflow around
		if (desiredYear > maxYear) {desiredYear = minYear;}
		else if (desiredYear < minYear) {desiredYear = maxYear;}
	}
	else { // if not looping then keep changes within the min/max bounds
		if ((desiredYear > maxYear) || (desiredYear < minYear)) {
			desiredYear = currentYear;
			console.log('Hacking too much time');
		}
	}

	slider.value = desiredYear;
	updateYearSlider(numberID, desiredYear);
	if (desiredYear < popupYear) {
		popup.remove();
	}
}

function animateYearSlider(sliderID, numberID, delay) {
	if (animationRunning) {
		moveYearSlider(sliderID, numberID, 1, loop=true);
		setTimeout(
			function() {animateYearSlider(sliderID, numberID, delay)},
			delay
		);
	}
}

function startYearAnimation(sliderID, numberID, delay, playID, stopID) {
	animationRunning = true;
	document.getElementById(playID).style.display = 'none';
	document.getElementById(stopID).style.display = 'inline';
	animateYearSlider(sliderID, numberID, delay);
}

function stopYearAnimation(playID, stopID) {
	animationRunning = false;
	document.getElementById(playID).style.display = 'inline';
	document.getElementById(stopID).style.display = 'none';
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

function zoomToPolygon(sourceID, coords, filterField) {
	if (typeof coords !== 'undefined') {
		document.getElementById('statsBox').style.opacity = 0;
		coords = coords.split(",");
		bbox = [
			[coords[0], coords[1]],
			[coords[2], coords[3]]
		];
		updateURL(district=coords[4]);
		if (showHouseDistricts) {
			showHideLayer('state-house-districts-lines', markerNames=['state_house_districts'], showOnly=true);
		} else if (showSenateDistricts) {
			showHideLayer('state-senate-districts-lines', markerNames=['state_senate_districts'], showOnly=true);
		}
		map.fitBounds(bbox, options={padding: 10, duration: 3000});
		if (filterField !== undefined) {
			setTimeout(function(){
				if (coords[4] === '0') {
					filterStates.district = false;
				} else {
					filterStates.district = {
						'field': filterField,
						'val':   coords[4]
					};
				}
				for (i in loadedLineLayers) {
					showHideLayer(loadedLineLayers[i][0], [loadedLineLayers[i][1]], showOnly=true);
					if (
						(loadedLineLayers[i][0].indexOf("state-senate-districts") > -1)
						||
						(loadedLineLayers[i][0].indexOf("state-house-districts") > -1)
					) {
						if (coords[4] === '0') {
							map.setFilter(loadedLineLayers[i][0], null);
						} else {
							map.setFilter(
								loadedLineLayers[i][0],
								['==', 'District', parseInt(coords[4])]
							);
						}
					}
				}
				for (i in loadedPolygonLayers) {
					showHideLayer(
						loadedPolygonLayers[i][0],
						[loadedPolygonLayers[i][1]],
						showOnly = coords[4] === '0' ? false : true,
						hideOnly = coords[4] === '0' ? true : false
					);
					if (
						(loadedPolygonLayers[i][0].indexOf("state-senate-districts") > -1)
						||
						(loadedPolygonLayers[i][0].indexOf("state-house-districts") > -1)
					) {
						map.setFilter(
							loadedPolygonLayers[i][0],
							['!=', 'District', parseInt(coords[4])]
						);
					}
				}
				for (i in loadedPointLayers) {
					setFilter(loadedPointLayers[i][0]);
					if (coords[4] != '0') {
						showHideLayer(loadedPointLayers[i][0], [loadedPointLayers[i][1], loadedPointLayers[i][1] + '_icon'], showOnly=true);
					}
				}
				if (coords[4] === '0') {
					document.getElementById('statsBox').style.opacity = 0;
				}
			}, 1500);
		}
	}
}

function updateStatsBox() {
	if (filterStates.district) { // only do anything if we have a selected district
		document.getElementById('statsBox').style.opacity = 1;
		if (filterStates.district.field.indexOf("house") > -1) {
			document.getElementById("stats.districtType").innerText = "House";
		} else if (filterStates.district.field.indexOf("senate") > -1) {
			document.getElementById("stats.districtType").innerText = "Senate";
		} else {
			document.getElementById("stats.districtType").innerText = "";
		}
		document.getElementById("stats.districtName").innerText = filterStates.district.val;
		document.getElementById("stats.year").innerText = filterStates.year;
		for (i in loadedPointLayers) {
			pointsInDistrict = getUniqueFeatures(
				map.queryRenderedFeatures( { layers:[loadedPointLayers[i][0]] } ),
				"unique_id"
			);
			counterID = "count." + loadedPointLayers[i][0];
			document.getElementById(counterID).innerText = pointsInDistrict.length;
		}
	} else {
		document.getElementById('statsBox').style.opacity = 0;
	}
}

function standardizeCase(txt) {
	if (txt === undefined || txt === "") {
		return "";
	} else {
		txt = txt.replace(/([^\W_]+[^\s-]*) */g, function(x) {
			return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase();
		});
		txt = " " + txt + " ";
// NB: always include the leading & trailing spaces in this list to avoid accidentally selecting substrings.  The .trim() call at the end will clean them back up.
		overrides = [
			[" Isd ", " ISD "],
			[" Cisd ", " CISD "],
			[" El ", " Elementary School "],
			[" Pri ", " Primary School "],
			[" J H ", " Junior High School " ],
			[" Junior High School Moore ", " J.H. Moore "], // comedy hour special case here, because the line above expands "J H Moore El" to "Junior High Moore Elementary School"
			[" Int ", " Intermediate School "],
			[" H S ", " High School "],
			[" Aec ", " Alternative Education Center "]
		];
		for (i in overrides) {
			txt = txt.replace(overrides[i][0], overrides[i][1]);
		}
		return txt.trim();
	}
}




function openNav() {
	document.getElementById("mySidenav").style.width = "300px";
	document.getElementById("main").style.marginLeft = "300px";
}

function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
	document.getElementById("main").style.marginLeft= "0";
}




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

function addPointLayer(map, params) {
	gus_api(params.gusID, params.gusPage, function(jsondata) {
		var visibilityState = setVisibilityState(params);
		if (params.scalingFactor === undefined) { params.scalingFactor = 2.5; }
		map.addSource(params.sourceName, {
			type: 'geojson',
			data: jsondata
		});
		if (params.icon !== undefined) {
			map.addLayer({
				'id': params.layerName,
				'type': 'symbol',
				'source': params.sourceName,
				'layout': {
					'icon-image': params.icon,
					'icon-size': params.iconSize,
					'icon-allow-overlap': true,
					'visibility': visibilityState
				}
			});
			map.on("zoomend", function(){
				map.setLayoutProperty(params.layerName, 'icon-size', (1 + (map.getZoom() / originalZoomLevel - 1) * params.scalingFactor) * params.iconSize);
			});
		} else if (params.circleColor !== undefined) {
			map.addLayer({
				'id': params.layerName,
				'type': 'circle',
				'source': params.sourceName,
				'layout': {
					'visibility': visibilityState
				},
				'paint': {
					'circle-radius': params.circleRadius,
					'circle-color': params.circleColor,
					'circle-opacity': 0.8,
					'circle-stroke-color': params.circleColor,
					'circle-stroke-opacity': 1,
					'circle-stroke-width': 1,
					'circle-blur': 0.1
				}
			});
			map.on("zoomend", function(){
				map.setPaintProperty(params.layerName, 'circle-radius', (1 + (map.getZoom() / originalZoomLevel - 1) * params.scalingFactor) * params.circleRadius);
			});
		} else {
			console.log('Layer type not recognised:', params);
			return;
		}
		loadedPointLayers.push([params.layerName, params.legendID]);
		loadedPointLayerNames.push(params.layerName)
	});
}

function addVectorLayer(map, params) {
	var visibilityState = setVisibilityState(params);
	map.addSource(params.sourceName, {
		type: 'vector',
		url: params.sourceURL
	});
	if ((params.lineLayerName !== undefined) && (params.lineLayerName !== false)) {
		map.addLayer(
			{
				'id': params.lineLayerName,
				'type': 'line',
				'source': params.sourceName,
				'source-layer': params.sourceID,
				'layout': {
					'visibility': visibilityState,
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': params.lineColor,
					'line-width': 1
				},
			}
		);
		if (params.legendID !== undefined) {
			loadedLineLayers.push([params.lineLayerName, params.legendID]);
		}
	}
	if ((params.polygonLayerName !== undefined) && (params.polygonLayerName !== false)) {
		if (params.usedInZoomControl) { visibilityState = 'visible'; }
		map.addLayer(
			{
				'id': params.polygonLayerName,
				'type': 'fill',
				'source': params.sourceName,
				'source-layer': params.sourceID,
				'layout': {
					'visibility': visibilityState
				},
				'paint': {
					'fill-color': params.polygonFillColor,
					'fill-outline-color': params.polygonOutlineColor
				},
			}
		);
		if (params.legendID !== undefined) {
			loadedPolygonLayers.push([params.polygonLayerName, params.legendID]);
		}
	}
}




// These are the popups for the polygon district layers, using Eldan's House/Senate 'show' logic
// When a click event occurs on a feature in the unioned districts layer, open a popup for
// the correct district type at the location of the click, with description HTML from its properties.
function fillpopup(data) {
	var html = "<span class='varname'>";
// the shorthand in this next line is just a compressed if...then.
// "if showHouseDistricts is true then use the first string, else the second"
	html += showHouseDistricts ? "House District: " : "Senate District: ";
	html += "</span><span class='attribute'>";
	html += showHouseDistricts ? data.HseDistNum : data.SenDistNum;
	html += "</span>";
	return html; //this will return the string to the calling function
}




function fetchJSONFile(path, callback) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var data = JSON.parse(httpRequest.responseText);
				if (callback) callback(data);
			}
		}
	};
	httpRequest.open('GET', path);
	httpRequest.send();
}



function gus_api(id, page='od6', callback) {
	const url = `https://spreadsheets.google.com/feeds/cells/${id}/${page}/public/basic?alt=json`;

	fetchJSONFile(url, function(data) {

		let headers = {};
		let entries = {};

		data.feed.entry.forEach((e) => {
			// get the row number
			const row = parseInt(e.title['$t'].match(/\d+/g)[0]);
			const column = e.title['$t'].match(/[a-zA-Z]+/g)[0];
			const content = e.content['$t'];

			// it's a header
			if (row === 1) {
				headers[column] = content;
			} else {
				if (!entries[row]) entries[row] = {};
				entries[row][headers[column]] = content;
			}
		});

		const gj = { type: 'FeatureCollection', features: [] };
		for (let e in entries) {

			const feature = {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [0, 0]
				},
				properties: entries[e]
			};

			for (let p in entries[e]) {
				switch(p.toLowerCase()) {
					case 'longitude':
					case 'long':
					case 'lng':
					case 'lon':
					case 'x':
					case 'xcoord':
						feature.geometry.coordinates[0] = parseFloat(entries[e][p]);
						break;
					case 'latitude':
					case 'lat':
					case 'y':
					case 'ycoord':
						feature.geometry.coordinates[1] = parseFloat(entries[e][p]);
				}
			}

			gj.features.push(feature);
		}

		callback(gj);
	});
};
