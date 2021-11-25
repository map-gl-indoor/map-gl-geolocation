import GeolocationLayer from './GeolocationLayer';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { EnhancedMapboxMap } from './Types';

export function addGeolocationTo(map: MapboxMap): EnhancedMapboxMap {
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

    return map;
}

export { default as GeolocationControl } from './GeolocationControl';