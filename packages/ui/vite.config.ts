// Imported from vitest/config so the `test` block below is typed.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Class names are scoped and prefixed so consuming apps can never
      // collide with, or accidentally target, library internals.
      generateScopedName: 'ui-[local]-[hash:base64:5]',
    },
  },
  build: {
    lib: {
      // Resolved against the package root, so no Node path helpers are needed.
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'ui.js',
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: 'ui.css',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: true,
  },
});
