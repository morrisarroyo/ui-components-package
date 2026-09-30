import type { Preview } from '@storybook/react-vite';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/400.css';
// Every value a component references is defined here, exactly as it is when a
// consumer imports the package entry point.
import '../src/tokens.css';
import './docs.css';
import { theme } from './theme';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    docs: {
      theme,
      // As on Material UI's pages, every demo shows its code beneath it.
      canvas: { sourceState: 'shown' },
      // The stories log events with a stub (`onClick: fn()`), which the code
      // sample would print as `onClick={function PG(){}}`. It is Storybook
      // plumbing, not part of the example, so it is left out.
      source: {
        transform: (code: string) => code.replace(/\s*on[A-Z]\w*=\{function [\w$]*\(\)\{\}\}/g, ''),
      },
    },
    options: {
      storySort: {
        order: ['Overview', 'Foundations', 'Components', ['Button', 'TextField', 'Card', 'Table', 'DescriptionList'], 'Examples'],
      },
    },
  },
};

export default preview;
