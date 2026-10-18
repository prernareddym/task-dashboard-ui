import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During `npm run dev` the UI calls the API through a same-origin /api proxy,
// so no CORS configuration is needed on the backend.
const apiTarget = process.env.API_URL ?? 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: apiTarget, changeOrigin: true } },
  },
});
