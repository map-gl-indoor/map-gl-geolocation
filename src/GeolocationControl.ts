import GeolocationLayer from './GeolocationLayer';

import type { EnhancedMapboxMap, GeolocationProvider } from './Types';
import type { IControl, Map as MapboxMap } from 'mapbox-gl';

enum State {
    IDLE = 0,
    WAITING = 1,
    ACTIVE = 2,
    ACTIVE_BACKGROUND = 3
};

type DomElements = {
    container: HTMLElement,
    buttonLocateMe: HTMLButtonElement,
    buttonStopNav: HTMLButtonElement
}

class GeolocationControl implements IControl {

    private map?: EnhancedMapboxMap;
    private geolocationLayer?: GeolocationLayer;

    private geolocationProvider?: GeolocationProvider;
    private isProviderStarted: boolean = false;

    private domElements?: DomElements;

    private state: State = State.IDLE;

    constructor(geolocationProvider?: GeolocationProvider) {
        this.geolocationProvider = geolocationProvider;
    }

    onAdd(map: MapboxMap | EnhancedMapboxMap): HTMLElement {

        if ((map as EnhancedMapboxMap).geolocation !== undefined) {
            throw Error('call addGeolocationTo(map) before creating the control');
        }

        this.map = map as EnhancedMapboxMap;
        this.geolocationLayer = this.map.geolocation;

        map.on('geolocation.position.changed', this.onPositionChanged);
        this.onPositionChanged();

        map.on('geolocation.trackUserLocation.changed', this.onTrackUserLocationChanged);
        this.onTrackUserLocationChanged();

        this.geolocationProvider?.on('position.changed', this.onProviderPositionChanged);
        this.geolocationProvider?.on('heading.changed', this.onProviderHeadingChanged);

        const domElements = this.domElements = this.createDOMButtons();
        this.handleButtonsLogic(domElements, this.map.geolocation);

        return domElements.container;
    }

    onRemove() {
        this.map?.off('geolocation.position.changed', this.onPositionChanged);
        this.map?.off('geolocation.trackUserLocation.changed', this.onTrackUserLocationChanged);
        this.geolocationProvider?.off('position.changed', this.onProviderPositionChanged);

        this.domElements?.container.remove();
    }

    private onPositionChanged = () => {
        this.updateStateIfNecessary();
    }

    private onTrackUserLocationChanged = () => {
        this.updateStateIfNecessary();
    }

    private updateStateIfNecessary() {
        const newState = this.calcState();
        if (newState !== this.state) {
            this.updateStateUI(newState);
            this.state = newState;
        }
    }

    private calcState(): State {
        if (!this.geolocationLayer) {
            return State.IDLE;
        }

        const { position, trackUserLocation } = this.geolocationLayer;
        if (position) {
            if (trackUserLocation) {
                return State.ACTIVE;
            }
            return State.ACTIVE_BACKGROUND
        }
        if (this.isProviderStarted) {
            return State.WAITING;
        }
        return State.IDLE;
    }

    private updateStateUI(newState: State) {

        if (!this.domElements) {
            return;
        }
        const { buttonLocateMe } = this.domElements;

        if (this.state === State.ACTIVE) {
            buttonLocateMe.classList.remove('mapboxgl-ctrl-geolocate-active');
        }
        else if (this.state === State.ACTIVE_BACKGROUND) {
            buttonLocateMe.classList.remove('mapboxgl-ctrl-geolocate-background');
        }
        else if (this.state === State.WAITING) {
            buttonLocateMe.classList.remove('mapboxgl-ctrl-geolocate-active');
            buttonLocateMe.classList.remove('mapboxgl-ctrl-geolocate-waiting');
        }

        if (newState === State.ACTIVE) {
            buttonLocateMe.classList.add('mapboxgl-ctrl-geolocate-active');
        }
        else if (newState === State.ACTIVE_BACKGROUND) {
            buttonLocateMe.classList.add('mapboxgl-ctrl-geolocate-background');
        }
        else if (newState === State.WAITING) {
            buttonLocateMe.classList.add('mapboxgl-ctrl-geolocate-active');
            buttonLocateMe.classList.add('mapboxgl-ctrl-geolocate-waiting');
        }
    }

    private createDOMButtons(): DomElements {

        /** 
         * Root container
         */

        const container = document.createElement('div');
        container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        container.id = 'user-location-container';

        /**
         * Locate me / Start nav
         */
        const buttonLocateMe = document.createElement('button');
        buttonLocateMe.type = 'button';
        buttonLocateMe.title = 'Find my location';
        buttonLocateMe.className = 'mapboxgl-ctrl-geolocate';
        container.appendChild(buttonLocateMe);

        const spanLocateMe = document.createElement('span');
        spanLocateMe.className = 'mapboxgl-ctrl-icon';
        buttonLocateMe.appendChild(spanLocateMe);

        /**
         * Stop Nav
         */
        const buttonStopNav = document.createElement('button');
        buttonStopNav.type = 'button';
        buttonStopNav.title = 'Remove my location';
        buttonStopNav.className = 'mapboxgl-ctrl-geolocate-remove';
        buttonStopNav.style.display = 'none';
        container.appendChild(buttonStopNav);

        const spanStopNav = document.createElement('span');
        spanStopNav.className = 'mapboxgl-ctrl-icon';
        buttonStopNav.appendChild(spanStopNav);

        return { container, buttonLocateMe, buttonStopNav };
    }

    private handleButtonsLogic(domElements: DomElements, geolocationLayer: GeolocationLayer) {

        const { buttonLocateMe, buttonStopNav } = domElements;
        buttonLocateMe.onclick = () => {
            geolocationLayer.trackUserLocation = true;
            if (this.geolocationProvider && !this.isProviderStarted) {
                this.geolocationProvider.start();
                this.isProviderStarted = true;
                buttonStopNav.style.display = 'block';
                this.updateStateIfNecessary();
            }
        };

        buttonStopNav.onclick = () => {
            if (this.geolocationProvider && this.isProviderStarted) {
                this.geolocationProvider.stop();
                this.isProviderStarted = false;
                buttonStopNav.style.display = 'none';
                this.updateStateIfNecessary();
            }
        }
    }

    /**
     * Handle providers logic
     */

    private onProviderPositionChanged = (evt: any) => {
        if (this.geolocationLayer) {
            this.geolocationLayer.position = evt.position;
        }
    }
    private onProviderHeadingChanged = (evt: any) => {
        if (this.geolocationLayer) {
            this.geolocationLayer.heading = evt.heading;
        }
    }
}

export default GeolocationControl;
