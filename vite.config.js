import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function dentalDbDevPlugin() {
  let devData = {
    companies: [],
    doctors: [],
    patients: [],
    orders: []
  };

  return {
    name: 'dental-db-dev-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/db')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (req.method === 'GET') {
            res.end(JSON.stringify({ success: true, storageType: 'local_vite_dev', data: devData }));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}');
                devData = {
                  companies: Array.isArray(parsed.companies) ? parsed.companies : [],
                  doctors: Array.isArray(parsed.doctors) ? parsed.doctors : [],
                  patients: Array.isArray(parsed.patients) ? parsed.patients : [],
                  orders: Array.isArray(parsed.orders) ? parsed.orders : []
                };
                res.end(JSON.stringify({ success: true, message: 'Lokal sunucu belleğine kaydedildi', savedAt: new Date().toISOString() }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dentalDbDevPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 3000,
    open: true
  }
});
