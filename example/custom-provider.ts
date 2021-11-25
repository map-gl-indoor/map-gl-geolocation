import { Map, Evented, LngLat } from 'mapbox-gl';
import bearing from '@turf/bearing';
import destination from '@turf/destination';
import distance from '@turf/distance';
import { addGeolocationTo, GeolocationControl } from '../src/index';

import './style.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeolocationProvider } from '../src/Types';

const app = document.querySelector<HTMLDivElement>('#app')!

const accessToken = "pk.eyJ1IjoidGhpYmF1ZC1taWNoZWwiLCJhIjoiY2sxODFicG83MGUzMjNlbXpydDRzdHBtdiJ9.vIUDkExus2d7R7bhK2AqPg";

const map = new Map({
    container: app,
    zoom: 18,
    center: [3.883528, 43.608749],
    style: 'mapbox://styles/mapbox/streets-v10',
    accessToken
});

addGeolocationTo(map);

class Simulator extends Evented implements GeolocationProvider {

    samples: LngLat[];
    ms: number;
    curId: number;
    intervalId?: NodeJS.Timer;

    constructor(start, end, sampleDist, ms) {
        super();
        this.samples = this.sampleRoute(start, end, sampleDist);
        this.ms = ms;
        this.curId = 0;
    }

    start() {
        this.intervalId = setInterval(() => this.consumeRoute(), this.ms);
    }

    stop() {
        clearInterval(this.intervalId);
    }

    consumeRoute() {
        const pt = this.samples[this.curId];
        const position = Object.assign({ accuracy: 10 }, pt);
        const heading = 280;

        this.fire('position.changed', { position });
        this.fire('heading.changed', { heading });

        this.curId = (this.curId + 1) % this.samples.length;
    }


    sampleRoute(start, end, sampleDist) {
        const turf_start = [start.lng, start.lat];
        const turf_end = [end.lng, end.lat];
        const _distance = distance(turf_start, turf_end, { units: "meters" });
        const _bearing = bearing(turf_start, turf_end);

        const samples = [start];
        let curDistance = sampleDist;
        while (curDistance < _distance) {
            const { geometry } = destination(turf_start, curDistance, _bearing, { units: "meters" });
            samples.push({ lat: geometry.coordinates[1], lng: geometry.coordinates[0] });
            curDistance += sampleDist;
        }

        return samples;
    }
}


const simulator = new Simulator(
    { lat: 43.608749, lng: 3.883528 },
    { lat: 43.609040, lng: 3.881970 },
    1, 300
);

map.addControl(new GeolocationControl(simulator));
