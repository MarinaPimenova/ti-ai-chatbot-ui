import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 7000,
    proxy: {
      // Forwards REST/SSE calls to the local gateway during `npm run dev`,
      // so the app works without seeding the `ORIGINAL` cookie that
      // `getServerUrl` reads in production.
      '/rest': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        // Allows importing SVGs directly as React components
        exportType: 'default',
      },
    }),
  ],
  base: '/chat',  // Set the base URL for the app
  optimizeDeps: {
    exclude: ['@tanstack/react-query'],
  },
  build: {
    minify: true,
    sourcemap: false,
    target: 'es2015',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // or "modern"
      } as any,
    }
  }
});