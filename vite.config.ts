import { defineConfig } from 'vite';
import path from 'path';

const PACKAGE_VERSION = process.env.npm_package_version || '0.0.0';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(PACKAGE_VERSION),
  },
  base: '/tiny-fixers/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3456,
  },
});