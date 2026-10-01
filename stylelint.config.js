// Lint for stylesheets: CSS mistakes, and no hard-coded colour, spacing or
// font size outside the token sheet (CLAUDE.md rule 3). A value with no token
// needs a stylelint-disable comment that says why.
export default {
  extends: ['stylelint-config-recommended'],
  ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/storybook-static/**', 'test-results/**'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch'],
    'declaration-property-unit-disallowed-list': {
      '/^(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)/': ['px', 'rem', 'em'],
      '/^(font|font-size|line-height|letter-spacing|border-radius)$/': ['px', 'rem', 'em'],
    },
  },
  overrides: [
    {
      // The token sheet is where the values are defined.
      files: ['packages/ui/src/tokens.css'],
      rules: {
        'color-no-hex': null,
        'function-disallowed-list': null,
        'declaration-property-unit-disallowed-list': null,
      },
    },
  ],
};
