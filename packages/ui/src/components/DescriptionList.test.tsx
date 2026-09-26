import { render, screen } from '@testing-library/react';
import { DescriptionList } from './DescriptionList';

describe('DescriptionList', () => {
  it('renders each label next to its value', () => {
    render(
      <DescriptionList
        items={[
          { label: 'Name', value: 'Ada Lovelace' },
          { label: 'Gender', value: 'Female' },
        ]}
      />,
    );

    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(['Name', 'Gender']);
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
      'Ada Lovelace',
      'Female',
    ]);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
  ])('renders an em dash for a value that is %s', (_kind, value) => {
    render(<DescriptionList items={[{ label: 'Email', value }]} />);

    expect(screen.getByRole('definition')).toHaveTextContent('—');
  });

  it('renders zero as a value, not as missing', () => {
    render(<DescriptionList items={[{ label: 'Visits', value: 0 }]} />);

    expect(screen.getByRole('definition')).toHaveTextContent('0');
  });
});
