import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The studio talks to the backend, not to OpenLoyalty directly — the campaign
 * agent needs the Anthropic key, which must stay server-side. `/api` is proxied
 * to the backend so the browser sees a single origin.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
