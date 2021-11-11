mapboxgl.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

//set bounds to Ballard neighborhood
var bounds = [
		[-122.455244,47.649373], // southwest coords
		[-122.299805,47.702542] // northeast coords
	];
var map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/core-gis/ckqihj7aj2f1y18nvyhumtlwm', // stylesheet location for BHS map
	center: [-122.388446,47.672930], // starting position [lng, lat]
	zoom: 14.5, // starting zoom
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
/*
*****************************************************
This is where we will put code for the popups for the point layer(s)
When a click event occurs on a feature in the point layer, open a popup at
the location of the click, with description HTML from its properties
*****************************************************
*/

// When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with description HTML from its properties.

map.on('click', 'places-layer', (e) => {
	// Copy coordinates array.
	const coordinates = e.features[0].geometry.coordinates.slice();
	/*const address = e.features[0].properties.address;
	const id = e.features[0].properties.id;*/
	var p = e.features[0].properties;
	console.log(p);

	// Ensure that if the map is zoomed out such that multiple
	// copies of the feature are visible, the popup appears
	// over the copy being pointed to.
	while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
		coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
	}

 //right now p.address is a placeholder for will ultimately be the Person's name
 //similarly, all other attributes will be styled with h4 in the css
	new mapboxgl.Popup()
		.setLngLat(coordinates)
		.setHTML("<h3>" + p.address + '</h3><p><h4>'  + p.id + '</h4></p>')
		.addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'places-layer', () => {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'places-layer', () => {
	map.getCanvas().style.cursor = '';
});

