import { Map as MapboxMap } from 'mapbox-gl';
import { addIndoorTo, IndoorControl, IndoorMap } from 'map-gl-indoor';
import { addGeolocationTo, GeolocationControl } from '../src/index';

import type { MapboxMapWithIndoor } from 'map-gl-indoor';
import type { MapboxMapWithGeoloc } from '../src/index';

import 'mapbox-gl/dist/mapbox-gl.css';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!

const accessToken = "pk.eyJ1IjoidGhpYmF1ZC1taWNoZWwiLCJhIjoiY2sxODFicG83MGUzMjNlbXpydDRzdHBtdiJ9.vIUDkExus2d7R7bhK2AqPg";

const map = new MapboxMap({
    container: app,
    zoom: 18,
    center: [2.3592843, 48.8767904],
    style: 'mapbox://styles/mapbox/streets-v10',
    accessToken,
}) as MapboxMapWithGeoloc & MapboxMapWithIndoor;

addIndoorTo(map);
addGeolocationTo(map);

map.addControl(new IndoorControl());
map.addControl(new GeolocationControl());

// Retrieve the geojson from the path and add the map
const geojson = await (await fetch('maps/gare-de-l-est.geojson')).json();
map.indoor.addMap(IndoorMap.fromGeojson(geojson));

// Set a custom location with a level
map.geolocation.position = ({
    lat: 48.8767904,
    lng: 2.3592843,
    accuracy: 10,
    level: -1
});
map.geolocation.heading = 280;
