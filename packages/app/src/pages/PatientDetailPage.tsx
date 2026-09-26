import { useParams } from 'react-router-dom';

/** Page 2 — one patient's details. Built out in T-3.4. */
export function PatientDetailPage() {
  const { id } = useParams();

  return (
    <main>
      <h1>Patient {id}</h1>
    </main>
  );
}
