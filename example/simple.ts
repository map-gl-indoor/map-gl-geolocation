import { Map as MapboxMap } from 'mapbox-gl';
import { addGeolocationTo, GeolocationControl, MapboxMapWithGeoloc } from '../src/index';

import 'mapbox-gl/dist/mapbox-gl.css';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!

const accessToken = "pk.eyJ1IjoidGhpYmF1ZC1taWNoZWwiLCJhIjoiY2sxODFicG83MGUzMjNlbXpydDRzdHBtdiJ9.vIUDkExus2d7R7bhK2AqPg";

const map = new MapboxMap({
    container: app,
    zoom: 18,
    center: [3.883528, 43.608749],
    style: 'mapbox://styles/mapbox/streets-v10',
    accessToken,
}) as MapboxMapWithGeoloc;

addGeolocationTo(map);

map.geolocation.position = ({
    lat: 43.608749,
    lng: 3.883528,
    accuracy: 10
});
map.geolocation.heading = 280;

map.addControl(new GeolocationControl());
