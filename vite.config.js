import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'node:fs'
import path from 'node:path'

const ROUTE_DIRS = ['trips', 'analytics', 'parties', 'settings', 'dashboard'];

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
            const indexHtml = fs.readFileSync('dist/index.html', 'utf-8');

            // 1. Generate physical route folders in dist/ for 200 OK responses on page reloads
            ROUTE_DIRS.forEach(route => {
              const routeDir = path.join('dist', route);
              if (!fs.existsSync(routeDir)) {
                fs.mkdirSync(routeDir, { recursive: true });
              }
              fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml, 'utf-8');
            });
          }

          // 2. Mirror complete dist output to docs/ for GitHub Pages 'main /docs' option
          if (fs.existsSync('dist')) {
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
