import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: { port: 4173 },
  preview: { port: 4173 },
  // `vite build --mode shopify`, run by scripts/shopify-theme.mjs: one script and one stylesheet with
  // fixed names, written straight into the theme's assets folder for layout/theme.liquid to load
  ...(mode === 'shopify' && {
    publicDir: false,
    build: {
      outDir: 'dist-shopify/assets',
      emptyOutDir: false,
      cssCodeSplit: false,
      rollupOptions: {
        input: 'src/main.tsx',
        output: { entryFileNames: 'aeroplane.js', assetFileNames: 'aeroplane[extname]' },
      },
    },
  }),
}));
