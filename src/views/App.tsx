import type { Router as RemixRouter } from '@remix-run/router';
import useDynamicRoutes from 'hooks/useDynamicRoutes';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const router: RemixRouter | null = useDynamicRoutes();

  if (!router) {
    return (
      <>
        <ToastContainer />
        <div style={{ padding: 24 }}>Initializing…</div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} fallbackElement={<div>Loading…</div>} />
    </>
  );
}
export default App;
