import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'node:fs'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'copy-build-artifacts',
      closeBundle() {
        try {
          if (fs.existsSync('dist/index.html')) {
            // Generate dist/404.html for GitHub Pages SPA deep links and reloads
            fs.copyFileSync('dist/index.html', 'dist/404.html');
          }
          if (fs.existsSync('dist')) {
            // Also sync to docs folder so GitHub Pages 'main /docs' option is supported
            fs.cpSync('dist', 'docs', { recursive: true });
          }
        } catch (err) {
          console.error('Artifact copy error:', err);
        }
      }
    }
  ],
  base: command === 'build' ? '/transportx/' : '/',
}))
