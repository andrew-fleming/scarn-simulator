import js from '@eslint/js'
import jsdoc from 'eslint-plugin-jsdoc'
import * as tseslint from 'typescript-eslint'
import vitest from 'eslint-plugin-vitest'

export default [
  js.configs.recommended,

  // TypeScript recommended (non-type-aware) for all TS files
  ...tseslint.configs.recommended,

  // Type-aware rules only for files included in tsconfig.json
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['src/**/*.ts'], // Only apply to src files
    languageOptions: {
      ...config.languageOptions,
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: new URL('.', import.meta.url),
      }
    }
  })),

  {
    ignores: ['**/artifacts/**', 'test/artifacts/**']
  },
  {
    files: ['**/*.ts'],
    plugins: {
      jsdoc,
      vitest
    },
    rules: {
      // Your JSDoc and other rules
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
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    }
  },

  // Ignore config files from type-aware linting
  {
    files: ['*.config.*', '*.js'],
    ...tseslint.configs.disableTypeChecked
  }
]
