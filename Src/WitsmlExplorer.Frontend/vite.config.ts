/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  // port for preview
  preview: {
    port: 3000
  },

  // port for dev
  server: {
    port: 3000
  }
});
