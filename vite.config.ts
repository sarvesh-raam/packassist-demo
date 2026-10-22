import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    build: {
        // The lazily loaded three.js viewer chunk is ~900 kB on its own
        chunkSizeWarningLimit: 1000,
    },
})
