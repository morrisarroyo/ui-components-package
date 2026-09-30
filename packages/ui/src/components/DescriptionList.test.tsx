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
  it('keeps the items in the order they are given', () => {
    render(
      <DescriptionList
        items={[
          { label: 'Phone', value: '555-0101' },
          { label: 'Address', value: '1 Main St' },
          { label: 'Email', value: 'ada@example.com' },
        ]}
      />,
    );

    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
      'Phone',
      'Address',
      'Email',
    ]);
  });

  it('renders a React node as the value', () => {
    render(<DescriptionList items={[{ label: 'Email', value: <a href="mailto:ada@example.com">ada@example.com</a> }]} />);

    expect(screen.getByRole('link', { name: 'ada@example.com' })).toBeInTheDocument();
  });

  it('renders nothing but the list when there are no items', () => {
    const { container } = render(<DescriptionList items={[]} />);

    expect(container.querySelector('dl')).toBeEmptyDOMElement();
  });

  it('shows a dash for a missing value but reads it out as "Not provided"', () => {
    render(<DescriptionList items={[{ label: 'Email', value: null }]} />);

    const value = screen.getByRole('definition');
    expect(value).toHaveTextContent('—');
    expect(screen.getByText('—')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Not provided')).toBeInTheDocument();
  });
});
