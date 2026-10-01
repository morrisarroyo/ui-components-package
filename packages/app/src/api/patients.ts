/**
 * The website's only door to the mock API, and its one mapping layer.
 *
 * This module holds the typed calls to the patient endpoints, the single
 * translation from the API payload (`PatientDto`) to display values
 * (`PatientDisplay`), and the one from the Register patient form to the
 * payload it sends (`NewPatientDto`). It is the only place in `app` that knows an API field
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

/** The body of `POST /api/patients`: a patient without its id. */
export type NewPatientDto = Omit<PatientDto, 'id'>;

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

// --- Register patient form ------------------------------------------------------

/** What the Register patient form holds: one string per field, as typed. */
export interface PatientForm {
  givenName: string;
  familyName: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  line: string;
  city: string;
  region: string;
  postalCode: string;
}

export type PatientFormField = keyof PatientForm;

/** One message per invalid field; a field with no entry is valid. */
export type PatientFormErrors = Partial<Record<PatientFormField, string>>;

export const EMPTY_PATIENT_FORM: PatientForm = {
  givenName: '',
  familyName: '',
  gender: '',
  birthDate: '',
  phone: '',
  email: '',
  line: '',
  city: '',
  region: '',
  postalCode: '',
};

/** The outcome of registering a patient. */
export type CreatePatientResult =
  | { status: 'ok'; id: string }
  | { status: 'invalid'; errors: PatientFormErrors }
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

/** Today as `YYYY-MM-DD`, in local time. */
function isoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `YYYY-MM-DD` naming a day that exists: not `1984-02-30`. */
function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * The form's errors, by the same rules as the API (docs/API-CONTRACT.md), so
 * they show before anything is sent. Gender is matched ignoring case.
 */
export function validatePatientForm(form: PatientForm, today: Date = new Date()): PatientFormErrors {
  const errors: PatientFormErrors = {};
  if (form.givenName.trim() === '') {
    errors.givenName = 'Enter a given name.';
  }
  if (form.familyName.trim() === '') {
    errors.familyName = 'Enter a family name.';
  }
  if (!KNOWN_GENDERS.has(form.gender.trim().toLowerCase())) {
    errors.gender = 'Enter female, male, other or unknown.';
  }
  const birthDate = form.birthDate.trim();
  if (!isRealDate(birthDate)) {
    errors.birthDate = 'Enter a date as YYYY-MM-DD.';
  } else if (birthDate > isoDate(today)) {
    errors.birthDate = 'Birth date cannot be in the future.';
  }
  const email = form.email.trim();
  if (email !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.email = 'Enter an email address like name@example.com.';
  }
  return errors;
}

/** A present value, trimmed, or null. */
function trimmedOrNull(value: string): string | null {
  return presentOrNull(value)?.trim() ?? null;
}

/** The payload for a valid form: values trimmed, blank optional values null. */
export function toNewPatientDto(form: PatientForm): NewPatientDto {
  const address: AddressDto = {
    line: trimmedOrNull(form.line),
    city: trimmedOrNull(form.city),
    region: trimmedOrNull(form.region),
    postalCode: trimmedOrNull(form.postalCode),
  };
  const hasAddress = Object.values(address).some((part) => part !== null);
  return {
    givenName: form.givenName.trim(),
    familyName: form.familyName.trim(),
    gender: form.gender.trim().toLowerCase(),
    birthDate: form.birthDate.trim(),
    phone: trimmedOrNull(form.phone),
    email: trimmedOrNull(form.email),
    address: hasAddress ? address : null,
  };
}

/** The API's 400 field errors, keyed by form field; fields the form lacks are dropped. */
function toFormErrors(body: unknown): PatientFormErrors {
  const errors: PatientFormErrors = {};
  const apiErrors: unknown = typeof body === 'object' && body !== null && 'errors' in body ? body.errors : null;
  if (typeof apiErrors !== 'object' || apiErrors === null) {
    return errors;
  }
  for (const [field, messages] of Object.entries(apiErrors)) {
    if (field in EMPTY_PATIENT_FORM && Array.isArray(messages) && typeof messages[0] === 'string') {
      errors[field as PatientFormField] = messages[0];
    }
  }
  return errors;
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

/**
 * Registers a patient. A 400 whose errors name form fields is
 * `{ status: 'invalid' }` with those errors; any other failure is
 * `{ status: 'error' }`. Validate with `validatePatientForm` first.
 */
export async function createPatient(form: PatientForm): Promise<CreatePatientResult> {
  try {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toNewPatientDto(form)),
    });
    if (response.status === 400) {
      const errors = toFormErrors(await response.json());
      return Object.keys(errors).length > 0 ? { status: 'invalid', errors } : { status: 'error' };
    }
    if (!response.ok) {
      return { status: 'error' };
    }
    const body = (await response.json()) as PatientDto;
    return { status: 'ok', id: body.id };
  } catch {
    return { status: 'error' };
  }
}
