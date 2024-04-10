import react from '@vitejs/plugin-react';
import { defineConfig } from "electron-vite";
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import tsconfigPaths from "vite-tsconfig-paths";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    main: {},
    preload: {},
    renderer: {
        root: resolve(__dirname, '../Src/WitsmlExplorer.Frontend'),
        plugins: [react(), tsconfigPaths()],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, '../Src/WitsmlExplorer.Frontend/index.html')
                }
            }
        },
        server: {
            port: 3000
        }
    }
});
