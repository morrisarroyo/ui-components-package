import * as ui from './index';

// Every component file in src/components, found rather than listed, so a new
// component is held to this test the moment it exists.
const componentNames = Object.keys(
  import.meta.glob(['./components/*.tsx', '!./components/*.test.tsx', '!./components/*.stories.tsx']),
)
  .map((path) => path.replace('./components/', '').replace('.tsx', ''))
  .sort();

describe('the ui entry point', () => {
  it('finds the components it checks', () => {
    expect(componentNames).toEqual(
      expect.arrayContaining(['Button', 'Card', 'DescriptionList', 'Table', 'TextField']),
    );
  });

  it('exports every component in src/components, and nothing else', () => {
    expect(Object.keys(ui).sort()).toEqual(componentNames);
  });
});
