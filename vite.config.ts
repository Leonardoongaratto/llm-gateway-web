import react from '@vitejs/plugin-react';
import type { Connect, Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

function dashboardRedirectPlugin(): Plugin {
  const setupRedirect = (server: { middlewares: Connect.Server }) => {
    const handler: Connect.NextHandleFunction = (req, res, next) => {
      const rawUrl = req.url || '';
      const [pathname, search] = rawUrl.split('?');
      if (pathname === '/dashboard') {
        const query = search ? `?${search}` : '';
        res.writeHead(302, { Location: `/dashboard/${query}` });
        res.end();
        return;
      }
      next();
    };
    server.middlewares.use(handler);
  };

  return {
    name: 'dashboard-redirect',
    configureServer: setupRedirect,
    configurePreviewServer: setupRedirect,
  };
}

export default defineConfig({
  base: '/dashboard/',
  plugins: [react(), dashboardRedirectPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'src/types.ts'],
      reporter: ['text-summary', 'text', 'json-summary'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});
