// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite');

module.exports = defineConfig({
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