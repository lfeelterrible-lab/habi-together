import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '..');

export default defineConfig({
  root: currentDir,
  base: '/habi-together/',
  publicDir: path.join(projectRoot, 'public'),
  plugins: [react()],
  build: {
    outDir: path.join(projectRoot, 'dist/client'),
    emptyOutDir: true,
  },
});
