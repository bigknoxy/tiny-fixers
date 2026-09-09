import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const PACKAGE_VERSION = process.env.npm_package_version || '0.0.0';
const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(PACKAGE_VERSION),
  },
  base: '/tiny-fixers/',
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('phaser')) return 'phaser';
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3456,
  },
});