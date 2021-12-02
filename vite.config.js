// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'mapgl_geolocation',
            fileName: (format) => `map-gl-geolocation.${format}.js`
        },
        rollupOptions: {
            external: ['mapbox-gl'],
            output: {
                globals: {
                    'mapbox-gl': 'mapboxgl'
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name == 'style.css')
                        return 'map-gl-geolocation.css';
                    return assetInfo.name;
                }
            }
        }
    }
});
