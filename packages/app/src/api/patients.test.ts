import { fetchPatient, fetchPatients, toPatientDisplay } from './patients';
import type { PatientDto } from './patients';

const complete: PatientDto = {
  id: 'p-0001',
  givenName: 'Amara',
  familyName: 'Okonkwo',
  gender: 'female',
  birthDate: '1984-03-02',
  phone: '+1 416 555 0133',
  email: 'amara.okonkwo@example.com',
  address: { line: '412 Wellesley St E', city: 'Toronto', region: 'ON', postalCode: 'M4X 1H2' },
};

function respond(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('toPatientDisplay', () => {
  it('maps a complete patient to display values', () => {
    expect(toPatientDisplay(complete)).toEqual({
      id: 'p-0001',
      name: 'Amara Okonkwo',
      gender: 'Female',
      birthDate: '2 Mar 1984',
      phone: '+1 416 555 0133',
      email: 'amara.okonkwo@example.com',
      address: '412 Wellesley St E, Toronto, ON, M4X 1H2',
    });
  });

  it('passes missing phone, email and address on as null', () => {
    const display = toPatientDisplay({ ...complete, phone: null, email: null, address: null });

    expect(display.phone).toBeNull();
    expect(display.email).toBeNull();
    expect(display.address).toBeNull();
  });

  it('treats a blank string as missing', () => {
    expect(toPatientDisplay({ ...complete, email: '  ' }).email).toBeNull();
  });

  it('joins only the address parts that are present', () => {
    const display = toPatientDisplay({
      ...complete,
      address: { line: null, city: 'Ottawa', region: 'ON', postalCode: null },
    });

    expect(display.address).toBe('Ottawa, ON');
  });

  it('treats an address whose parts are all null as missing', () => {
    const display = toPatientDisplay({
      ...complete,
      address: { line: null, city: null, region: null, postalCode: null },
    });

    expect(display.address).toBeNull();
  });

  it('passes an unrecognised gender through unchanged', () => {
    expect(toPatientDisplay({ ...complete, gender: 'nonbinary' }).gender).toBe('nonbinary');
  });

  it('formats a birth date without shifting it by a day', () => {
    // 1 January would become 31 December west of Greenwich if the date were
    // parsed through Date as UTC midnight.
    expect(toPatientDisplay({ ...complete, birthDate: '2001-01-01' }).birthDate).toBe('1 Jan 2001');
  });

  it('passes a birth date it cannot read through unchanged', () => {
    expect(toPatientDisplay({ ...complete, birthDate: '1984-13-02' }).birthDate).toBe('1984-13-02');
  });
});

describe('fetchPatients', () => {
  it('returns mapped patients on success', async () => {
    respond(200, [complete]);

    const result = await fetchPatients();

    expect(result).toEqual({ status: 'ok', patients: [toPatientDisplay(complete)] });
    expect(fetch).toHaveBeenCalledWith('/api/patients');
  });

  it('sends a trimmed, encoded search and treats an empty one as no filter', async () => {
    respond(200, []);

    await fetchPatients('  amara oko ');
    await fetchPatients('   ');

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/patients?search=amara%20oko');
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/patients');
  });

  it('reports a non-2xx response as an error', async () => {
    respond(500, {});

    expect(await fetchPatients()).toEqual({ status: 'error' });
  });

  it('reports a network failure as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    expect(await fetchPatients()).toEqual({ status: 'error' });
  });
});

describe('fetchPatient', () => {
  it('returns the mapped patient on success', async () => {
    respond(200, complete);

    expect(await fetchPatient('p-0001')).toEqual({ status: 'ok', patient: toPatientDisplay(complete) });
  });

  it('reports a 404 as not found, distinct from an error', async () => {
    respond(404, { title: 'Not Found', status: 404 });

    expect(await fetchPatient('p-9999')).toEqual({ status: 'not-found' });
  });

  it('reports any other failure as an error', async () => {
    respond(502, {});

    expect(await fetchPatient('p-0001')).toEqual({ status: 'error' });
  });
});
