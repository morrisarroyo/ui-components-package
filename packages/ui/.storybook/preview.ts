import type { Preview } from '@storybook/react-vite';
// Every value a component references is defined here, exactly as it is when a
// consumer imports the package entry point.
import '../src/tokens.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    options: {
      storySort: {
        order: ['Overview', 'Foundations', 'Components', ['Button', 'TextField', 'Card', 'Table', 'DescriptionList'], 'Examples'],
      },
    },
  },
};

export default preview;
