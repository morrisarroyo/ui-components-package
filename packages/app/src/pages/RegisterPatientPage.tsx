import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, TextField } from 'ui';
import { EMPTY_PATIENT_FORM, createPatient, validatePatientForm } from '../api/patients';
import type { PatientForm, PatientFormErrors, PatientFormField } from '../api/patients';
import styles from './Page.module.css';

interface FieldSpec {
  field: PatientFormField;
  label: string;
  helperText?: string;
  placeholder?: string;
}

const PERSON_FIELDS: FieldSpec[] = [
  { field: 'givenName', label: 'Given name' },
  { field: 'familyName', label: 'Family name' },
  { field: 'gender', label: 'Gender', helperText: 'female, male, other or unknown' },
  { field: 'birthDate', label: 'Birth date', helperText: 'YYYY-MM-DD', placeholder: 'e.g. 1984-03-02' },
];

const CONTACT_FIELDS: FieldSpec[] = [
  { field: 'phone', label: 'Phone (optional)' },
  { field: 'email', label: 'Email (optional)' },
  { field: 'line', label: 'Street address (optional)' },
  { field: 'city', label: 'City (optional)' },
  { field: 'region', label: 'Province or state (optional)' },
  { field: 'postalCode', label: 'Postal code (optional)' },
];

/** Page 3 — register a new patient, then open their record. */
export function RegisterPatientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PatientForm>(EMPTY_PATIENT_FORM);
  const [errors, setErrors] = useState<PatientFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.title = 'Register patient';
  }, []);

  function change(field: PatientFormField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    // Editing a field clears its error; the rest stay until the next submit.
    setErrors(({ [field]: _cleared, ...rest }) => rest);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailed(false);
    const found = validatePatientForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setSaving(true);
    const result = await createPatient(form);
    setSaving(false);
    if (result.status === 'ok') {
      navigate(`/patients/${encodeURIComponent(result.id)}`, { state: { backTo: '/' } });
    } else if (result.status === 'invalid') {
      setErrors(result.errors);
    } else {
      setFailed(true);
    }
  }

  function renderField({ field, label, helperText, placeholder }: FieldSpec) {
    return (
      <TextField
        key={field}
        label={label}
        value={form[field]}
        onChange={(value) => change(field, value)}
        helperText={helperText}
        placeholder={placeholder}
        errorMessage={errors[field]}
        disabled={saving}
      />
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Register patient</h1>

      {failed ? (
        // An alert, so a screen reader announces the failure when it appears.
        <div role="alert">
          <Card title="Something went wrong">
            <p className={styles.status}>The patient could not be registered. Check the connection and try again.</p>
          </Card>
        </div>
      ) : null}

      {/* noValidate: the form's own messages, on each field, are the only ones. */}
      <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Register patient">
        <Card title="Patient">
          <div className={styles.fieldGrid}>{PERSON_FIELDS.map(renderField)}</div>
        </Card>
        <Card title="Contact">
          <div className={styles.fieldGrid}>{CONTACT_FIELDS.map(renderField)}</div>
        </Card>
        <div className={styles.actions}>
          <Button type="submit" loading={saving}>
            Register
          </Button>
          <Button variant="secondary" disabled={saving} onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </form>
    </main>
  );
}
