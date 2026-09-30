import { create } from 'storybook/theming';

/** A dark theme for the docs site, after Material UI's documentation. */
export const theme = create({
  base: 'dark',
  brandTitle: 'UI Components Package',
  fontBase: "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontCode: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
  colorPrimary: '#58A6FF',
  colorSecondary: '#1F6FEB',
  appBg: '#0C1016',
  appContentBg: '#101418',
  appPreviewBg: '#FFFFFF',
  appBorderColor: '#1F262E',
  appBorderRadius: 12,
  textColor: '#E7EBF0',
  textMutedColor: '#B2BAC2',
  barBg: '#0C1016',
  barTextColor: '#B2BAC2',
  barSelectedColor: '#58A6FF',
  inputBg: '#1C2025',
  inputBorder: '#303740',
  inputTextColor: '#E7EBF0',
});
