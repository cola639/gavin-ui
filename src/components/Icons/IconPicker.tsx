import { Popover } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

import Icon from '@/components/Icons';
import { hasIcon, iconNames } from '@/components/Icons/iconRegistry';

// ✅ reuse TextInput's styles to keep same height/style
import inputStyles from '@/components/form/input/input.module.scss';
import styles from './iconPicker.module.scss';

type Props = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;

  id?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
};

const slug = (label: string) => label.toLowerCase().replace(/\s+/g, '-');

const IconPicker: React.FC<Props> = ({ label, value, onChange, id, error, placeholder = 'e.g., bug', disabled = false }) => {
  const inputId = id || slug(label);
  const errId = `${inputId}-error`;

  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');

  const containerRef = useRef<HTMLLabelElement | null>(null);

  const normalizedValue = (value ?? '').toLowerCase();

  const list = useMemo(() => {
    const q = kw.trim().toLowerCase();
    if (!q) return iconNames;
    return iconNames.filter((n) => n.includes(q));
  }, [kw]);

  const panel = (
    <div className={styles.panel}>
      {/* Search input - EXACT same input style as TextInput */}
      <div className={styles.search}>
        <input className={inputStyles.input} value={kw} onChange={(e) => setKw(e.target.value)} placeholder="请输入图标名称" autoFocus />
      </div>

      <div className={styles.scroll}>
        <div className={styles.grid}>
          {list.map((name) => {
            const selected = name === normalizedValue;

            return (
              <button
                key={name}
                type="button"
                className={`${styles.item} ${selected ? styles.itemSelected : ''}`}
                onClick={() => {
                  onChange?.(name);
                  setOpen(false);
                }}
              >
                <span className={styles.iconBox}>
                  <Icon name={name} size={18} />
                </span>
                <span className={styles.name} title={name}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        {!list.length ? <div className={styles.empty}>No icons found.</div> : null}
      </div>
    </div>
  );

  return (
    <label ref={containerRef} className={inputStyles.field} htmlFor={inputId}>
      <span className={inputStyles.label}>{label}</span>

      <Popover
        open={open}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
        }}
        trigger="click"
        placement="bottomLeft"
        content={panel}
        overlayClassName={styles.popover}
        getPopupContainer={() => containerRef.current ?? document.body}
      >
        {/* Wrapper so we can place the prefix inside while keeping TextInput's input style */}
        <div className={styles.control}>
          <span className={styles.prefix} aria-hidden="true">
            {hasIcon(normalizedValue) ? <Icon name={normalizedValue} size={16} /> : <span>#</span>}
          </span>

          <input
            id={inputId}
            className={`${inputStyles.input} ${styles.withPrefix} ${error ? inputStyles.inputError : ''}`}
            value={value ?? ''}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? errId : undefined}
            onFocus={() => !disabled && setOpen(true)}
            onClick={() => !disabled && setOpen(true)}
            onChange={(e) => onChange?.(e.target.value.toLowerCase())}
          />
        </div>
      </Popover>

      {error ? (
        <span id={errId} className={inputStyles.error}>
          {error}
        </span>
      ) : null}
    </label>
  );
};

export default IconPicker;
