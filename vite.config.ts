/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // testes unitários das funções de correção; o e2e (Playwright) fica em e2e/
    include: ['src/**/*.test.ts'],
  },
})
