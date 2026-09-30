import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import readme from '../../README.md?raw';
import source from './PatientLookup.tsx?raw';
import { PatientLookup } from './PatientLookup';

async function searchFor(text: string) {
  await userEvent.type(screen.getByLabelText('Name'), text);
  await userEvent.click(screen.getByRole('button', { name: 'Search' }));
}

describe('PatientLookup example', () => {
  it('is printed in the README exactly, apart from the import path', () => {
    const listing = readme.match(/<!-- example:PatientLookup -->\s*```tsx\n([\s\S]*?)```/)?.[1];

    expect(listing).toBe(source.replace("from '../index'", "from 'ui'"));
  });

  it('refuses a one-letter search with a field error', async () => {
    render(<PatientLookup />);

    await searchFor('a');

    expect(screen.getByRole('alert')).toHaveTextContent('Enter at least two characters.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('searches, shows results, and opens the clicked record', async () => {
    render(<PatientLookup />);

    await searchFor('tur');

    const row = await screen.findByRole('row', { name: /Alan Turing/ });
    expect(row).toHaveTextContent('—');
    await userEvent.click(row);
    expect(screen.getByRole('heading', { name: 'Alan Turing' })).toBeInTheDocument();
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
      '23 Jun 1972',
      // The dash is shown; "Not provided" is what a screen reader hears.
      '—Not provided',
      '555-0102',
    ]);
  });

  it('shows the empty message when nothing matches', async () => {
    render(<PatientLookup />);

    await searchFor('zz');

    expect(await screen.findByText('No patients match that name')).toBeInTheDocument();
  });

  it('shows a failure with a retry when the request fails', async () => {
    render(<PatientLookup />);

    await searchFor('error');

    expect(await screen.findByText(/The search failed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
