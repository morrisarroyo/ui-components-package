import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, DescriptionList } from 'ui';
import { fetchPatient } from '../api/patients';
import type { PatientResult } from '../api/patients';
import styles from './Page.module.css';

type DetailState = { status: 'loading' } | PatientResult;

/** Page 2 — one patient's demographics. */
export function PatientDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<DetailState>({ status: 'loading' });

  useEffect(() => {
    let current = true;
    setState({ status: 'loading' });
    void fetchPatient(id).then((result) => {
      if (current) {
        setState(result);
      }
    });
    return () => {
      current = false;
    };
  }, [id]);

  return (
    <main className={styles.page}>
      {/* Back is present in every state, including not-found and error. */}
      <div className={styles.backRow}>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          Back
        </Button>
      </div>

      {state.status === 'loading' ? <p className={styles.status}>Loading…</p> : null}

      {state.status === 'not-found' ? (
        <Card title="Patient not found">
          <p className={styles.status}>There is no patient with this id. It may have been removed, or the link is wrong.</p>
        </Card>
      ) : null}

      {state.status === 'error' ? (
        <Card title="Something went wrong">
          <p className={styles.status}>This patient could not be loaded. Check the connection and try again.</p>
        </Card>
      ) : null}

      {state.status === 'ok' ? (
        <>
          <h1 className={styles.title}>{state.patient.name}</h1>
          <Card title="Demographics">
            <DescriptionList
              items={[
                { label: 'Name', value: state.patient.name },
                { label: 'Gender', value: state.patient.gender },
                { label: 'Birth date', value: state.patient.birthDate },
                { label: 'Phone', value: state.patient.phone },
                { label: 'Email', value: state.patient.email },
                { label: 'Address', value: state.patient.address },
              ]}
            />
          </Card>
        </>
      ) : null}
    </main>
  );
}
