import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, DescriptionList } from 'ui';
import { fetchPatient } from '../api/patients';
import type { PatientResult } from '../api/patients';
import styles from './Page.module.css';

type DetailState = { status: 'loading' } | PatientResult;

/** Page 2 — one patient's demographics. */
export function PatientDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  // Back returns to the list as it was (search included) when the list opened
  // this page; from a directly opened link it goes to the full list.
  const { state: locationState } = useLocation();
  const backTo =
    typeof locationState?.backTo === 'string' && locationState.backTo.startsWith('/') ? locationState.backTo : '/';
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

  // The browser tab names the page too: the patient once loaded.
  const documentTitle =
    state.status === 'ok' ? state.patient.name : state.status === 'not-found' ? 'Patient not found' : 'Patients';
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return (
    <main className={styles.page}>
      {/* Back is present in every state, including not-found and error. */}
      <div className={styles.backRow}>
        <Button variant="secondary" size="sm" onClick={() => navigate(backTo)}>
          Back
        </Button>
      </div>

      {state.status === 'loading' ? (
        <p className={styles.status} role="status">
          Loading…
        </p>
      ) : null}

      {/* Alerts, so a screen reader announces the outcome when it appears. */}
      {state.status === 'not-found' ? (
        <div role="alert">
          <Card title="Patient not found">
            <p className={styles.status}>There is no patient with this id. It may have been removed, or the link is wrong.</p>
          </Card>
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div role="alert">
          <Card title="Something went wrong">
            <p className={styles.status}>This patient could not be loaded. Check the connection and try again.</p>
          </Card>
        </div>
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
