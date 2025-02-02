import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: "0.0.0.0", // Allow external access
    port: 5173,      // Your chosen port
    strictPort: true,
    // Add the allowed host(s):
    allowedHosts: [
      "5173-markpillon-fullstackuof-069p22xtf3i.ws-us117.gitpod.io", // Your specific host
      // OR allow all hosts (for development only):
      "all"
    ],
  },
});
