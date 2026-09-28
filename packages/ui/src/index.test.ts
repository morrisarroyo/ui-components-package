import * as ui from './index';

describe('the ui entry point', () => {
  it('exports exactly the five components', () => {
    expect(Object.keys(ui).sort()).toEqual([
      'Button',
      'Card',
      'DescriptionList',
      'Table',
      'TextField',
    ]);
  });
});
