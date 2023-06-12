/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-eval': 2,
    'consistent-return': 1,
    camelcase: 2,
    'no-alert': 2,
    eqeqeq: [2, 'smart'],
    'func-style': [2, 'declaration'],
    '@typescript-eslint/explicit-function-return-type': 'error',
    'no-duplicate-imports': 'error',
    'no-debugger': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'vue/require-explicit-emits': ['off'],
  },
};
