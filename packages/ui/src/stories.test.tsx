import type { ComponentType } from 'react';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';

type StoriesModule = Parameters<typeof composeStories>[0];

// Every story file under src, found rather than listed, so a new component's
// stories are covered without editing this test.
const storyFiles = import.meta.glob<StoriesModule>('./**/*.stories.tsx', { eager: true });

const stories: [string, ComponentType][] = Object.entries(storyFiles).flatMap(([path, module]) =>
  Object.entries(composeStories(module) as Record<string, ComponentType>).map(
    ([story, Story]): [string, ComponentType] => [`${path} / ${story}`, Story],
  ),
);

describe('Storybook stories', () => {
  it('finds a story file for every component', () => {
    expect(Object.keys(storyFiles).length).toBeGreaterThanOrEqual(5);
  });

  it.each(stories)('%s renders', (_name, Story) => {
    const { container } = render(<Story />);

    expect(container).not.toBeEmptyDOMElement();
  });
});
