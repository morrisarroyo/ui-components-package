import type { Meta, StoryObj } from '@storybook/react-vite';
import { PatientLookup } from './PatientLookup';

const meta = {
  title: 'Examples/Patient lookup',
  component: PatientLookup,
  parameters: {
    docs: {
      description: {
        component:
          'All five components in one real screen. Search "lo" for results, "zz" for none, "error" for a failed request, or one letter for the validation error; click a row to open the record.',
      },
    },
  },
} satisfies Meta<typeof PatientLookup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
