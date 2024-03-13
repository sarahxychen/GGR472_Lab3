// Add basemap and initialize map
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FyYWh4eWNoZW4iLCJhIjoiY2xyZnB4c2h0MDhnMzJqcGpvZ2sxOHk4byJ9.yIz3cOJ6CJBeoUb3hvbBFA'; //Add default public map token from your Mapbox account

const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/sarahxychen/clskmpfs603tf01p25v25bs4j', // style URL
    center: [-79.373958, 43.664337], // starting position [lng, lat] 
    zoom: 11.72 // starting zoom
});

//Add search control to map overlay //restricted to Canada only search 
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: "ca"
    })
);

// add zoom control
map.addControl(new mapboxgl.NavigationControl());

// Add fullscreen option to the map
map.addControl(new mapboxgl.FullscreenControl());

// Add biking parking point GeoJSON (classified by interpolating zoom and bike point colour symbology by capacity of each parking station)

map.on('load', () => {
    map.addSource('Bike-parking', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/sarahxychen/GGR472_Lab2Git/main/bike_parking.geojson' 
        });

    map.addLayer({ 
        'id': 'parking-point', 
        'type': 'circle', 
        'source': 'Bike-parking', 
        'paint': {
            'circle-radius': [
                     'interpolate', //INTERPOLATE expression produces continuous results by interpolating between value pairs
                     ['linear'], //linear interpolation between stops but could be exponential ['exponential', base] where base controls rate at which output increases
                     ['zoom'], //zoom expression changes appearance with zoom level
                     10, 7, // when zoom is 10 (or less), radius will be 7px
                     12, 5 // when zoom is 12 (or greater), radius will 5px
                ],
            'circle-color': [
                'step', // STEP expression produces stepped results based on value pairs //Classify biking points based on type of bike parking capacity in column: Bicycle_capacity to display ramp colour on points
                ['get', 'BICYCLE_CAPACITY'], // GET expression retrieves property value from 'capacity' data field
                '#f07dcf', // Colour assigned to any values < first step (so 0-9)
                10, '#d10496', // Colours assigned to values >= each step (10-19)
                20, '#d9027c', // >=(20-29)
                30, '#9c0259', // >=(30-119)
                120, '#52022f', // >=(120)
            ]
        }
    });

});

//Add pop up for mouse click event to show bike parking information
map.on('mouseenter', 'parking-point', () => {
    map.getCanvas().style.cursor = 'pointer'; //Switch cursor to pointer when mouse is over parking points
});

map.on('mouseleave', 'parking-point', () => {
    map.getCanvas().style.cursor = ''; //Switch cursor back when mouse leaves parking points
});

map.on('click', 'parking-point', (e) => {
    new mapboxgl.Popup() //Declare new popup object on each click
        .setLngLat(e.lngLat) //Use method to set coordinates of popup based on mouse click location
        .setHTML( //Use click event properties to write text for popup
            "<b>Bike Parking Capacity:</b> " + "<br>" + e.features[0].properties.BICYCLE_CAPACITY + "<br>" + 
            "<b>Parking Type:</b> " + "<br>" + e.features[0].properties.PARKING_TYPE + "<br>" + 
            "<b>Address:</b> " + "<br>" + e.features[0].properties.LINEAR_NAME_FULL + "<br>" + 
            "<b>Neighbourhood</b> " + "<br>" + e.features[0].properties.WARD) 
        .addTo(map); //Show popup on map
});

// Add neighbourhood GeoJSON (includes change of visualization based on mouse event)

map.on('load', () => {
    map.addSource('neighbourhoods', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/sarahxychen/GGR472_Lab3/main/neighbourhoods.geojson' 
        });

    // Styling initial visualization
    map.addLayer({ 
        'id': 'neighbourhood', 
        'type': 'fill', 
        'source': 'neighbourhoods', 
        'paint': {
            'fill-color': '#d3cadb',
            'fill-opacity': 0.4,
            'fill-outline-color': 'black'
        },
    });

     //Styling second visualization of the neighbourhood polygon
     map.addLayer({
        'id': 'neighbourhood-hl', //Highlighted neighbourhood id 
        'type': 'fill',
        'source': 'neighbourhoods',
        'paint': {
            'fill-color': '#9580a8',
            'fill-opacity': 0.8, //Opacity set to 0.8 to see and interact with layers underneath still
            'fill-outline-color': 'black'
        },
        'filter': ['==', ['get', '_id'], ''] //Set an initial filter to return nothing
    });

});

//Add hover event to switch between visual 1 and 2 of neighbourhoods to highlight the neighbourhood polygon
map.on('mousemove', 'neighbourhood', (e) => {
    if (e.features.length > 0) { //if there are features in the event features array (i.e features under the mouse hover) then go into the conditional

        //set the filter of the provinces-hl to display the feature you're hovering over
        //e.features[0] is the first feature in the array and properties.PRUID is the Province ID for that feature
        map.setFilter('neighbourhood-hl', ['==', ['get', '_id'], e.features[0].properties._id]);

    }
 });

// Add cycling network GeoJSON

map.on('load', () => {
    map.addSource('Cycle-network', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/sarahxychen/GGR472_Lab2Git/main/cycling-network.geojson'
        });

    map.addLayer({ // Styling source data
        'id': 'cycle-path', 
        'type': 'line', 
        'source': 'Cycle-network', 
        'paint': {
            'line-width': 2,
            'line-color': '#9404fb' 
        }
    });
});

//Add pop up for mouse click event to show street name label
map.on('mouseenter', 'cycle-path', () => {
    map.getCanvas().style.cursor = 'pointer'; //Switch cursor to pointer when mouse is over cyling lanes
});

map.on('mouseleave', 'cycle-path', () => {
    map.getCanvas().style.cursor = ''; //Switch cursor back when mouse leaves cycling lanes
});

map.on('click', 'cycle-path', (e) => {
    new mapboxgl.Popup() //Declare new popup object on each click
        .setLngLat(e.lngLat) //Use method to set coordinates of popup based on mouse click location
        .setHTML("<b>Cyle Path:</b> " + "<br>" + e.features[0].properties.STREET_NAME + "<br>" + 
        "<b>Last Upgraded:</b> " + "<br>" + e.features[0].properties.UPGRADED) //Use click event properties to write text for popup
        .addTo(map); //Show popup on map
});


//Add toggle feature for 3 layers

//Change biking point layer display based on check box using setLayoutProperty method
document.getElementById('bikecheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'parking-point',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

//Change cycling lane layer display based on check box using setLayoutProperty method
document.getElementById('cyclecheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'cycle-path',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

//Change neighbourhood layer display based on check box using setLayoutProperty method
document.getElementById('neighbourcheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'neighbourhood',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});