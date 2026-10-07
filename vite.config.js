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
            // 2. Mirror complete dist output to docs/ for GitHub Pages 'main /docs' option
            fs.rmSync('docs', { recursive: true, force: true });
            fs.cpSync('dist', 'docs', { recursive: true });

            // 3. Mirror compiled assets and route folders to repository root for GitHub Pages 'main / (root)' option
            if (fs.existsSync('dist/assets')) {
              fs.rmSync('assets', { recursive: true, force: true });
              fs.cpSync('dist/assets', 'assets', { recursive: true });
            }
            if (fs.existsSync('dist/404.html')) {
              fs.copyFileSync('dist/404.html', '404.html');
            }
            ROUTE_DIRS.forEach(route => {
              const rootRouteDir = route;
              if (!fs.existsSync(rootRouteDir)) {
                fs.mkdirSync(rootRouteDir, { recursive: true });
              }
              fs.writeFileSync(path.join(rootRouteDir, 'index.html'), indexHtml, 'utf-8');
            });
          }
        } catch (err) {
          console.error('Artifact copy error:', err);
        }
      }
    }
  ],
  base: command === 'build' ? '/transportx/' : '/',
}))
