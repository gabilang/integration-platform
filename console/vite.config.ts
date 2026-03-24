import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { existsSync, readFileSync } from 'node:fs';

const certKeyPath = './certs/server.key';
const certPath = './certs/server.cert';
const hasLocalCerts = existsSync(certKeyPath) && existsSync(certPath);

export default defineConfig({
  plugins: [react()],
  server: {
    ...(hasLocalCerts && {
      https: {
        key: readFileSync(certKeyPath),
        cert: readFileSync(certPath),
      },
    }),
    port: 3001,
    proxy: {
      // Proxy API requests to the local wso2cloud data-plane gateway so the
      // browser never makes a cross-origin request (mirrors the nginx same-origin
      // proxy used in the Docker/production build).
      '/platform-api-service': {
        target: 'http://development-wso2cloud.openchoreoapis.localhost:19080',
        changeOrigin: true,
      },
      '/integration-platform-api-service': {
        target: 'http://development-wso2cloud.openchoreoapis.localhost:19080',
        changeOrigin: true,
      },
    },
  },
});
