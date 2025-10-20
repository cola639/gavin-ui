import React, { useRef, useState } from 'react';

export default function SubmitButton({
  onSubmit, // 异步函数：() => Promise<any>
  className = '', // 自定义样式
  disabled = false, // 外部禁用
  children, // 按钮内容（没传则用label）
  label = 'Submit', // 默认文字
  loadingText = 'Submitting...', // loading 时的文字
  onSuccess, // 成功回调 (result) => void
  onError, // 失败回调 (error) => void
  confirmMessage, // 可选：二次确认文案（有则弹窗确认）
  minInterval = 0, // 可选：执行结束后的冷却时间(ms)，避免立刻再次点击
  type = 'button', // 默认避免原生form提交，如需配合<form>改为 "submit"
  spinner, // 可选：自定义 loading 节点
  ...rest
}) {
  const [loading, setLoading] = useState(false);
  const coolingRef = useRef(false); // 冷却锁（完成后短时间内禁止再次点击）

  const handleClick = async (e) => {
    if (type === 'submit') {
      // 如果放在<form>里，阻止原生多次提交
      e.preventDefault();
    }

    if (disabled || loading || coolingRef.current) return;

    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const result = await onSubmit?.();
      onSuccess?.(result);
    } catch (err) {
      // 交给外部处理，默认打印
      onError ? onError(err) : console.error('SubmitButton error:', err);
    } finally {
      setLoading(false);

      if (minInterval > 0) {
        coolingRef.current = true;
        setTimeout(() => {
          coolingRef.current = false;
        }, minInterval);
      }
    }
  };

  const isDisabled = disabled || loading || coolingRef.current;

  return (
    <button className={className} onClick={handleClick} disabled={isDisabled} aria-busy={loading} aria-disabled={isDisabled} {...rest}>
      {loading ? (
        <>
          {spinner ?? (
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                border: '2px solid currentColor',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                marginRight: 8,
                verticalAlign: '-2px',
                animation: 'sb-spin 0.8s linear infinite'
              }}
            />
          )}
          {loadingText}
        </>
      ) : (
        children ?? label
      )}
      {/* 内联 keyframes（避免额外 CSS 文件） */}
      <style>{`
        @keyframes sb-spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </button>
  );
}
