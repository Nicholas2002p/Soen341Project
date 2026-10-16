import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from "node:fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('../server/certs/localhost-key.pem'),
      cert: fs.readFileSync('../server/certs/localhost.pem'),
    },
  },
})
