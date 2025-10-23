import React from 'react';
import styles from './radio.module.scss';

type Option = { label: string; value: string };

type Props = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  name?: string;
};

const RadioGroup: React.FC<Props> = ({ label, value, onChange, options, name }) => {
  const group = name || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <div className={styles.group}>
        {options.map((o) => (
          <label key={o.value} className={styles.item}>
            <input className={styles.input} type="radio" name={group} checked={value === o.value} onChange={() => onChange?.(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
