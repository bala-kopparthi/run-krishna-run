import { defineConfig } from 'vite';

// Simple Vite config: open browser on `npm run dev`.
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    host: true,           // bind to 0.0.0.0 so preview proxies / LAN can reach it
    strictPort: false
  },
  build: {
    outDir: 'dist',
    target: 'es2019'
  }
});
