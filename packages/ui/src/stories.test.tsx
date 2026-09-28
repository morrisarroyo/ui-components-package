import type { ComponentType } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import * as ButtonStories from './components/Button.stories';
import * as CardStories from './components/Card.stories';
import * as DescriptionListStories from './components/DescriptionList.stories';
import * as TableStories from './components/Table.stories';
import * as TextFieldStories from './components/TextField.stories';

// Keeps the Storybook stories honest: every one must render without throwing
// against the current props, so a prop change cannot silently break them.
const stories: [string, ComponentType][] = Object.entries({
  ...prefix('Button', composeStories(ButtonStories)),
  ...prefix('Card', composeStories(CardStories)),
  ...prefix('DescriptionList', composeStories(DescriptionListStories)),
  ...prefix('Table', composeStories(TableStories)),
  ...prefix('TextField', composeStories(TextFieldStories)),
});

function prefix(component: string, composed: Record<string, ComponentType>) {
  return Object.fromEntries(
    Object.entries(composed).map(([story, Story]) => [`${component} / ${story}`, Story]),
  );
}

describe('Storybook stories', () => {
  it.each(stories)('%s renders', (_name, Story) => {
    const { container } = render(<Story />);

    expect(container).not.toBeEmptyDOMElement();
  });
});
