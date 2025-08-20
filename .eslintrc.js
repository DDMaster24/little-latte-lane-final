module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Treat React Hook dependency warnings as warnings, not errors
    'react-hooks/exhaustive-deps': 'warn',
    
    // Allow unused variables that start with underscore
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  // Exclude generated files from linting
  ignorePatterns: [
    '**/supabase.ts',
    'src/types/**',
    'node_modules/',
    '.next/',
    'out/',
    'public/',
  ],
};
