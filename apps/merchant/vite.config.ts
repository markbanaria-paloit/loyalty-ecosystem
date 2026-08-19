import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The POS talks to the backend, not to OpenLoyalty.
 *
 * It used to hold a store credential and call the loyalty engine directly; that
 * credential now lives in the backend, which signs the till in and forwards the
 * handful of calls a till is allowed to make. `/api` is proxied there so the
 * browser sees a single origin — pointing it at OpenLoyalty instead means every
 * `/api/console` and `/api/ol` call answers 404, starting with sign-in.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: process.env.BACKEND_BASE_URL ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
