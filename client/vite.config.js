import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // Brotli compression (best compression ratio)
        viteCompression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024, // Only compress files > 1KB
        }),
        // Gzip fallback for older browsers
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                // Manual chunk splitting for better caching
                manualChunks: {
                    // Vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'state-vendor': ['zustand', '@tanstack/react-query'],
                    'ui-vendor': ['framer-motion', 'lucide-react'],
                },
            },
        },
        // Enable source maps for production debugging
        sourcemap: false,
        // Chunk size warning limit
        chunkSizeWarningLimit: 500,
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
