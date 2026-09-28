import type { StorybookConfig } from '@storybook/react-vite';

// Storybook reuses vite.config.ts, so stories render with the same CSS Modules
// naming the published build uses.
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/react-vite',
};

export default config;
