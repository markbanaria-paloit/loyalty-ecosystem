import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The POS talks to OpenLoyalty directly — a till registers transactions against
 * the loyalty engine, not through the member BFF. `/api` is proxied straight to
 * the OpenLoyalty instance so the browser sees a single origin.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: process.env.OPENLOYALTY_BASE_URL ?? 'http://localhost:8181',
        changeOrigin: true,
      },
    },
  },
});
