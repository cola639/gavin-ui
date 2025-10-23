import React from 'react';
import styles from './dropdown.module.scss';

type Option = { label: string; value: string };

type Props = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  id?: string;
  error?: string;
  placeholder?: string;
};

const Dropdown: React.FC<Props> = ({ label, value, onChange, options, id, error, placeholder }) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label className={styles.field} htmlFor={selectId}>
      <span className={styles.label}>{label}</span>
      <select
        id={selectId}
        className={`${styles.select} ${error ? styles.selectError : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="" disabled hidden>
          {placeholder || 'Please select'}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
};

export default Dropdown;
