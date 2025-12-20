import { Popover } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import Icon from '@/components/Icons';
import { hasIcon, iconNames } from '@/components/Icons/iconRegistry';

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

const IconPicker: React.FC<Props> = ({ label, value, onChange, id, error, placeholder = 'Please select an icon...', disabled = false }) => {
  const inputId = id || slug(label);
  const errId = `${inputId}-error`;

  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState('');

  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedValue = (value ?? '').toLowerCase();
  const showPrefix = hasIcon(normalizedValue);

  const list = useMemo(() => {
    const q = kw.trim().toLowerCase();
    if (!q) return iconNames;
    return iconNames.filter((n) => n.includes(q));
  }, [kw]);

  // close on outside click (treat input + popover content as inside)
  useEffect(() => {
    if (!open) return;

    const onPointerDownCapture = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const root = containerRef.current;
      const overlay = document.querySelector(`.${styles.popover}`);

      if (root?.contains(target)) return;
      if (overlay?.contains(target)) return;

      setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDownCapture, true);
    return () => document.removeEventListener('pointerdown', onPointerDownCapture, true);
  }, [open]);

  const panel = (
    <div className={styles.panel} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <div className={styles.search}>
        <input className={inputStyles.input} value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Please input icon name..." autoFocus />
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
    <div ref={containerRef} className={inputStyles.field}>
      <label className={inputStyles.label} htmlFor={inputId}>
        {label}
      </label>

      <Popover
        open={open}
        trigger={[]} // controlled only
        placement="bottomLeft"
        content={panel}
        overlayClassName={styles.popover}
        getPopupContainer={() => containerRef.current ?? document.body}
      >
        <div
          className={styles.control}
          onMouseDown={(e) => {
            if (disabled) return;
            e.stopPropagation();
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          {showPrefix ? (
            <span className={styles.prefix} aria-hidden="true">
              <Icon name={normalizedValue} size={16} />
            </span>
          ) : null}

          <input
            id={inputId}
            className={[inputStyles.input, styles.triggerInput, showPrefix ? styles.withPrefix : '', error ? inputStyles.inputError : ''].join(' ')}
            value={value ?? ''}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? errId : undefined}
            onFocus={() => !disabled && setOpen(true)}
            onChange={(e) => onChange?.(e.target.value.toLowerCase())}
          />
        </div>
      </Popover>

      {error ? (
        <span id={errId} className={inputStyles.error}>
          {error}
        </span>
      ) : null}
    </div>
  );
};

export default IconPicker;
