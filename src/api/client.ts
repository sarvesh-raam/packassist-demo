import axios from 'axios';

const client = axios.create({
    // In production, we need the full URL. In dev, the proxy handles it or we use localhost.
    baseURL: import.meta.env.VITE_API_URL || '/',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 0, // No timeout for optimization operations
});

export default client;
