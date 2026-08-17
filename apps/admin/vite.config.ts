import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The cockpit talks to OpenLoyalty directly (not through the member BFF) —
 * same as the real OpenLoyalty admin console. `/api` is proxied straight to the
 * OpenLoyalty instance, so the browser sees a single origin.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.OPENLOYALTY_BASE_URL ?? 'http://localhost:8181',
        changeOrigin: true,
      },
    },
  },
});
