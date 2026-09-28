import type { Meta, StoryObj } from '@storybook/react-vite';
import { DescriptionList } from './DescriptionList';

const meta = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  args: {
    items: [
      { label: 'Name', value: 'Ada Lovelace' },
      { label: 'Date of birth', value: '10 Dec 1985' },
      { label: 'Health card', value: '1234-567-890' },
    ],
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MissingValues: Story = {
  args: {
    items: [
      { label: 'Name', value: 'Alan Turing' },
      { label: 'Phone', value: null },
      { label: 'Email', value: '' },
    ],
  },
};
