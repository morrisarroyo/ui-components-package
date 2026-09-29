import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { PatientListPage } from './PatientListPage';
import type { PatientDto } from '../api/patients';

function patient(overrides: Partial<PatientDto>): PatientDto {
  return {
    id: 'p-0001',
    givenName: 'Amara',
    familyName: 'Okonkwo',
    gender: 'female',
    birthDate: '1984-03-02',
    phone: '+1 416 555 0133',
    email: null,
    address: null,
    ...overrides,
  };
}

const amara = patient({});
const daniel = patient({
  id: 'p-0002',
  givenName: 'Daniel',
  familyName: 'Tremblay',
  gender: 'male',
  birthDate: '1971-11-19',
  phone: '+1 514 555 0172',
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

/** A fetch whose response the test releases when it is ready. */
function deferred() {
  let release: (response: Response) => void = () => {};
  const promise = new Promise<Response>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

function DetailStub() {
  const { id } = useParams();
  return <p>Detail page for {id}</p>;
}

// MemoryRouter rather than a data router: under jsdom, a data router's
// navigation builds a fetch Request with jsdom's AbortSignal, which Node's
// fetch rejects. The page itself only uses useNavigate, which both support.
function renderPage() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<PatientListPage />} />
        <Route path="/patients/:id" element={<DetailStub />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PatientListPage', () => {
  it('is titled "Patients"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json([])));
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Patients' })).toBeInTheDocument();
    // Let the list settle; an unfiltered empty list says "No patients yet".
    await screen.findByText('No patients yet');
  });

  it('shows "Loading…" instead of the table until the list arrives', async () => {
    const response = deferred();
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(response.promise));
    renderPage();

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    response.release(json([amara]));

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('renders the table from the list response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json([amara, daniel])));
    renderPage();

    const table = await screen.findByRole('table');
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'Name',
      'Gender',
      'Birth date',
      'Phone',
    ]);
    const [, first, second] = within(table).getAllByRole('row');
    expect(within(first).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
      'Amara Okonkwo',
      'Female',
      '2 Mar 1984',
      '+1 416 555 0133',
    ]);
    expect(within(second).getByText('Daniel Tremblay')).toBeInTheDocument();
  });

  it('shows "—" in the Phone column for a patient with no phone', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json([patient({ phone: null })])));
    renderPage();

    const table = await screen.findByRole('table');
    const [, row] = within(table).getAllByRole('row');
    expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
      'Amara Okonkwo',
      'Female',
      '2 Mar 1984',
      '—',
    ]);
  });

  it('searches on the Search button, showing its loading state while the search runs', async () => {
    const search = deferred();
    const fetchMock = vi.fn().mockResolvedValueOnce(json([amara, daniel])).mockReturnValueOnce(search.promise);
    vi.stubGlobal('fetch', fetchMock);
    renderPage();
    await screen.findByText('Daniel Tremblay');

    await userEvent.type(screen.getByLabelText('Search by name'), 'oko');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(fetchMock).toHaveBeenLastCalledWith('/api/patients?search=oko');
    // Loading, not disabled: the button ignores activation but keeps focus.
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-busy', 'true');

    search.release(json([amara]));

    await waitFor(() => expect(screen.queryByText('Daniel Tremblay')).not.toBeInTheDocument());
    expect(screen.getByText('Amara Okonkwo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).not.toHaveAttribute('aria-disabled');
  });

  it('says "No patients match your search" when the search matches nobody', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json([amara])).mockResolvedValueOnce(json([])));
    renderPage();
    await screen.findByText('Amara Okonkwo');

    await userEvent.type(screen.getByLabelText('Search by name'), 'zzz');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByText('No patients match your search')).toBeInTheDocument();
  });

  it('says "No patients yet", not "No patients match your search", when the unfiltered list is empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json([])));
    renderPage();

    expect(await screen.findByText('No patients yet')).toBeInTheDocument();
    expect(screen.queryByText('No patients match your search')).not.toBeInTheDocument();
  });

  it('shows a "Something went wrong" card instead of the table when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('opens the patient when a row is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json([amara, daniel])));
    renderPage();

    await userEvent.click(await screen.findByText('Daniel Tremblay'));

    expect(screen.getByText('Detail page for p-0002')).toBeInTheDocument();
  });
});
