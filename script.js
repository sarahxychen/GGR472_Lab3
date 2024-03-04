// Add basemap
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FyYWh4eWNoZW4iLCJhIjoiY2xyZnB4c2h0MDhnMzJqcGpvZ2sxOHk4byJ9.yIz3cOJ6CJBeoUb3hvbBFA'; //Add default public map token from your Mapbox account

const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/sarahxychen/clskmpfs603tf01p25v25bs4j', // style URL
    center: [-79.373958, 43.664337], // starting position [lng, lat] 
    zoom: 11.72 // starting zoom
});

// add zoom control
map.addControl(new mapboxgl.NavigationControl());

// Add biking parking point GeoJSON

map.on('load', () => {
    map.addSource('Bike-parking', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/sarahxychen/GGR472_Lab2Git/main/bike_parking.geojson' 
        });

    map.addLayer({ // Styling source data
        'id': 'parking-point', 
        'type': 'circle', 
        'source': 'Bike-parking', 
        'paint': {
            'circle-radius': 5,
            'circle-color': '#fb32b5' 
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