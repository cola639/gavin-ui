import { useEffect, useState } from 'react';

// 自定义 Hook 用于检查版本更新
const useCheckUpdate = (currentVersion, interval) => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // 定期检查更新的函数
    const checkForUpdates = setInterval(() => {
      fetch('/version.json') // 获取最新版本信息的 API
        .then((response) => {
          console.log('🚀 >> .then >> response:', response);
          return response.json(); // 正确地解析 JSON 数据
        })
        .then((data) => {
          console.log('🚀 >> .then >> data:', data); // 打印 data 对象
          if (data.version !== currentVersion) {
            setMessage('New version available! Fetching new resources...');
            // 可以触发更新或请求新资源
          }
        })
        .catch((error) => {
          console.error('Failed to check for updates:', error);
        });
    }, interval); // 传入的时间间隔，默认为1分钟

    return () => clearInterval(checkForUpdates); // 清理定时器
  }, [currentVersion, interval]); // 确保当 currentVersion 或 interval 变化时重新设置定时器

  return message;
};

export default useCheckUpdate;
