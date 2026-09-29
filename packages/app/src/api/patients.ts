/**
 * The website's only door to the mock API, and its one mapping layer.
 *
 * This module holds the typed calls to both patient endpoints and the single
 * translation from the API payload (`PatientDto`) to display values
 * (`PatientDisplay`). It is the only place in `app` that knows an API field
 * name, and the only place that decides whether a value is missing. Pages
 * receive display-ready values and a typed result, never a `Response`.
 *
 * A missing value is passed on as `null`; rendering it (as an em dash) is the
 * library's job, not this module's. See docs/API-CONTRACT.md, "Display mapping".
 */

// --- Wire shapes (docs/API-CONTRACT.md) ------------------------------------

export interface AddressDto {
  line: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
}

export interface PatientDto {
  id: string;
  givenName: string;
  familyName: string;
  gender: string;
  birthDate: string;
  phone: string | null;
  email: string | null;
  address: AddressDto | null;
}

// --- Display shape -----------------------------------------------------------

/** One patient, as the pages show it. `null` means the value is missing. */
export interface PatientDisplay {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

/** The outcome of loading the patient list. */
export type PatientListResult =
  | { status: 'ok'; patients: PatientDisplay[] }
  | { status: 'error' };

/** The outcome of loading one patient. */
export type PatientResult =
  | { status: 'ok'; patient: PatientDisplay }
  | { status: 'not-found' }
  | { status: 'error' };

// --- Mapping -----------------------------------------------------------------

const KNOWN_GENDERS = new Set(['female', 'male', 'other', 'unknown']);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A present, non-blank string, or null. */
function presentOrNull(value: string | null | undefined): string | null {
  return value === null || value === undefined || value.trim() === '' ? null : value;
}

/** `female` → "Female". A value outside the contract passes through unchanged. */
function formatGender(gender: string): string {
  return KNOWN_GENDERS.has(gender) ? gender.charAt(0).toUpperCase() + gender.slice(1) : gender;
}

/**
 * `1984-03-02` → "2 Mar 1984". Read from the string's parts, never through
 * `Date`, which would treat the value as UTC midnight and can show the
 * previous day west of Greenwich. A value that is not `YYYY-MM-DD` passes
 * through unchanged rather than being dropped.
 */
function formatBirthDate(birthDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  if (!match || month === undefined) {
    return birthDate;
  }
  return `${Number(match[3])} ${month} ${match[1]}`;
}

/** Present address parts joined with ", "; an address with none is missing. */
function formatAddress(address: AddressDto | null): string | null {
  if (address === null) {
    return null;
  }
  const parts = [address.line, address.city, address.region, address.postalCode]
    .map(presentOrNull)
    .filter((part): part is string => part !== null);
  return parts.length === 0 ? null : parts.join(', ');
}

/** The single translation from API payload to display values. */
export function toPatientDisplay(dto: PatientDto): PatientDisplay {
  return {
    id: dto.id,
    name: `${dto.givenName} ${dto.familyName}`,
    gender: formatGender(dto.gender),
    birthDate: formatBirthDate(dto.birthDate),
    phone: presentOrNull(dto.phone),
    email: presentOrNull(dto.email),
    address: formatAddress(dto.address),
  };
}

/**
 * The Table renders cells exactly as given, unlike DescriptionList, so a list
 * row spells a missing value out. Kept here so this module stays the one place
 * that decides how a missing value reaches the screen.
 */
export const MISSING_CELL = '—';

/** One patient as a patient-list row: the display values, and the id for navigation. */
export function toPatientRow(patient: PatientDisplay) {
  return {
    id: patient.id,
    name: patient.name,
    gender: patient.gender,
    birthDate: patient.birthDate,
    phone: patient.phone ?? MISSING_CELL,
  };
}

// --- Calls ---------------------------------------------------------------------

/**
 * Every patient, or those matching `search`. Any failure — the API not
 * running, a network error, a non-2xx status, a body that is not JSON — is
 * reported as `{ status: 'error' }`.
 */
export async function fetchPatients(search?: string): Promise<PatientListResult> {
  const query = search && search.trim() !== '' ? `?search=${encodeURIComponent(search.trim())}` : '';
  try {
    const response = await fetch(`/api/patients${query}`);
    if (!response.ok) {
      return { status: 'error' };
    }
    const body = (await response.json()) as PatientDto[];
    return { status: 'ok', patients: body.map(toPatientDisplay) };
  } catch {
    return { status: 'error' };
  }
}

/**
 * One patient by id. A 404 is `{ status: 'not-found' }`, distinct from any
 * other failure, which is `{ status: 'error' }`.
 */
export async function fetchPatient(id: string): Promise<PatientResult> {
  try {
    const response = await fetch(`/api/patients/${encodeURIComponent(id)}`);
    if (response.status === 404) {
      return { status: 'not-found' };
    }
    if (!response.ok) {
      return { status: 'error' };
    }
    const body = (await response.json()) as PatientDto;
    return { status: 'ok', patient: toPatientDisplay(body) };
  } catch {
    return { status: 'error' };
  }
}
