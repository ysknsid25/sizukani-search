import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 88,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: `${path.resolve(__dirname, 'src')}/$1`,
      },
    ],
  },
});
