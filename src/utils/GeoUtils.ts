import { EARTH_CIRCUMFERENCE } from './GeoConstants';

import type { Bounds, LngLat, Position } from '../Types';

export function boundsFromLngLatAndRadius(lngLat: LngLat, radius: number = 0): Bounds {
    const latAccuracy = 360 * radius / EARTH_CIRCUMFERENCE;
    const lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * lngLat.lat);

    return [
        lngLat.lng - lngAccuracy,
        lngLat.lat - latAccuracy,
        lngLat.lng + lngAccuracy,
        lngLat.lat + latAccuracy
    ];
}

export function boundsOfPositionWithAccuracy(position: Position, defaultAccuracy: number = 0): Bounds {
    return boundsFromLngLatAndRadius(
        position,
        position.accuracy ? position.accuracy : defaultAccuracy
    );
}
