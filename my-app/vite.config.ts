import { defineConfig } from 'vitest/config';

import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,                 // permite usar describe/it sin importarlos
    environment: 'happy-dom',      // utiliza happy-dom para el DOM en tests
    setupFiles: './src/setupTests.ts', // jest-dom matchers
    css: true,                     // soporta importación de CSS en tests
  },
})
