import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Environment
    environment: 'node',

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/.{eslint,prettier}rc.{js,cjs,yml}',
        '**/test/**',
        '**/tests/**'
      ]
    },

    // Test timeout
    testTimeout: 10000,

    // Setup files
    setupFiles: ['./test/setup.ts']
  },

  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
