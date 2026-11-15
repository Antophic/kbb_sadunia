import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { HOME_TITLE, HOME_DESCRIPTION, siteSchema } from './src/utils/siteIdentity.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), {
      name: 'kbb-site-identity',
      transformIndexHtml(html) {
        return html.replaceAll('{{homeTitle}}', HOME_TITLE)
          .replaceAll('{{homeDescription}}', HOME_DESCRIPTION)
          .replace('{{siteSchema}}', JSON.stringify(siteSchema()))
      },
    }],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['strict-transport-security'];
            });
          },
        },
        '/media': {
          target: backendUrl,
          rewrite: (path) => path.replace(/^\/media/, '/uploads').replace(/\/pic_/, '/img_'),
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['strict-transport-security'];
            });
          },
        },
      }
    }
  }
})
