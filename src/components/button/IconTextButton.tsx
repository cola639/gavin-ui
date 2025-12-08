import type { ButtonProps } from 'antd';
import { Button } from 'antd';
import React from 'react';
import styles from './IconTextButton.module.scss';

export interface IconTextButtonProps extends ButtonProps {
  label: React.ReactNode;
  icon: React.ReactNode;
}

const IconTextButton: React.FC<IconTextButtonProps> = ({ label, icon, size = 'small', className, ...rest }) => {
  return (
    <Button {...rest} size={size} icon={icon} className={[styles.iconBtn, className].filter(Boolean).join(' ')}>
      {label}
    </Button>
  );
};

export default IconTextButton;
