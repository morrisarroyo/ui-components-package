import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { RegisterPatientPage } from './RegisterPatientPage';

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

// MemoryRouter rather than a data router; see PatientListPage.test.tsx.
function renderPage() {
  render(
    <MemoryRouter initialEntries={['/', '/patients/new']} initialIndex={1}>
      <Routes>
        <Route path="/" element={<p>List page</p>} />
        <Route path="/patients/new" element={<RegisterPatientPage />} />
        <Route path="/patients/:id" element={<DetailStub />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Given name'), 'Ada');
  await user.type(screen.getByLabelText('Family name'), 'Lovelace');
  await user.type(screen.getByLabelText('Gender'), 'female');
  await user.type(screen.getByLabelText('Birth date'), '1990-12-10');
}

const register = () => screen.getByRole('button', { name: 'Register' });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RegisterPatientPage', () => {
  it('shows an error on each invalid field and sends nothing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Birth date'), '1990/12/10');
    await user.click(register());

    expect(screen.getByLabelText('Given name')).toHaveAccessibleDescription('Enter a given name.');
    expect(screen.getByLabelText('Family name')).toHaveAccessibleDescription('Enter a family name.');
    expect(screen.getByLabelText('Gender')).toHaveAccessibleDescription('Enter female, male, other or unknown.');
    expect(screen.getByLabelText('Birth date')).toHaveAccessibleDescription('Enter a date as YYYY-MM-DD.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('clears a field’s error when the field is edited', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const user = userEvent.setup();
    renderPage();

    await user.click(register());
    await user.type(screen.getByLabelText('Given name'), 'A');

    expect(screen.getByLabelText('Given name')).not.toBeInvalid();
    expect(screen.getByLabelText('Family name')).toBeInvalid();
  });

  it('opens the new patient’s detail page once registered', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 'p-0013' }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage();

    await fillRequired(user);
    await user.type(screen.getByLabelText('Email (optional)'), 'ada@example.com');
    await user.click(register());

    expect(await screen.findByText('Detail page for p-0013')).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/patients');
    expect(JSON.parse(String(init?.body))).toMatchObject({ givenName: 'Ada', email: 'ada@example.com', phone: null });
  });

  it('shows Register as loading while saving, and keeps it focused', async () => {
    const response = deferred();
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(response.promise));
    const user = userEvent.setup();
    renderPage();

    await fillRequired(user);
    await user.click(register());

    expect(register()).toHaveAttribute('aria-disabled', 'true');
    expect(register()).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    response.release(json({ id: 'p-0013' }, 201));
    expect(await screen.findByText('Detail page for p-0013')).toBeInTheDocument();
  });

  it('shows the API’s field errors on their fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json({ status: 400, errors: { birthDate: ['Birth date cannot be in the future.'] } }, 400)),
    );
    const user = userEvent.setup();
    renderPage();

    await fillRequired(user);
    await user.click(register());

    await waitFor(() =>
      expect(screen.getByLabelText('Birth date')).toHaveAccessibleDescription('Birth date cannot be in the future.'),
    );
  });

  it('shows an alert on failure and keeps what was typed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const user = userEvent.setup();
    renderPage();

    await fillRequired(user);
    await user.click(register());

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByLabelText('Given name')).toHaveValue('Ada');
    expect(register()).toBeEnabled();
  });

  it('returns to the list on Cancel', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('List page')).toBeInTheDocument();
  });

  it('names the browser tab', () => {
    renderPage();

    expect(document.title).toBe('Register patient');
  });
});
