// Imported from vitest/config so the `test` block below is typed.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The app calls the API through same-origin `/api` paths; the dev server
    // forwards them to the ASP.NET Core process so there is no CORS setup
    // and no environment-specific base URL in the client code.
    proxy: {
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    // Lets the root `npm test` pass before the app has tests of its own
    // (the page test is task T-3.5). Remove once that test exists.
    passWithNoTests: true,
  },
});
