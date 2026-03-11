import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES_BASE || '/',
  server: { host: true, port: 5173 },
  build: { outDir: 'dist' },
  publicDir: 'data',
});
