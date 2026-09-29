import type { FormEvent } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import type { ButtonSize, ButtonVariant } from './Button';

describe('Button', () => {
  const variants: ButtonVariant[] = ['primary', 'secondary'];
  const sizes: ButtonSize[] = ['sm', 'md'];

  it.each(variants.flatMap((variant) => sizes.map((size) => [variant, size])))(
    'renders a working %s %s button',
    async (variant, size) => {
      const onClick = vi.fn();
      render(
        <Button variant={variant as ButtonVariant} size={size as ButtonSize} onClick={onClick}>
          Save
        </Button>,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );

  it('renders the variants differently from each other', () => {
    render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Primary' }).className).not.toBe(
      screen.getByRole('button', { name: 'Secondary' }).className,
    );
  });

  it('can be activated from the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('is genuinely disabled and does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeDisabled();
    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick while loading, by click, Enter or Space', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard('{Enter} ');

    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps its accessible name and reports itself busy while loading', () => {
    render(<Button loading>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true');
  });

  it('stays in the tab order while loading, so a keyboard user keeps their place', async () => {
    // jsdom does not move focus off an element that becomes disabled, so the
    // check is the one a browser does act on: a native-disabled button is
    // skipped by Tab, and a loading button must not be.
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });

    await userEvent.tab();

    expect(button).not.toBeDisabled();
    expect(button).toHaveFocus();
  });

  it('leaves the tab order when disabled', async () => {
    render(<Button disabled>Save</Button>);

    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveFocus();
  });
  it('renders the sizes differently from each other', () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Small' }).className).not.toBe(
      screen.getByRole('button', { name: 'Medium' }).className,
    );
  });

  it('submits its form when type is "submit"', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Search</Button>
      </form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit its form while loading', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Search
        </Button>
      </form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit its form from Enter in a field while loading', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <input aria-label="Search" />
        <Button type="submit" loading>
          Search
        </Button>
      </form>,
    );

    await userEvent.type(screen.getByLabelText('Search'), 'amara{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('uses aria-label as its accessible name when given', () => {
    render(<Button aria-label="Close patient record">×</Button>);

    expect(screen.getByRole('button', { name: 'Close patient record' })).toBeInTheDocument();
  });

  it('is not busy when it is not loading', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-busy');
  });
});
