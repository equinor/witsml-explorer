import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import tsconfigPaths from "vite-tsconfig-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  main: {
    build: {
      outDir: "dist/main"
    }
  },
  preload: {
    build: {
      outDir: "dist/preload"
    }
  },
  renderer: {
    root: resolve(__dirname, "../WitsmlExplorer.Frontend"),
    plugins: [react(), tsconfigPaths()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "../WitsmlExplorer.Frontend/index.html")
        }
      },
      outDir: "dist/renderer"
    },
    server: {
      port: 3000
    }
  }
});
