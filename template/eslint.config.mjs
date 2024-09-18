import { fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/dist', '**/docs', '**/.husky', '**/build', '**/autogen', '**/node_modules'],
  },
  ...compat.extends(
    'plugin:react/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended'
  ),
  {
    plugins: {
      react,
      '@typescript-eslint': typescriptEslint,
      prettier,
      'react-hooks': fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },

      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },

        warnOnUnsupportedTypeScriptVersion: true,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-use-before-define': 'off',

      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
          variables: false,
          typedefs: false,
        },
      ],

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
