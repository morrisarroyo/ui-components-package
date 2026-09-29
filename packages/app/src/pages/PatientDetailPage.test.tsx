import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PatientDetailPage } from './PatientDetailPage';
import type { PatientDto } from '../api/patients';

const priya: PatientDto = {
  id: 'p-0003',
  givenName: 'Priya',
  familyName: 'Raman',
  gender: 'female',
  birthDate: '1992-07-08',
  phone: '+1 604 555 0118',
  email: null,
  address: { line: '1550 W 8th Ave', city: 'Vancouver', region: 'BC', postalCode: 'V6J 1T5' },
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

// MemoryRouter rather than a data router; see PatientListPage.test.tsx.
function renderPage(id = 'p-0003') {
  render(
    <MemoryRouter initialEntries={['/', `/patients/${id}`]} initialIndex={1}>
      <Routes>
        <Route path="/" element={<p>List page</p>} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** The DescriptionList's values, keyed by label. */
function demographics() {
  const labels = screen.getAllByRole('term').map((term) => term.textContent);
  const values = screen.getAllByRole('definition').map((value) => value.textContent);
  return Object.fromEntries(labels.map((label, index) => [label, values[index]]));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PatientDetailPage', () => {
  it('shows "Loading…" and the Back button while the patient loads', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    renderPage();

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('is titled with the patient\'s full name and shows their demographics', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(priya)));
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Priya Raman' })).toBeInTheDocument();
    expect(document.title).toBe('Priya Raman');
    expect(screen.getByRole('heading', { name: 'Demographics' })).toBeInTheDocument();
    expect(demographics()).toEqual({
      Name: 'Priya Raman',
      Gender: 'Female',
      'Birth date': '8 Jul 1992',
      Phone: '+1 604 555 0118',
      Email: '—',
      Address: '1550 W 8th Ave, Vancouver, BC, V6J 1T5',
    });
    expect(fetch).toHaveBeenCalledWith('/api/patients/p-0003');
  });

  it('shows a "Patient not found" card and the Back button for an unknown id', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ title: 'Not Found', status: 404 }, 404)));
    renderPage('p-9999');

    expect(await screen.findByRole('heading', { name: 'Patient not found' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Demographics' })).not.toBeInTheDocument();
  });

  it('shows a "Something went wrong" card when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Patient not found' })).not.toBeInTheDocument();
  });

  it('returns to the patient list on Back', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(priya)));
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('List page')).toBeInTheDocument();
  });
});
