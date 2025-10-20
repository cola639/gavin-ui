import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BackButton({
  className = '',
  label = '⬅ Back',
  disabled = false,
  lockTime = 1000, // 防止多次点击的锁定时长 (ms)
  onBeforeBack, // 可选：返回前执行的函数（同步/异步）
  ...rest
}) {
  const navigate = useNavigate();
  const clickedRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const handleBack = async () => {
    if (disabled || clickedRef.current) return;

    clickedRef.current = true;
    setLoading(true);

    try {
      // 如果有前置回调（支持 async），返回 false 可以阻止返回
      if (onBeforeBack) {
        const shouldContinue = await onBeforeBack();
        if (shouldContinue === false) return;
      }
      navigate(-1);
    } finally {
      // 一定时间后解锁
      setTimeout(() => {
        clickedRef.current = false;
        setLoading(false);
      }, lockTime);
    }
  };

  return (
    <button
      type="button"
      className={`back-button ${className} ${loading ? 'loading' : ''}`}
      onClick={handleBack}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? '...' : label}
    </button>
  );
}

export default BackButton;
