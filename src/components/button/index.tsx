import { FC, ReactElement } from 'react';
import styles from './index.module.scss';

interface Iindex {
  className?: string;
  children?: ReactElement | string;
  onClick: () => void;
}
const index: FC<Iindex> = ({ className, children, onClick }) => {
  return (
    <button className={`${styles.custom_btn} ${styles.btn_15} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default index;
