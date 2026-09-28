import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';

/** A controlled wrapper, the way a consumer uses the field. */
function Controlled(props: Omit<TextFieldProps, 'value' | 'onChange'> & { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <TextField
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Patient name" value="" onChange={() => {}} />);

    expect(screen.getByLabelText('Patient name')).toBeInstanceOf(HTMLInputElement);
  });

  it('focuses the input when the label is clicked', async () => {
    render(<TextField label="Patient name" value="" onChange={() => {}} />);

    await userEvent.click(screen.getByText('Patient name'));

    expect(screen.getByLabelText('Patient name')).toHaveFocus();
  });

  it('gives two fields on one page distinct label associations', () => {
    render(
      <>
        <TextField label="First" value="" onChange={() => {}} />
        <TextField label="Last" value="" onChange={() => {}} />
      </>,
    );

    expect(screen.getByLabelText('First')).not.toBe(screen.getByLabelText('Last'));
  });

  it('calls onChange with the typed value', async () => {
    const onChange = vi.fn();
    render(<Controlled label="Name" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');

    expect(onChange).toHaveBeenLastCalledWith('Ada');
    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
  });

  it('shows the helper text and links it to the input', () => {
    render(<TextField label="Name" value="" onChange={() => {}} helperText="Part of a name is enough" />);

    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Part of a name is enough');
  });

  it('replaces the helper text with the error message in the error state', () => {
    render(
      <TextField
        label="Name"
        value=""
        onChange={() => {}}
        helperText="Part of a name is enough"
        errorMessage="Enter a name"
      />,
    );
    const input = screen.getByLabelText('Name');

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a name');
    expect(screen.queryByText('Part of a name is enough')).not.toBeInTheDocument();
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Enter a name');
  });

  it('is not in the error state when errorMessage is empty', () => {
    render(
      <TextField label="Name" value="" onChange={() => {}} helperText="Part of a name is enough" errorMessage="" />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeValid();
    expect(screen.getByText('Part of a name is enough')).toBeInTheDocument();
  });

  it('is genuinely disabled and does not call onChange when disabled', async () => {
    const onChange = vi.fn();
    render(<Controlled label="Name" disabled onChange={onChange} />);
    const input = screen.getByLabelText('Name');

    expect(input).toBeDisabled();
    await userEvent.type(input, 'Ada');

    expect(onChange).not.toHaveBeenCalled();
  });
  it('shows the value it is given', () => {
    render(<TextField label="Name" value="Ada" onChange={() => {}} />);

    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
  });

  it('shows the placeholder', () => {
    render(<Controlled label="Search" placeholder="Name or health card number" />);

    expect(screen.getByLabelText('Search')).toHaveAttribute(
      'placeholder',
      'Name or health card number',
    );
  });

  it('marks the input invalid and announces the error', () => {
    render(<Controlled label="Search" errorMessage="Enter at least two characters." />);

    const input = screen.getByLabelText('Search');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter at least two characters.');
    expect(input).toHaveAccessibleDescription('Enter at least two characters.');
  });

  it('has no description and no alert when there is no message', () => {
    render(<Controlled label="Search" />);

    const input = screen.getByLabelText('Search');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('is skipped by Tab when disabled', async () => {
    render(
      <>
        <Controlled label="Disabled" disabled />
        <Controlled label="Enabled" />
      </>,
    );

    await userEvent.tab();

    expect(screen.getByLabelText('Enabled')).toHaveFocus();
  });
});
