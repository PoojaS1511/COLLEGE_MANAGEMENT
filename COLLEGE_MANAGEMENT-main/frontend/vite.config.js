import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  base: './',
  define: {
    'process.env': {
      REACT_APP_API_URL: '',
      REACT_APP_LOGGING_URL: '/api/errors'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['@supabase/supabase-js', '@heroicons/react']
        }
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'cookie',
      'set-cookie-parser',
      'use-sync-external-store',
      'aos',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/icons-material'
    ]
  },
  server: {
    port: 3001,
    open: true,
    strictPort: true,
    host: true,
    cors: true,
    hmr: {
      overlay: false
    },
    fs: {
      allow: [
        fileURLToPath(new URL('./', import.meta.url)),
        fileURLToPath(new URL('../', import.meta.url))
      ]
    },
    proxy: {
      '^/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
});