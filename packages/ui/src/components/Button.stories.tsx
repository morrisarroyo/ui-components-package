import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Search', onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancel' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** Both variants side by side: primary for the main action, secondary for the rest. */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-2)' }}>
      <Button {...args} variant="primary">
        Save
      </Button>
      <Button {...args} variant="secondary">
        Cancel
      </Button>
    </div>
  ),
};

/** Both sizes side by side. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-2)', alignItems: 'center' }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
    </div>
  ),
};

