import { useState, type FormEvent } from 'react';
import { Button, Card, DescriptionList, Table, TextField, type TableRow } from '../index';

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  healthCardNumber?: string;
  phone?: string;
}

const PATIENTS: Patient[] = [
  { id: 'p1', name: 'Ada Lovelace', dateOfBirth: '10 Dec 1985', healthCardNumber: '1234-567-890', phone: '555-0101' },
  { id: 'p2', name: 'Alan Turing', dateOfBirth: '23 Jun 1972', phone: '555-0102' },
  { id: 'p3', name: 'Grace Hopper', dateOfBirth: '9 Dec 1966', healthCardNumber: '9876-543-210' },
];

/** Stands in for a real API call: answers after a short delay, and fails for "error". */
function searchPatients(query: string): Promise<Patient[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (query.toLowerCase() === 'error') {
        reject(new Error('Search failed'));
      } else {
        resolve(PATIENTS.filter((patient) => patient.name.toLowerCase().includes(query.toLowerCase())));
      }
    }, 300);
  });
}

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'dateOfBirth', header: 'Date of birth' },
  { key: 'healthCardNumber', header: 'Health card' },
];

export function PatientLookup() {
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [results, setResults] = useState<Patient[] | null>(null);
  const [selected, setSelected] = useState<Patient | null>(null);

  async function search(event?: FormEvent) {
    event?.preventDefault();
    if (query.trim().length < 2) {
      setQueryError('Enter at least two characters.');
      return;
    }
    setQueryError('');
    setLoading(true);
    setFailed(false);
    setSelected(null);
    try {
      setResults(await searchPatients(query.trim()));
    } catch {
      setResults(null);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  // Table cells show exactly what they are given, so the screen decides how a
  // missing value reads. DescriptionList does this itself.
  const rows: TableRow[] = (results ?? []).map((patient) => ({
    id: patient.id,
    name: patient.name,
    dateOfBirth: patient.dateOfBirth,
    healthCardNumber: patient.healthCardNumber ?? '—',
  }));

  return (
    // Layout is the screen's job: plain elements, spaced with tokens. Widths
    // have no token; how wide a page is, is the page's decision.
    <div style={{ display: 'grid', gap: 'var(--ui-space-4)', maxWidth: 720 }}>
      <Card title="Find a patient">
        <form onSubmit={search} style={{ display: 'grid', gap: 'var(--ui-space-3)' }}>
          <TextField
            label="Name"
            value={query}
            onChange={setQuery}
            placeholder="At least two letters, e.g. Lo"
            errorMessage={queryError}
          />
          <div>
            <Button type="submit" loading={loading}>
              Search
            </Button>
          </div>
        </form>
      </Card>

      {failed ? (
        <Card title="Results" actions={<Button variant="secondary" size="sm" onClick={() => search()}>Try again</Button>}>
          <p>The search failed. Try again, and if it keeps failing, check your connection.</p>
        </Card>
      ) : null}

      {results ? (
        <Card title="Results">
          <Table
            columns={columns}
            rows={rows}
            emptyMessage="No patients match that name"
            onRowClick={(row) => setSelected(results.find((patient) => patient.id === row.id) ?? null)}
          />
        </Card>
      ) : null}

      {selected ? (
        <Card
          title={selected.name}
          actions={<Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Close</Button>}
        >
          <DescriptionList
            items={[
              { label: 'Date of birth', value: selected.dateOfBirth },
              { label: 'Health card', value: selected.healthCardNumber },
              { label: 'Phone', value: selected.phone },
            ]}
          />
        </Card>
      ) : null}
    </div>
  );
}
