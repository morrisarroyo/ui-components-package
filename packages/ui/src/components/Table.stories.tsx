import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Table } from './Table';

const meta = {
  title: 'Components/Table',
  component: Table,
  args: {
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'dateOfBirth', header: 'Date of birth' },
      { key: 'healthCardNumber', header: 'Health card' },
    ],
    rows: [
      { name: 'Ada Lovelace', dateOfBirth: '10 Dec 1985', healthCardNumber: '1234-567-890' },
      { name: 'Alan Turing', dateOfBirth: '23 Jun 1972', healthCardNumber: '—' },
      { name: 'Grace Hopper', dateOfBirth: '9 Dec 1966', healthCardNumber: '9876-543-210' },
    ],
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClickableRows: Story = {
  args: { onRowClick: fn() },
};

export const Empty: Story = {
  args: { rows: [], emptyMessage: 'No patients match your search' },
};
