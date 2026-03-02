import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(() => {
  // Use VITE_API_URL from environment, with fallback to localhost:4000
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:4000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
