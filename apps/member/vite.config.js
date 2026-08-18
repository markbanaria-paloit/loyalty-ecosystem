import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The member app calls the backend BFF, never the loyalty platform directly:
// the BFF enrols the member with the `loyaltyCardNumber` the QR encodes, grants
// the enrolment bonus, and serves the points balance and history. `/api` is
// proxied to it so the browser sees a single origin.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // This app is on React 19 while its monorepo siblings are on 18, so npm
    // keeps React 19 nested here and hoists shared deps (framer-motion) to the
    // root — where they would bind to React 18 and produce two copies of React
    // in one tree. Dedupe forces every `react` import to resolve from this app.
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: true,
    // Pinned off 5173–5176 so it never collides with the loyalty-ecosystem apps.
    port: 5180,
    proxy: {
      '/api': {
        target: process.env.BACKEND_BASE_URL ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
