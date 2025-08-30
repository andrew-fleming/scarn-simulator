// eslint.config.js
import js from '@eslint/js'
import jsdoc from 'eslint-plugin-jsdoc'
import * as tseslint from 'typescript-eslint'
import vitest from 'eslint-plugin-vitest'

// Apply type-aware config with project info
const typeAwareConfig = tseslint.configs.recommendedTypeChecked.map(config => ({
  ...config,
  languageOptions: {
    ...config.languageOptions,
    parser: tseslint.parser,
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: new URL('.', import.meta.url),
    }
  }
}))

export default [
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,
  ...typeAwareConfig,

  {
    files: ['**/*.ts'],
    plugins: {
      jsdoc,
      vitest
    },
    rules: {
      // JSDoc rules
      'jsdoc/require-jsdoc': ['error', {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: true,
          FunctionExpression: true
        }
      }],
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',

      // Vitest rules
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',

      // General
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    }
  },

  // Optional: Vitest environment setup for test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    //languageOptions: {
    //  globals: vitest.environments.globals.globals
    //}
  }
]
