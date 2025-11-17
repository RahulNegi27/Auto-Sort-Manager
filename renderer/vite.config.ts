import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Use relative asset paths so Electron can load built files from file://
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: false,
    cors: true,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 3000
    }
  }
  ,
  build: {
    // Disable source maps to avoid missing .map files when loading from file://
    sourcemap: false
  }
});
