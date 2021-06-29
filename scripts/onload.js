mapboxgl.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

//set bounds to Texas
var bounds = [
		[-122.455244,47.649373], // southwest coords
		[-122.299805,47.702542] // northeast coords
	];
var map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/core-gis/ckqihj7aj2f1y18nvyhumtlwm', // stylesheet location; this is the v2.3.1 style with markers turned OFF
	center: [-122.388446,47.672930], // starting position [lng, lat]
	zoom: 14.5, // starting zoom
	maxBounds: bounds // sets bounds as max
});

var originalZoomLevel = map.getZoom();

var loadedPointLayers = [];
var loadedPointLayerNames = [];
var loadedLineLayers = [];
var loadedPolygonLayers = [];



map.on('click', 'school_house_senate_districts_UNION-poly', function (e) {
	var pointFeatures = map.queryRenderedFeatures(e.point, {layers: loadedPointLayerNames});
	if (pointFeatures.length === 0) {
		popup = new mapboxgl.Popup()
			.setLngLat(e.lngLat)
			.setHTML(fillpopup(e.features[0].properties))
			.addTo(map);
	}
	popupYear = 0;
});




// make appropriate legend entry visible, and remove whichever zoom-to-districts dropdown we're not going to be using
if (showHouseDistricts) {
	document.getElementById("house_districts_legend_entry").style.display = "inline";
	document.getElementById("switch-to-senate-districts").style.display = "block";
	document.getElementById("house-district-reference").style.display = "inline";
} else {
	removeElement("house-districts-control"); // the dropdown menu
}
if (showSenateDistricts) {
	document.getElementById("senate_districts_legend_entry").style.display = "inline";
	document.getElementById("switch-to-house-districts").style.display = "block";
	document.getElementById("senate-district-reference").style.display = "inline";
} else {
	removeElement("senate-districts-control");
}









var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
	coll[i].addEventListener("click", function() {
		this.classList.toggle("active");
		var content = this.nextElementSibling;
		if (content.style.maxHeight) {
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = content.scrollHeight + "px";
		}
	});
}



// Change the cursor to a pointer when the mouse is over the house districts layer.
map.on('mouseenter', 'school_house_senate_districts_UNION-poly', function () {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'school_house_senate_districts_UNION-poly', function () {
	map.getCanvas().style.cursor = '';
});



/*
	How to add point layers using the GUS API:
	Call the addPointLayer() function with arguments like the examples below.

	How to add vector layers using Mapbox:
	Call the addVectorLayer() function with arguments like the examples below.
	Note that these calls have to be after the addPointLayer() ones, because they will reference at least one of the point layers as a way of making sure polygons get drawn behind points.
*/

map.on('load', function () {
	addPointLayer(
		map,
		{
			'gusID': "1CuutbSlRIgD1FsCUgQE0GyuPckgh6_zLhX-CfzQBymU",
			'gusPage': 1,
			'sourceName': 'raising-school-leaders',
			'layerName': 'raising-school-leaders-points',
			'circleColor': '#005BAD',
			'circleRadius': 5,
			'legendID': 'raising_school_leaders',
			'visibleOnLoad': true,
			'scalingFactor': 0.5
		}
	);

	addPointLayer(
		map,
		{
			'gusID': '108YzL2RQ1tqdCmICvoXe7W_GWFtgWhLYem-H3S4-vYA', // Google Sheets ID
			'gusPage': 1, // for newer Google Sheets (2021), this is the 1-indexed tab number that we want.  For older ones, it's the magic string 'od6'
			'sourceName': 'raising-blended-learners-campuses', // the data source name, used internally
			'layerName': 'raising-blended-learners-campuses-points', // layer name, used internally
			// 'icon': 'raising_blended_learners_campuses_large', // to make this an icon layer, use this property for the icon image name, using the name from Mapbox
			// 'iconSize': 0.1, // a size multiplier for the icon, which should be saved at 1/x times the intended initial display size, so that when it gets scaled up on zooming in it will still look good
			'circleColor': '#FDB500', // to get a circle layer, use this property specifying the colour
			'circleRadius': 5,
			'legendID': 'raising_blended_learners_campuses', // OPTIONAL: the id in the legend, so we can set it to active or inactive as appropriate. Simply leave out for layers that don't appear in the legend
			'scalingFactor': 2.5, // OPTIONAL: how much to magnify the markers by when zooming in.  Defaults to 2.5 if not specified; set to zero to have no zoom at all.
			'visibleOnLoad': true // set the optional final argument to true to have the layer visible on load
		}
	);

	addPointLayer(
		map,
		{
			'gusID': "1eLkfBuimyujyjnGN7GlTrA_XcRhpCb-cFaxGV9OYaBc",
			'gusPage': 1,
			'sourceName': 'charles-butt-scholars',
			'layerName': 'charles-butt-scholars-points',
			'circleColor': '#BE4F1C',
			'circleRadius': 5,
			'legendID': 'charles_butt_scholars',
			'visibleOnLoad': true
		}
	);

	addPointLayer(
		map,
		{
			'gusID': "13FHPkunuw6GJpbE9nh6zJIHPjruwwEdWP66Md33XxnQ",
			'gusPage': 1,
			'sourceName': 'raising-texas-teachers',
			'layerName': 'raising-texas-teachers-points',
			'circleColor': '#41B6E6',
			'circleRadius': 5,
			'legendID': 'raising_texas_teachers',
			'visibleOnLoad': true
		}
	);


	if (showSenateDistricts) {
		addVectorLayer(
			map,
			{
				'sourceName': 'state-senate-districts', // data source name for internal use
				'sourceID': 'state_senate_districts-0g2odu', // name of the Mapbox layer from which the data will be loaded
				'sourceURL': 'mapbox://core-gis.b2eu90mx', // Mapbox URL
				'lineLayerName': 'state-senate-districts-lines', // OPTIONAL name we'll use for the layer that shows the outlines. Leave out or set to false if you don't want outlines displayed.
				'lineColor': '#a1b082', // colour to draw those outlines with; safe to leave out if we're not drawing outlines, but must be explicitly set if we are
				'legendID': 'state_senate_districts', // OPTIONAL: the id in the legend, so we can set it to active or inactive as appropriate. Simply leave out for layers that don't appear in the legend
				'displayBehind': 'raising-school-leaders-points', // ID of another existing layer, which Mapbox will make sure this one gets drawn behind
				'polygonLayerName': 'state-senate-districts-poly', // OPTIONAL name we'll use for the layer that invisibly stores the polygon extents. Needed if we're either going to add this layer to either the zoom to districts control or set click events (e.g. popups) on it.	Leave out or set to false if you don't want one.
				'polygonFillColor': 'rgba(200, 100, 240, 0)', // colour to fill polygons with. Needed if there's going to be a polygon layer; simply leave out if not.
				'polygonOutlineColor': 'rgba(200, 100, 240, 0)', // colour to draw polygon boundaries with. Needed if there's going to be a polygon layer; simply leave out if not.
				'visibleOnLoad': true, // set this optional argument to true to have the layer visible on load. Leave out or set to false to have it hidden on load
				'usedInZoomControl': true // set this optional argument to true if this layer will be used in the Zoom to Districts control, otherwise leave it out or set it to false.
			}
		);
	}

	if (showHouseDistricts) {
		addVectorLayer(
			map,
			{
				'sourceName': 'state-house-districts',
				'sourceID': 'state_house_districts_v2-aws8ea',
				'sourceURL': 'mapbox://core-gis.14zlmi2o',
				'lineLayerName': 'state-house-districts-lines',
				'lineColor': 'rgba(117, 137, 77, 0.5)',
				'legendID': 'state_house_districts',
				'displayBehind': 'raising-school-leaders-points',
				'polygonLayerName': 'state-house-districts-poly',
				'polygonFillColor': 'rgba(200, 100, 240, 0)', // IMPORTANT: the polygon fill and outline colours for House and Senate districts will be overridden by the populateZoomControl() function, so edit them there.  Here the important thing is to keep the alpha value at 0 so that the layer won't appear to blink on and off during the loading process.
				'polygonOutlineColor': 'rgba(200, 100, 240, 0)',
				'visibleOnLoad': true,
				'usedInZoomControl': true
			}
		);
	}


	// This is a special cases: the layer is never displayed, but can be used to set what will appear in popups when someone clicks on the map
	addVectorLayer(
		map,
		{
			'sourceName': 'school_house_senate_districts_UNION',
			'sourceID': 'school_house_senate_districts_UNION',
			'sourceURL': 'mapbox://core-gis.a81c8ecf',
			'displayBehind': 'districts-of-innovation-points',
			'polygonLayerName': 'school_house_senate_districts_UNION-poly',
			'polygonFillColor': 'rgba(200, 100, 240, 0)',
			'polygonOutlineColor': 'rgba(200, 100, 240, 0)',
			'usedInZoomControl': true
		}
	);

	//add interactivity to the time slider
	document.getElementById('slider').addEventListener('input', function(e) {
		updateYearSlider('active-year', e.target.value);
	});

	runWhenLoadComplete();
});

/*

*****************************************************
These are the popups for the point layers
When a click event occurs on a feature in the point layer, open a popup at
the location of the click, with description HTML from its properties
*****************************************************
*/

// generalised code to add district info
function expandDistrictInfo(district) {
// make sure we have a district to use
if (district.length > 0 && district[0].layer.id === 'school_house_senate_districts_UNION-poly') {
	data = district[0].properties;
	var html = "<hr class='divider'/>";
	html += "<span class='varname'>";
	html += showHouseDistricts ? "House District: " : "Senate District: ";
	html += "</span> <span class='attribute'>";
	html += showHouseDistricts ? data.HseDistNum : data.SenDistNum;
	html += "</span>";
	return html;
} else {
	// if there's no appropriate district match, then just return an empty string so we don't get "undefined" in the popup
	return '';
}
}

//raising blended learners campuses popup
map.on('click', 'raising-blended-learners-campuses-points', function (e) {
	var district = map.queryRenderedFeatures(e.point, {layers: ['school_house_senate_districts_UNION-poly']});
	popup = new mapboxgl.Popup()
		.setLngLat(e.lngLat)
		.setHTML(fillpopup_rbl(e.features[0].properties) + expandDistrictInfo(district))
		.addTo(map);
	popupYear = e.features[0].properties.year;
});

// Change the cursor to a pointer when the mouse is over the points layer.
map.on('mouseenter', 'raising-blended-learners-campuses-points', function () {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'raising-blended-learners-campuses-points', function () {
	map.getCanvas().style.cursor = '';
});

map.on('zoomend', function() { updateStatsBox(); });

function fillpopup_rbl(data){
	var endyear = parseInt(data.year) + 4
	var html = "";
	html = html + "<span class='varname'>District: </span> <span class='attribute'>" + data.school_district + "</span>";
	html = html + "<br />"
	html = html + "<span class='varname'>Years: </span> <span class='attribute'>" + data.year + " - " + endyear + "</span>";
	html = html + "<br />"
	html = html + "<span class='varname'>Grades: </span> <span class='attribute'>" + data.grades_served + "</span>";
	return html;
	//this will return the string to the calling function

}

//charles butt scholars popup
map.on('click', 'charles-butt-scholars-points', function (e) {
	var district = map.queryRenderedFeatures(e.point, {layers: ['school_house_senate_districts_UNION-poly']});
	popup = new mapboxgl.Popup()
		.setLngLat(e.lngLat)
		.setHTML(fillpopup_cbs(e.features[0].properties) + expandDistrictInfo(district))
		.addTo(map);
	popupYear = e.features[0].properties.year;
});

 // Change the cursor to a pointer when the mouse is over the points layer.
	map.on('mouseenter', 'charles-butt-scholars-points', function () {
		map.getCanvas().style.cursor = 'pointer';
	});

	// Change it back to a pointer when it leaves.
	map.on('mouseleave', 'charles-butt-scholars-points', function () {
		map.getCanvas().style.cursor = '';
	});

function fillpopup_cbs(data){
	var html = "";
	html = html + "<span class='varname'>Scholar's Name: </span> <span class='attribute'>" + data.full_name + "</span>";
	html = html + "<br />"
	html = html + "<span class='varname'>Year: </span> <span class='attribute'>" + data.year + "</span>";
	html = html + "<br />"
	html = html + "<span class='attribute'>" + '<a href="' + data.cb_scholar_url + '"' + " target='_blank'" + '>' + data.link + '</a>'+"</span>";
	return html;
	//this will return the string to the calling function

}

//institutes for higher education popup
map.on('click', 'raising-texas-teachers-points', function (e) {
	var district = map.queryRenderedFeatures(e.point, {layers: ['school_house_senate_districts_UNION-poly']});
	popup = new mapboxgl.Popup()
		.setLngLat(e.lngLat)
		.setHTML(fillpopup_rtt(e.features[0].properties) + expandDistrictInfo(district))
		.addTo(map);
	popupYear = e.features[0].properties.year;
});

 // Change the cursor to a pointer when the mouse is over the points layer.
	map.on('mouseenter', 'raising-texas-teachers-points', function () {
		map.getCanvas().style.cursor = 'pointer';
	});

	// Change it back to a pointer when it leaves.
	map.on('mouseleave', 'raising-texas-teachers-points', function () {
		map.getCanvas().style.cursor = '';
	});

function fillpopup_rtt(data){
	var html = "";
	html = html + "<span class='varname'>Institute: </span> <span class='attribute'>" + data.university_name + "</span>";
	html = html + "<br />"
	html = html + "<span class='varname'>Year: </span> <span class='attribute'>" + data.year + "</span>";
	return html;
	//this will return the string to the calling function

}


//raising school leaders popup
map.on('click', 'raising-school-leaders-points', function (e) {
	var district = map.queryRenderedFeatures(e.point, {layers: ['school_house_senate_districts_UNION-poly']});
	popup = new mapboxgl.Popup()
		.setLngLat(e.lngLat)
		.setHTML(fillpopup_rsl(e.features[0].properties) + expandDistrictInfo(district))
		.addTo(map);
	popupYear = e.features[0].properties.year;
});

 // Change the cursor to a pointer when the mouse is over the points layer.
	map.on('mouseenter', 'raising-school-leaders-points', function () {
		map.getCanvas().style.cursor = 'pointer';
	});

	// Change it back to a pointer when it leaves.
	map.on('mouseleave', 'raising-school-leaders-points', function () {
		map.getCanvas().style.cursor = '';
	});

function fillpopup_rsl(data){
	var html = "";
	html = html + "<span class='varname'>Institute: </span> <span class='attribute'>" + data.institute + "</span>";
	html = html + "<br />"
	html = html + "<span class='varname'>Campus: </span> <span class='attribute'>" + standardizeCase(data.campus) + "</span>";
	if (data.district) {
		html = html + "<br />"
		html = html + "<span class='varname'>School District: </span> <span class='attribute'>" + standardizeCase(data.district) + "</span>";
	html = html + "<br />"
	html = html + "<span class='varname'>Year: </span> <span class='attribute'>" + data.year + "</span>";
	}
	return html;
	//this will return the string to the calling function

}