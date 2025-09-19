import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      input: '/index.html'
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.wasm'],
    alias: {
      '@': '/src'
    }
  },
  esbuild: {
    target: 'es2020'
  },
  optimizeDeps: {
    exclude: ['@penrose/bloom']
  },
  assetsInclude: ['**/*.wasm']
})
