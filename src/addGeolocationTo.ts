import GeolocationLayer from './GeolocationLayer';

import type { MapboxMapWithGeoloc, GeolocationLayerOptions } from './Types';
import type { Map as MapboxMap } from 'mapbox-gl';

export default function addGeolocationTo(map: MapboxMap, options?: GeolocationLayerOptions): MapboxMapWithGeoloc {
    Object.defineProperty(
        map,
        'geolocation',
        {
            get: function () {
                if (!this._geolocation) {
                    this._geolocation = new GeolocationLayer(this, options);
                }
                return this._geolocation;
            }
        });

    return map as MapboxMapWithGeoloc;
}
