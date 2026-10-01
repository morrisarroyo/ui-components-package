// Lint for the TypeScript in ui, app and the end-to-end tests: likely bugs,
// React hook mistakes, accessibility (CLAUDE.md rule 5) and app importing ui
// only by its package name (rule 1).
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/node_modules/', '**/dist/', '**/storybook-static/', 'test-results/', 'playwright-report/', 'api/'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // `const { removed, ...rest } = obj` is how a field is dropped.
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['packages/*/src/**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ['packages/app/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['ui/*', '!ui/styles.css'], message: "Import from 'ui' or 'ui/styles.css' only." },
            { group: ['**/ui/src/**', '**/packages/ui/**'], message: "Import ui by package name: 'ui'." },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/ui/scripts/**', 'packages/*/*.config.ts', 'packages/ui/.storybook/**', '*.config.{js,ts}', 'e2e/**'],
    languageOptions: { globals: globals.node },
  },
);
