import React from 'react';
import styles from './input.module.scss';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  id?: string;
};

const TextInput: React.FC<Props> = ({ label, error, id, ...rest }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error ? (
        <span id={`${inputId}-error`} className={styles.error}>
          {error}
        </span>
      ) : null}
    </label>
  );
};

export default TextInput;
