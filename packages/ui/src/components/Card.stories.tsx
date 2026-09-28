import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: { children: 'Card content goes here.' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: { title: 'Demographics' },
};

export const WithTitleAndActions: Story = {
  args: {
    title: 'Demographics',
    actions: <Button variant="secondary" size="sm">Edit</Button>,
  },
};
