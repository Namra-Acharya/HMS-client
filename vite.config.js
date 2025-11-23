import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'http';

let detectedPort = 3000;

// Try to find which port the server is running on
const findServerPort = () => {
  return new Promise((resolve) => {
    const portsToTry = [3000, 3005, 3006, 3007, 3008, 3009, 3001, 3002, 3003, 3004];
    let portIndex = 0;

    const checkPort = () => {
      if (portIndex >= portsToTry.length) {
        console.warn('[VITE] Could not detect server port, defaulting to 3000');
        resolve(3000);
        return;
      }

      const port = portsToTry[portIndex];
      const req = http.get(`http://localhost:${port}/health`, { timeout: 1000 }, (res) => {
        if (res.statusCode === 200) {
          console.log(`[VITE] Found server on port ${port}`);
          resolve(port);
        } else {
          portIndex++;
          checkPort();
        }
      }).on('error', () => {
        portIndex++;
        checkPort();
      });
    };

    checkPort();
  });
};

// Detect server port on startup
findServerPort().then(port => {
  detectedPort = port;
  console.log(`[VITE] Server will be proxied to port ${port}`);
});

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    middlewareMode: false,
    proxy: {
      '/api': {
        target: `http://localhost:3000`,
        changeOrigin: true,
        bypass: (req, res, options) => {
          // Dynamically update target port
          options.target = `http://localhost:${detectedPort}`;
        }
      }
    }
  }
});
