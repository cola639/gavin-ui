import useCheckUpdate from 'hooks/useCheckUpdate';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Routes from 'routes';

function App() {
  // const hasUpdate = useCheckUpdate('1.0.0', 20 * 1000);
  // if (hasUpdate) {
  // }

  return (
    <>
      <ToastContainer />
      <RouterProvider router={Routes} />
    </>
  );
}

export default App;
