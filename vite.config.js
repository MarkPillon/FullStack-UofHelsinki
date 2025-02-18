import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
    '.gitpod.io',
    'localhost'
  ],
  hmr:{
    clientPort: 443,
    protocol: 'wss'
  }
  }
})
