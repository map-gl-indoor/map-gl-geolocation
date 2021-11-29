// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'MapGLGeolocation',
            fileName: (format) => `map-gl-geolocation.${format}.js`
        },
        rollupOptions: {
            external: ['mapbox-gl'],
            output: {
                globals: {
                    'mapbox-gl': 'mapboxgl'
                }
            }
        }
    }
});