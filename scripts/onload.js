mapboxgl.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

//set bounds to Ballard neighborhood
var bounds = [
		[-122.455244,47.649373], // southwest coords
		[-122.299805,47.722542] // northeast coords
	];
var map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/core-gis/ckqihj7aj2f1y18nvyhumtlwm', // stylesheet location for BHS map
	center: [-122.376779,47.679511], // starting position [lng, lat]
	zoom: 13, // starting zoom
	maxBounds: bounds // sets bounds as max
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

var originalZoomLevel = map.getZoom();

/* add places data from derived geojson*/
map.on('load', () => {
	map.addSource('places', {
		type: 'geojson',
		// Use a URL for the value for the `data` property.
		data: 'data/places.geojson'
	});

	map.addLayer({
		'id': 'places-layer',
		'type': 'circle',
		'source': 'places',
		'paint': {
			'circle-radius': 8,
			'circle-stroke-width': 2,
			'circle-color': '#423493',
			'circle-stroke-color': 'white'
		}
	});
});

/* load the derived people.json ,make it available as a global data structure and populate the dropdown from it */
let people = {};
const peopleRequest = new XMLHttpRequest();
peopleRequest.open('GET', 'data/people.json', true);
peopleRequest.onreadystatechange = function() {
	if (peopleRequest.readyState === 4) { // 4 = "ready".  This event will also fire on 2 and 3, which we just ignore.
		if (peopleRequest.status === 200) { // https://httpstatusdogs.com/200-ok
			people = JSON.parse(peopleRequest.response);
			populatePeopleDropdown(people, 'people-control');
		} else {
			console.log('people request failed:', peopleRequest)
		}
	}
};
peopleRequest.send(null);

/* load places.json and make it available as a global data structure */
let places = {}
const placesRequest = new XMLHttpRequest();
placesRequest.open('GET', 'data/places.geojson', true);
placesRequest.onreadystatechange = function() {
	if (placesRequest.readyState === 4) { // 4 = "ready".  This event will also fire on 2 and 3, which we just ignore.
		if (placesRequest.status === 200) { // https://httpstatusdogs.com/200-ok
			places = JSON.parse(placesRequest.response).features;
		} else {
			console.log('places request failed:', placesRequest)
		}
	}
};
placesRequest.send(null);


/*
*****************************************************
This is where we will put code for the popups for the point layer(s)
When a click event occurs on a feature in the point layer, open a popup at
the location of the click, with description HTML from its properties
*****************************************************
*/

// placeholder for popups
const w = $('#map').innerWidth();
const h = $('#map').innerHeight();
$("#popup").dialog({
	autoOpen: false,
	closeOnEscape: true,
	draggable: true,
	hide: 300,
	show: 100,
	minWidth: w < 350 ? w : Math.min(Math.max(300, w * 0.5), 500),
	maxWidth: w * 0.9,
	maxHeight: h / 2,
	resizable: true
});
$("#popup").parent().addClass('popup-container');

// When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with description HTML from its properties.

// clear popup with click on map away from points
map.on('click', function() {
	$(".popup-container").addClass('hidden');
	$('#popup').dialog('close');
});

map.on('click', 'places-layer', (e) => {
	$(".popup-container").addClass('hidden');
	$('#popup').dialog('close');
	// Copy coordinates array.
	const coordinates = e.features[0].geometry.coordinates.slice();
	/*const address = e.features[0].properties.address;
	const id = e.features[0].properties.id;*/
	let p = e.features[0].properties;

	// Ensure that if the map is zoomed out such that multiple
	// copies of the feature are visible, the popup appears
	// over the copy being pointed to.
	while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
		coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
	}

	// if there's an existing popup, explicitly remove its tabs first so that the tabs widget will attach to the right div.
	if ($("#popup-content").tabs("instance") !== undefined) {
		$("#popup-content").tabs("destroy");
	}
	// Fill a popup with info about all the person records found for this location
	$("#popup").dialog("option", "title", p.name);
	$("#popup-content").html(fillpopup(p));
	// open it from jQuery's perspective
	$('#popup').dialog('open');
	// attempt to position it sensibly relative to the click
	$("#popup").dialog("widget").position({
		my: "left bottom",
		at: "left+" + (e.point.x + 10) + " top+" + e.point.y,
		of: "#map",
		collision: "fit",
		within: "#map"
	});
	// attach the tabs widget to the new popup
	$('#popup-content').tabs();
	// $('#popup-content').tabs("load", 0);
	// make changing tabs or closing the popup pause all playing audio
	$('.ui-tabs-tab').click(function(){pauseAllAudio();});
	$("#popup").on('dialogclose', function(){pauseAllAudio();});
	// make it visible
	$(".popup-container").removeClass('hidden');
});

// make starting one audio player pause all the others
document.addEventListener('play', function(e){
	var audios = $('audio');
	for (let i=0; i<audios.length; i++){
		if (audios[i] != e.target){
			audios[i].pause();
		}
	}
}, true);


// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'places-layer', () => {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'places-layer', () => {
	map.getCanvas().style.cursor = '';
});

