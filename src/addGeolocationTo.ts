import GeolocationLayer from './GeolocationLayer';

import type { EnhancedMapboxMap } from './Types';
import type { Map as MapboxMap } from 'mapbox-gl';

export default function addGeolocationTo(map: MapboxMap): EnhancedMapboxMap {
    Object.defineProperty(
        map,
        'geolocation',
        {
            get: function () {
                if (!this._geolocation) {
                    this._geolocation = new GeolocationLayer(this);
                }
                return this._geolocation;
            }
        });

    return map as EnhancedMapboxMap;
}
