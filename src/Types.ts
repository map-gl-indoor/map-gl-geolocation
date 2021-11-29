import type { Evented, Map as MapboxMap } from 'mapbox-gl';
import { EnhancedMapboxMap as IndoorMapboxMap } from 'map-gl-indoor';

import GeolocationLayer from './GeolocationLayer';

export type LngLat = {
    lng: number,
    lat: number
};

// in WSEN (West-South-East-North) order
export type Bounds = [number, number, number, number];

export type Position = LngLat & {
    accuracy?: number,
    timestamp?: number,
    level?: number | null
}

// in degrees
export type Heading = number;

export type EnhancedMapboxMap = (MapboxMap | IndoorMapboxMap) & {
    geolocation: GeolocationLayer
};

export type { IndoorMapboxMap };

export type GeolocationLayerOptions = {
    trackUserLocation: {
        autoZoom: boolean,
        autoZoomPadding: number
    }
    maxZoom: number,
    minimumAccuracyCircleRadius: number // in pixels
};

export type GeolocationProviderEventType = {
    positionchanged: Position,
    headingchanged: Heading
}

export interface GeolocationProvider extends Evented {
    start: () => void,
    stop: () => void

    fire(type: string, properties?: { [key: string]: any }): this;
    on(type: string, listener: (ev: any) => void): this;
    off(type: string, listener: (ev: any) => void): this;
}
