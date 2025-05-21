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
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8', // también puedes usar 'istanbul'
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
    },
  },
})
