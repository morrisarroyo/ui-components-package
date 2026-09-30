import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

// Storybook reuses vite.config.ts, so stories render with the same CSS Modules
// naming the published build uses. The MDX pages in src/docs are the
// component documentation; the stories are their live demos.
const config: StorybookConfig = {
  stories: ['../src/docs/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      // GitHub-flavoured Markdown, for the tables on the docs pages.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
  ],
  framework: '@storybook/react-vite',
};

export default config;
