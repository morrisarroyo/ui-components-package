import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PatientDetailPage } from './PatientDetailPage';
import { PatientListPage } from './PatientListPage';
import type { PatientDto } from '../api/patients';

const amara: PatientDto = {
  id: 'p-0001',
  givenName: 'Amara',
  familyName: 'Okonkwo',
  gender: 'female',
  birthDate: '1984-03-02',
  phone: '+1 416 555 0133',
  email: null,
  address: null,
};
const daniel: PatientDto = { ...amara, id: 'p-0002', givenName: 'Daniel', familyName: 'Tremblay' };

/** A fake API: the list honours ?search=, the detail finds by id. */
function fakeApi(url: string) {
  const [path, query = ''] = url.split('?');
  const body =
    path === '/api/patients'
      ? [amara, daniel].filter((p) =>
          `${p.givenName} ${p.familyName}`.toLowerCase().includes(new URLSearchParams(query).get('search')?.toLowerCase() ?? ''),
        )
      : [amara, daniel].find((p) => path.endsWith(p.id));
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
}

// MemoryRouter rather than a data router; see PatientListPage.test.tsx.
function renderSite(initialEntry: string) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<PatientListPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(fakeApi));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('moving between the pages', () => {
  it('returns from a patient to the same search and results', async () => {
    renderSite('/');
    await screen.findByText('Daniel Tremblay');

    await userEvent.type(screen.getByLabelText('Search by name'), 'oko');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Amara Okonkwo' }));
    await screen.findByRole('heading', { level: 1, name: 'Amara Okonkwo' });

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByRole('button', { name: 'Amara Okonkwo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search by name')).toHaveValue('oko');
    expect(screen.queryByText('Daniel Tremblay')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith('/api/patients?search=oko');
  });

  it('runs a search given in the URL', async () => {
    renderSite('/?search=tremblay');

    expect(await screen.findByText('Daniel Tremblay')).toBeInTheDocument();
    expect(screen.queryByText('Amara Okonkwo')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search by name')).toHaveValue('tremblay');
  });

  it('goes to the full list on Back from a directly opened patient', async () => {
    renderSite('/patients/p-0001');
    await screen.findByRole('heading', { level: 1, name: 'Amara Okonkwo' });

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByText('Daniel Tremblay')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by name')).toHaveValue('');
  });
});
