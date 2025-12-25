import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  {
    ignores: ['**/dist/**/*'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  stylistic.configs.customize({
    semi: true,
    braceStyle: '1tbs',
    arrowParens: true,
    quoteProps: 'consistent',
  }),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
    },
  },
);
