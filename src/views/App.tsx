import { Modal, Modal } from 'antd-mobile';
import { default as useCheckUpdate, default as useCheckUpdate } from 'hooks/useCheckUpdate';
import { useEffect, useEffect } from 'react';
import { ToastContainer, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { default as Routes, default as Routes } from 'routes';
import { default as VConsole, default as VConsole } from 'vconsole';

function App() {
  const hasUpdate = useCheckUpdate('1.0.0', 20 * 1000);

  if (hasUpdate) {
    Modal.confirm({
      title: '系统更新提示',
      content: '系统后台有更新，请点击“立即刷新”刷新页面。',
      confirmText: '立即刷新',
      cancelText: '稍后提醒我',
      onConfirm: () => {
        window.location.reload();
      }
    });
  }

  useEffect(() => {
    import.meta.env.VITE_VCONSOLE === 'open' && new VConsole();

    return () => {};
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes />
    </>
  );
}

export default App;

function App() {
  const hasUpdate = useCheckUpdate('1.0.0', 20 * 1000); // 检查更新的逻辑

  useEffect(() => {
    // 检查是否有更新，确保在 hasUpdate 改变时才触发 Modal 弹窗
    if (hasUpdate) {
      Modal.confirm({
        title: '系统更新提示',
        content: '系统后台有更新，请点击“立即刷新”刷新页面。',
        confirmText: '立即刷新',
        cancelText: '稍后提醒我',
        onConfirm: () => {
          window.location.reload(); // 刷新页面以加载新内容
        }
      });
    }
  }, [hasUpdate]); // 当 hasUpdate 变化时，触发该 effect

  useEffect(() => {
    import.meta.env.VITE_VCONSOLE === 'open' && new VConsole();

    return () => {};
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes />
    </>
  );
}

export default App;
