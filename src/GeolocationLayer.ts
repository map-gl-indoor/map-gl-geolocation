
import { approximateLengthOfAPixel, createMarker } from './utils/MapGLUtils';
import { boundsOfPositionWithAccuracy } from './utils/GeoUtils';

import type { Heading, Position, MapboxMapWithGeoloc, GeolocationLayerOptions } from './Types';
import type { Marker } from 'mapbox-gl';
import type { MapboxMapWithIndoor } from 'map-gl-indoor';

import './GeolocationLayer.css';

/**
 * Delay to consider that a position is old (in ms)
 */
// const POSITION_OLD_THRESHOLD = 15000;

const DefaultOptions: GeolocationLayerOptions = {
    trackUserLocation: {
        autoZoom: true,
        autoZoomPaddingPercentage: 75,
        autoZoomDefaultAccuracy: 50
    },
    maxZoom: 21,
    minimumAccuracyCircleRadius: 18
}

class GeolocationLayer {

    /**
     * Map
     */
    private map: MapboxMapWithGeoloc;
    private options: GeolocationLayerOptions;

    /**
     * Geopose
     */
    private _position: Position | null = null;
    private _heading: Heading | null = null;

    /**
     * DOM
     */
    private mapMarker?: Marker;
    private positionIcon: HTMLDivElement;
    private accuracyCircle: HTMLDivElement;
    private blueDot: HTMLDivElement;
    private compassIcon: HTMLDivElement;

    /**
     * Renderers states
     */
    private positionRendered: boolean = false;
    private headingRendered: boolean = false;
    private isPositionAccuracyRendered: boolean = false;

    /**
     * Tracking
     */
    private _trackUserLocation: boolean = true;

    // private isFirstPositionFound: boolean = false;
    // private isPositionOld: boolean = false;


    constructor(map: MapboxMapWithGeoloc, options: GeolocationLayerOptions = DefaultOptions) {

        /**
         * Check parameters
         */
        if (!map) {
            throw new TypeError('map cannot be null');
        }
        this.map = map;
        this.options = Object.assign({}, DefaultOptions, options);


        /**
         * Handle map interactions 
         */

        map.on('zoom', () => {
            if (this.position) {
                this.renderPositionAccuracy();
            }
        });
        map.on('mousedown', () => (this.trackUserLocation = false));
        map.on('touchstart', () => (this.trackUserLocation = false));
        map.on('wheel', () => (this.trackUserLocation = false));

        if (typeof (this.map as MapboxMapWithIndoor).indoor !== 'undefined') {
            map.on('indoor.control.clicked', () => {
                this._trackUserLocation = false;
            });
            map.on('indoor.level.changed', () => {
                this.renderPosition();
                if (this.position && this._trackUserLocation) {
                    this.centerOnCamera();
                }
            });
            map.on('indoor.map.loaded', () => {
                this.renderPosition();
                if (this.position && this._trackUserLocation) {
                    this.centerOnCamera();
                }
            });
        }

        /**
         * Create DOM elements
         */

        // Main element
        this.positionIcon = document.createElement('div');

        // Accuracy circle
        this.accuracyCircle = document.createElement('div');
        this.accuracyCircle.id = 'mapgl-geolocation-marker-accuracy';
        this.positionIcon.appendChild(this.accuracyCircle);

        // Blue dot
        this.blueDot = document.createElement('div');
        this.blueDot.id = 'mapgl-geolocation-marker';
        this.positionIcon.appendChild(this.blueDot);

        // Compass cone
        this.compassIcon = document.createElement('div');
        this.compassIcon.id = 'mapgl-geolocation-marker-compass';

    }


    /**
     * Geo location logic
     */

    set position(position: Position | null) {
        if (this._position === position) {
            return;
        }

        this._position = position || null;

        this.renderPosition();
        this.renderPositionAccuracy();

        if (position && this._trackUserLocation) {
            this.centerOnCamera();
        }

        this.map.fire('geolocation.position.changed', { position });
    }

    get position(): Position | null {
        return this._position;
    }

    set heading(heading: Heading | null) {
        if (this._heading === heading) {
            return;
        }

        this._heading = heading;

        this.renderHeading();

        this.map.fire('geolocation.heading.changed', { heading });
    }

    get heading(): Heading | null {
        return this._heading;
    }


    /**
     * Renderers
     */

    private renderPosition() {

        /*
         * Temporarly removed 'old position' behavior because this approach does not work with
         * positions injected
         */

        // if (position) {

        //     const isPositionOld = typeof position.timestamp === 'number'
        //         && new Date().getTime() - position.timestamp > POSITION_OLD_THRESHOLD;

        //     if (!this.isPositionOld && isPositionOld) {

        //         this.blueDot.classList.add('inaccurate');
        //         this.accuracyCircle.classList.add('inaccurate');
        //         this.isPositionOld = isPositionOld;

        //     } else if (this.isPositionOld && !isPositionOld) {

        //         this.blueDot.classList.remove('inaccurate');
        //         this.accuracyCircle.classList.remove('inaccurate');
        //         this.isPositionOld = isPositionOld;

        //     }
        // }

        let showPosition: boolean = this.position !== null;

        const position = this.position!;

        if (showPosition && typeof (this.map as MapboxMapWithIndoor).indoor !== 'undefined') {
            const indoorLayer = (this.map as MapboxMapWithIndoor).indoor;
            showPosition = indoorLayer.getLevel() === null
                || typeof position.level !== 'number'
                || indoorLayer.getLevel() === position.level;
        }

        if (showPosition && !this.positionRendered) {
            this.mapMarker = createMarker({
                dom: this.positionIcon,
                iconAnchor: [0, 0],
                latitude: position.lat,
                longitude: position.lng
            }).addTo(this.map);

        } else if (!showPosition) {
            this.mapMarker?.remove();
        } else if (showPosition) {
            this.mapMarker?.setLngLat([position.lng, position.lat]);
        }

        this.positionRendered = showPosition;
    }


    private renderPositionAccuracy() {

        const position = this._position;

        let showAccuracy = position !== null && typeof position.accuracy === 'number';

        if (showAccuracy && position!.accuracy) {

            const radiusInPx = position!.accuracy / approximateLengthOfAPixel(this.map, this.position!);

            if (radiusInPx < this.options.minimumAccuracyCircleRadius) {
                // accuracy is to small to be rendered
                showAccuracy = false;
            } else {
                this.accuracyCircle.style.width = `${radiusInPx * 2}px`;
                this.accuracyCircle.style.height = `${radiusInPx * 2}px`;
                this.accuracyCircle.style.top = `-${radiusInPx}px`;
                this.accuracyCircle.style.left = `-${radiusInPx}px`;
            }
        }

        if (showAccuracy && !this.isPositionAccuracyRendered) {
            this.positionIcon.appendChild(this.accuracyCircle);
        } else if (!showAccuracy && this.isPositionAccuracyRendered) {
            this.positionIcon.removeChild(this.accuracyCircle);
        }

        this.isPositionAccuracyRendered = showAccuracy;
    }

    private renderHeading = () => {

        const heading = this._heading;

        const showHeading = typeof heading === 'number';

        if (!this.headingRendered && showHeading) {
            this.positionIcon.appendChild(this.compassIcon);
        } else if (this.headingRendered && !showHeading) {
            this.positionIcon.removeChild(this.compassIcon);
        }

        if (showHeading) {
            this.positionIcon.style.transform = 'rotate(' + heading + 'deg)';
        }

        this.headingRendered = showHeading;
    }

    /**
     * Tracking
     */

    set trackUserLocation(trackUserLocation: boolean) {
        if (this.trackUserLocation === trackUserLocation) {
            return;
        }
        this._trackUserLocation = trackUserLocation;
        if (trackUserLocation) {
            this.centerOnCamera();
        }
        this.map.fire('geolocation.trackUserLocation.changed', { trackUserLocation });
    }

    get trackUserLocation(): boolean {
        return this._trackUserLocation;
    }

    private centerOnCamera() {

        if (!this.position || this.map.isMoving()) {
            return;
        }

        const { trackUserLocation: trackUserLocationOptions } = this.options;

        let transform;

        if (trackUserLocationOptions.autoZoom) {

            // First, calculate if autoZoom is necessary

            const accuracyToConsider = typeof this.position.accuracy === 'number'
                ? this.position.accuracy
                : trackUserLocationOptions.autoZoomDefaultAccuracy;

            const canvasWidth = this.map.getCanvas().width / window.devicePixelRatio;
            const approximateHorizontalCanvasDistance =
                canvasWidth * approximateLengthOfAPixel(this.map, this.position);

            if (approximateHorizontalCanvasDistance > accuracyToConsider * 16
                || approximateHorizontalCanvasDistance < accuracyToConsider * 2) {


                // Secondly, calculate the padding to apply

                let paddingToTest = Math.min(
                    canvasWidth,
                    this.map.getCanvas().height / window.devicePixelRatio
                ) * 0.5 * trackUserLocationOptions.autoZoomPaddingPercentage / 100;
               
                do {

                    transform = this.map.cameraForBounds(
                        boundsOfPositionWithAccuracy(this.position, accuracyToConsider),
                        {
                            bearing: this.map.getBearing(),
                            maxZoom: this.options.maxZoom,
                            padding: paddingToTest
                        }
                    );

                    paddingToTest /= 2;

                } while (!transform && paddingToTest > 1);

            }
        }

        if (!transform) {
            transform = { center: this.position };
        }

        this.map.jumpTo(transform);

        if (typeof (this.map as MapboxMapWithIndoor).indoor !== 'undefined') {
            const indoorLayer = (this.map as MapboxMapWithIndoor).indoor;

            if (indoorLayer.getSelectedMap() !== null
                && typeof this.position.level === 'number'
                && this.position.level !== indoorLayer.getLevel()) {
                indoorLayer.setLevel(this.position.level);
            }
        }
    }

}
export default GeolocationLayer;
