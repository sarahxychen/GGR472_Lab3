// Add basemap and initialize map
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FyYWh4eWNoZW4iLCJhIjoiY2xyZnB4c2h0MDhnMzJqcGpvZ2sxOHk4byJ9.yIz3cOJ6CJBeoUb3hvbBFA'; //Add default public map token from your Mapbox account

const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/sarahxychen/clskmpfs603tf01p25v25bs4j', // style URL
    center: [-79.373958, 43.664337], // starting position [lng, lat] 
    zoom: 11.72 // starting zoom
});

// add zoom control
map.addControl(new mapboxgl.NavigationControl());

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
                '#fad9ee', // Colour assigned to any values < first step (so 0-7)
                8, '#fab1e0', // Colours assigned to values >= each step (8-9)
                10, '#f587ce', // >=(10-13)
                14, '#fb32b5', // >=(14)
            ]
        }
    });

});

// Add neighbourhood GeoJSON

map.on('load', () => {
    map.addSource('neighbourhoods', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/sarahxychen/GGR472_Lab3/main/neighbourhoods.geojson'
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

// Add toggle feature

// After the last frame rendered before the map enters an "idle" state.
map.on('idle', () => {
    // If these two layers were not added to the map, abort
    if (!map.getLayer('cycle-path') || !map.getLayer('parking-point')) {
    return;
    }
     
    // Enumerate ids of the layers.
    const toggleableLayerIds = ['cycle-path', 'parking-point'];
     
    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
    // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
        continue;
        }
     
    // Create a link.
    const link = document.createElement('a');
    link.id = id;
    link.href = '#';
    link.textContent = id;
    link.className = 'active';
     
    // Show or hide layer when the toggle is clicked.
    link.onclick = function (e) {
        const clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();
     
        const visibility = map.getLayoutProperty(
         clickedLayer,
        'visibility'
    );
     
    // Toggle layer visibility by changing the layout object's visibility property.
    if (visibility === 'visible') {
        map.setLayoutProperty(clickedLayer, 'visibility', 'none');
        this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(
            clickedLayer,
                'visibility',
                'visible'
            );
         }
    };
     
        const layers = document.getElementById('menu');
        layers.appendChild(link);
    }
});