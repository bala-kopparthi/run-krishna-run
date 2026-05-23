import { defineConfig } from 'vite';

// Simple Vite config: open browser on `npm run dev`.
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    target: 'es2019'
  }
});
