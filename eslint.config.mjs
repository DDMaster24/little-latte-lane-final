import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '**/_*/**',
      '**/_*',
      '**/debug-*/**',
      '**/test-*/**',
      '**/*.test.*',
      '**/*.spec.*',
      'public/sw.js',
      'public/workbox-*',
      '.next/**',
      'node_modules/**',
    ],
    rules: {
      // Remove unused imports
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Temporarily allow console logs for debugging
      'no-console': 'off',
      // Ban dangerous patterns
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      // Critical: Use Next.js Image optimization
      '@next/next/no-img-element': 'error',
    },
  },
  {
    files: ['src/types/supabase.ts'],
    rules: {
      // Disable all rules for auto-generated file
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    }
  }
];

export default eslintConfig;
