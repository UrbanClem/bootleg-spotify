import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Demo build for GitHub Pages.
 *
 * Two differences from the dev/prod config:
 *   - `base` is set to the project's Pages URL so asset paths resolve under
 *     https://<user>.github.io/bootleg-spotify/ instead of the domain root.
 *     Override with VITE_BASE if the repo is ever renamed.
 *   - No `/api` proxy: in demo mode the client talks to the in-browser mock,
 *     so there is nothing to forward to.
 */
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/bootleg-spotify/',
  build: {
    outDir: 'dist',
    // Top-level await in api.js (the dynamic demo import) needs ES2022.
    target: 'es2022'
  }
});
