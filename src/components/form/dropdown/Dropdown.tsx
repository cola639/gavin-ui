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
  required?: boolean; // allow parent to control; defaults to true for placeholder styling
};

const Dropdown: React.FC<Props> = ({ label, value, onChange, options, id, error, placeholder, required = true }) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errId = `${selectId}-error`;

  return (
    <label className={styles.field} htmlFor={selectId}>
      <span className={styles.label}>{label}</span>

      <select
        id={selectId}
        className={`${styles.select} ${error ? styles.selectError : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required} /* enables :invalid for placeholder color */
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
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

      {error ? (
        <span id={errId} className={styles.error}>
          {error}
        </span>
      ) : null}
    </label>
  );
};

export default Dropdown;
