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

describe('toPatientDisplay, field by field', () => {
  it.each([
    ['female', 'Female'],
    ['male', 'Male'],
    ['other', 'Other'],
    ['unknown', 'Unknown'],
  ])('capitalises the contract gender %s', (gender, expected) => {
    expect(toPatientDisplay({ ...complete, gender }).gender).toBe(expected);
  });

  it('joins the given and family name with one space', () => {
    expect(toPatientDisplay({ ...complete, givenName: 'Élise', familyName: 'Gagnon' }).name).toBe('Élise Gagnon');
  });

  it('treats a blank phone as missing', () => {
    expect(toPatientDisplay({ ...complete, phone: '' }).phone).toBeNull();
  });

  it('keeps a present value exactly as sent, without trimming it', () => {
    expect(toPatientDisplay({ ...complete, phone: '+1 416 555 0133 ' }).phone).toBe('+1 416 555 0133 ');
  });

  it('skips blank address parts as well as null ones', () => {
    const display = toPatientDisplay({
      ...complete,
      address: { line: '  ', city: 'Halifax', region: '', postalCode: 'B3H 1A1' },
    });

    expect(display.address).toBe('Halifax, B3H 1A1');
  });

  it.each(['1984-00-02', '1984-3-2', '02/03/1984', ''])(
    'passes the unreadable birth date %j through unchanged',
    (birthDate) => {
      expect(toPatientDisplay({ ...complete, birthDate }).birthDate).toBe(birthDate);
    },
  );

  it('formats the last month of the year', () => {
    expect(toPatientDisplay({ ...complete, birthDate: '1989-12-03' }).birthDate).toBe('3 Dec 1989');
  });

  it('does not change the payload it is given', () => {
    const dto = structuredClone(complete);

    toPatientDisplay(dto);

    expect(dto).toEqual(complete);
  });
});

describe('fetchPatients, more failures', () => {
  it('reports a body that is not JSON as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>proxy error</html>', { status: 200 })));

    expect(await fetchPatients()).toEqual({ status: 'error' });
  });

  it('returns an empty list, not an error, for no matches', async () => {
    respond(200, []);

    expect(await fetchPatients('zzz')).toEqual({ status: 'ok', patients: [] });
  });

  it('treats a 404 from the list endpoint as an error, not as no results', async () => {
    respond(404, {});

    expect(await fetchPatients()).toEqual({ status: 'error' });
  });
});

describe('fetchPatient, more failures', () => {
  it('encodes the id into the path', async () => {
    respond(200, complete);

    await fetchPatient('a/b c');

    expect(fetch).toHaveBeenCalledWith('/api/patients/a%2Fb%20c');
  });

  it('reports a network failure as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    expect(await fetchPatient('p-0001')).toEqual({ status: 'error' });
  });

  it('reports a body that is not JSON as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', { status: 200 })));

    expect(await fetchPatient('p-0001')).toEqual({ status: 'error' });
  });
});
