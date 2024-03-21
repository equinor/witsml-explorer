import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    // Define your output directory if different from the default 'dist'
    outDir: "build"
  },
  server: {
    port: 3000
  }
});
