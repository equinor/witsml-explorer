/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  // port for production
  // preview: {
  //   port: 3000,
  // },

  // port for dev
  server: {
    port: 3000
  },

  // test config
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    css: true
  }
});

// /// <reference types="vitest" />
// /// <reference types="vite/client" />

// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   test: {
//     globals: true,
//     environment: 'jsdom',
//     setupFiles: ['./src/setup.ts'],
//     pool: 'forks',
//   },
// })
