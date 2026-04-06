import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/auth': 'http://127.0.0.1:8000',
            '/optimize': 'http://127.0.0.1:8000',
            '/bags': 'http://127.0.0.1:8000',
            '/cars': 'http://127.0.0.1:8000'
        }
    }
})
