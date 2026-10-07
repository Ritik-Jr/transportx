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
      transformIndexHtml(html) {
        if (command === 'build') {
          // Remove root-only fallback loader from compiled dist/index.html because dist/index.html already has compiled script tags in <head>
          return html.replace(/<!-- Production bundle loader[\s\S]*?<\/script>/, '');
        }
        return html;
      },
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

            // 2. Locate compiled bundle assets in dist/assets and create unhashed aliases
            let jsFile = '';
            let cssFile = '';
            if (fs.existsSync('dist/assets')) {
              const assetFiles = fs.readdirSync('dist/assets');
              jsFile = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js')) || '';
              cssFile = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.css')) || '';

              if (jsFile) {
                fs.copyFileSync(path.join('dist/assets', jsFile), path.join('dist/assets', 'main.js'));
              }
              if (cssFile) {
                fs.copyFileSync(path.join('dist/assets', cssFile), path.join('dist/assets', 'main.css'));
              }
            }

            // 3. Ensure .nojekyll exists in dist and root to prevent Jekyll processing on GitHub Pages
            fs.writeFileSync(path.join('dist', '.nojekyll'), '', 'utf-8');
            fs.writeFileSync('.nojekyll', '', 'utf-8');

            // 4. Mirror complete dist output to docs/ for GitHub Pages 'main /docs' option
            fs.rmSync('docs', { recursive: true, force: true });
            fs.cpSync('dist', 'docs', { recursive: true });

            // 5. Mirror compiled assets and route folders to repository root for GitHub Pages 'main / (root)' option
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

            // 6. Update root index.html to point to the latest JS and CSS bundles
            if (fs.existsSync('index.html') && jsFile && cssFile) {
              let rootHtml = fs.readFileSync('index.html', 'utf-8');
              rootHtml = rootHtml.replace(
                /link\.href\s*=\s*['"]\/transportx\/assets\/[^'"]+\.css['"]/,
                `link.href = '/transportx/assets/${cssFile}'`
              ).replace(
                /s\.src\s*=\s*['"]\/transportx\/assets\/[^'"]+\.js['"]/,
                `s.src = '/transportx/assets/${jsFile}'`
              );
              fs.writeFileSync('index.html', rootHtml, 'utf-8');
            }
          }
        } catch (err) {
          console.error('Artifact copy error:', err);
        }
      }
    }
  ],
  base: command === 'build' ? '/transportx/' : '/',
}))
