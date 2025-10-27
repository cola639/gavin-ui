// src/App.tsx
import type { RootState } from '@/store';
import { buildFirstRoutes } from '@/store/slice/routeSlice';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { routes, loading } = useSelector((state: RootState) => state.routes);

  useEffect(() => {
    // call the plain async function (it internally dispatches updates)
    buildFirstRoutes();
  }, []);

  if (loading || !routes) {
    return <div style={{ padding: 24 }}>Initializing…</div>;
  }

  return (
    <>
      <ToastContainer />
      <RouterProvider router={routes} fallbackElement={<div>Loading…</div>} />
    </>
  );
}

export default App;
