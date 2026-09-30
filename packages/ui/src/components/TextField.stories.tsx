import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField, type TextFieldProps } from './TextField';

// TextField is controlled, so each story holds its value in local state.
function ControlledTextField(props: TextFieldProps) {
  const [value, setValue] = useState(props.value);
  return (
    <TextField
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange(next);
      }}
    />
  );
}

// It renders exactly <TextField> with the story's props, so the docs' code
// sample names it that way rather than by the wrapper's minified name.
ControlledTextField.displayName = 'TextField';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: { layout: 'centered' },
  render: (args) => <ControlledTextField {...args} />,
  args: { label: 'Search patients', value: '', onChange: () => {} },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Name or health card number' },
};

export const WithHelperText: Story = {
  args: { helperText: 'Matches on first or last name.' },
};

export const WithError: Story = {
  args: { value: 'x', errorMessage: 'Enter at least two characters.' },
};

export const Disabled: Story = {
  args: { value: 'Unavailable', disabled: true },
};
