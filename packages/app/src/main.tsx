import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// The library's stylesheet, imported once for the whole site. Nothing else
// from `ui` is imported anywhere except by package name.
import 'ui/styles.css';
import { PatientListPage } from './pages/PatientListPage';
import { PatientDetailPage } from './pages/PatientDetailPage';

const router = createBrowserRouter([
  { path: '/', element: <PatientListPage /> },
  { path: '/patients/:id', element: <PatientDetailPage /> },
]);

const container = document.getElementById('root');
if (container === null) {
  throw new Error('index.html is missing its #root element.');
}

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
