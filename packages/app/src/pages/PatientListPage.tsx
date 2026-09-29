import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Table, TextField } from 'ui';
import type { TableColumn, TableRow } from 'ui';
import { fetchPatients, toPatientRow } from '../api/patients';
import type { PatientDisplay } from '../api/patients';
import styles from './Page.module.css';

const COLUMNS: TableColumn[] = [
  { key: 'name', header: 'Name' },
  { key: 'gender', header: 'Gender' },
  { key: 'birthDate', header: 'Birth date' },
  { key: 'phone', header: 'Phone' },
];

type ListState =
  | { status: 'loading' }
  | { status: 'ok'; patients: PatientDisplay[]; searched: boolean }
  | { status: 'error' };

/** Page 1 — every patient, searchable by name. */
export function PatientListPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ListState>({ status: 'loading' });
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  // Only the most recent request may update the page, so a slow earlier
  // response can never overwrite a newer one.
  const latestRequest = useRef(0);

  async function load(term?: string) {
    const request = ++latestRequest.current;
    const result = await fetchPatients(term);
    if (request !== latestRequest.current) {
      return;
    }
    setState(
      result.status === 'ok'
        ? { status: 'ok', patients: result.patients, searched: Boolean(term?.trim()) }
        : { status: 'error' },
    );
  }

  useEffect(() => {
    void load();
    return () => {
      // Unmounting (or StrictMode's rehearsal unmount) retires any request
      // still in flight.
      latestRequest.current++;
    };
  }, []);

  useEffect(() => {
    document.title = 'Patients';
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    await load(search);
    setSearching(false);
  }

  const rows: TableRow[] = state.status === 'ok' ? state.patients.map(toPatientRow) : [];

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Patients</h1>

      <Card>
        {/* A form, so Enter in the field searches too; the brief requires only the button. */}
        <form className={styles.searchRow} onSubmit={handleSearch} role="search">
          <div className={styles.searchField}>
            <TextField
              label="Search by name"
              value={search}
              onChange={setSearch}
              placeholder="e.g. Okonkwo"
            />
          </div>
          <Button type="submit" loading={searching}>
            Search
          </Button>
        </form>
      </Card>

      {state.status === 'loading' ? <p className={styles.status}>Loading…</p> : null}

      {state.status === 'error' ? (
        <Card title="Something went wrong">
          <p className={styles.status}>The patient list could not be loaded. Check the connection and try again.</p>
        </Card>
      ) : null}

      {state.status === 'ok' ? (
        <Table
          columns={COLUMNS}
          rows={rows}
          emptyMessage={state.searched ? 'No patients match your search' : 'No patients yet'}
          onRowClick={(row) => {
            if (typeof row.id === 'string') {
              navigate(`/patients/${encodeURIComponent(row.id)}`);
            }
          }}
        />
      ) : null}
    </main>
  );
}
