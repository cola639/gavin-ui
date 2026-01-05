// src/App.tsx
import type { AppDispatch, RootState } from '@/store';
import { buildFirstRoutes } from '@/store/slice/routeSlice';
import { fetchUserInfo } from '@/store/slice/userSlice'; // <-- if you refactored to thunk
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from 'utils/auth';

function App() {
  const { routes, loading } = useSelector((state: RootState) => state.routes);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    // call the plain async function (it internally dispatches updates)
    buildFirstRoutes();
    // then load user info if logged in
    if (getToken()) {
      dispatch(fetchUserInfo()).unwrap?.();
    }
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
