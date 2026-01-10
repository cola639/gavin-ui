import type { ButtonProps } from 'antd';
import { Button } from 'antd';
import React, { useMemo } from 'react';
import { useSelector } from '@/store';
import styles from './IconTextButton.module.scss';

export interface IconTextButtonProps extends Omit<ButtonProps, 'role'> {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  /** Require this permission (or one of these) to render */
  requiredPermission?: string | string[];
  /** Require this role (or one of these) to render */
  requiredRole?: string | string[];
}

const IconTextButton: React.FC<IconTextButtonProps> = ({ label, icon, size = 'small', className, requiredPermission, requiredRole, ...rest }) => {
  const { permissions = [], roles = [] } = useSelector((s) => s.user);

  const canRender = useMemo(() => {
    const permList = requiredPermission ? (Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]) : [];
    const roleList = requiredRole ? (Array.isArray(requiredRole) ? requiredRole : [requiredRole]) : [];

    const hasPerm = permList.length === 0 || permList.every((p) => permissions.includes(p));
    const hasRole = roleList.length === 0 || roleList.every((r) => roles.includes(r));

    return hasPerm && hasRole;
  }, [requiredPermission, permissions, requiredRole, roles]);

  if (!canRender) return null;

  return (
    <Button {...rest} size={size} icon={icon} className={[styles.iconBtn, className].filter(Boolean).join(' ')}>
      {label}
    </Button>
  );
};

export default IconTextButton;
