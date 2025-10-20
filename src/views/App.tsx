import { default as useCheckUpdate, default as useCheckUpdate } from 'hooks/useCheckUpdate';
import { useEffect, useEffect } from 'react';
import { ToastContainer, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { default as Routes, default as Routes } from 'routes';

function App() {
  const hasUpdate = useCheckUpdate('1.0.0', 20 * 1000);

  if (hasUpdate) {

  }

return (
    <>
  <ToastContainer />
      <Routes />
    </>
  ); 
}

export default App;

