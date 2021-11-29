# MapGL Geolocation Plugin

A [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js) plugin to enable custom geolocation providers.

The project should works with [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) too.

![Screenshot](/assets/screenshot.png)

__Note:__ This is a work in progress and we welcome contributions.

## Usage

```js
import { Map } from 'mapbox-gl';
import { addGeolocationTo, GeolocationControl } from 'map-gl-geolocation';

const map = new Map({
    accessToken,
    container,
    style: 'mapbox://styles/mapbox/streets-v10'
});

// Create the geoloc logic behind the map.geolocation property
addGeolocationTo(map);

// Set the position and the heading to a custom location
map.geolocation.position = ({ lat: 43.608749, lng: 3.883528, accuracy: 10 });
map.geolocation.heading = 280;

// Add the specific control
map.addControl(new GeolocationControl());
```

## Options

- Custom provider
- Indoor support (https://github.com/map-gl-indoor/map-gl-indoor)

Refer to [example](example/) for usage.


## Test the project / Contribute

    npm install & npm run dev

Go to http://localhost:3000/example/
