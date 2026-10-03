import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormattingPrettier from '@vue/eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath, URL } from 'node:url';

export default withVueTs(
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  {
    ignores: ['.claude/**', 'src/tests/**'],
  },
  pluginVue.configs['flat/recommended'],
  js.configs.recommended,
  vueTsConfigs.recommended,
  skipFormattingPrettier,
  {
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
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'vue/require-explicit-emits': ['off'],
    },
  }
);
