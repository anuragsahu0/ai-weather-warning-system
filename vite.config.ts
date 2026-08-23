import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function resolveJsExtensionsPlugin(): Plugin {
  return {
    name: 'resolve-js-extensions',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || source.startsWith('\0') || source.startsWith('node:')) return null;

      if (source.endsWith('.js')) {
        const basePath = source.slice(0, -3);
        const extensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];

        let resolvedDir: string;
        if (source.startsWith('.')) {
          resolvedDir = path.resolve(path.dirname(importer), basePath);
        } else if (source.startsWith('@/')) {
          resolvedDir = path.resolve(__dirname, 'src', basePath.slice(2));
        } else if (source.startsWith('@shared/')) {
          resolvedDir = path.resolve(__dirname, 'shared', basePath.slice(8));
        } else {
          return null;
        }

        for (const ext of extensions) {
          const file = resolvedDir + ext;
          if (fs.existsSync(file)) {
            return file;
          }
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [resolveJsExtensionsPlugin(), react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'lucide-react', 'clsx', 'tailwind-merge'],
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
