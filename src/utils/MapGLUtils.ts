import { Marker } from 'mapbox-gl';


// https://stackoverflow.com/a/39006388/2239938
export function createGeoJSONCircle(center: number[], radiusInKm: number, points: number) {
    if (!points) {
        points = 64;
    }

    var coords = {
        latitude: center[1],
        longitude: center[0]
    };

    var km = radiusInKm;

    var ret = [];
    var distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
    var distanceY = km / 110.574;

    var theta, x, y;
    for (let i = 0; i < points; i++) {
        theta = (i / points) * (2 * Math.PI);
        x = distanceX * Math.cos(theta);
        y = distanceY * Math.sin(theta);

        ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);
    return ret;
}

export type MarkerOptions = {
    iconAnchor?: number[],
    dom?: Node,
    latitude: number,
    longitude: number
}

export function createMarker(options: MarkerOptions) {
    const elem = document.createElement('div');
    if (options.iconAnchor) {
        elem.style.marginLeft = '-' + options.iconAnchor[0] + 'px';
        elem.style.marginTop = '-' + options.iconAnchor[1] + 'px';
    }
    elem.style.width = '0';
    elem.style.height = '0';
    if (options.dom) {
        elem.appendChild(options.dom);
    }

    const marker = new Marker(elem);
    marker.setLngLat([options.longitude, options.latitude]);
    return marker;
}

