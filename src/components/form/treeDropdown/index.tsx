import type { DeptNode } from '@/views/user/depTypes';
import { toAntTreeData } from '@/views/user/depTypes';
import { TreeSelect } from 'antd';
import React, { useMemo } from 'react';
import styles from './index.module.scss';

type Props = {
  label?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  tree?: DeptNode[];
  error?: string;
  placeholder?: string;
};

const DeptTreeDropdown: React.FC<Props> = ({ label = 'Department', value, onChange, tree = [], error, placeholder = 'Please select' }) => {
  const treeData = useMemo(() => toAntTreeData(tree), [tree]);
  const errId = `${label.toLowerCase().replace(/\s+/g, '-')}-error`;

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className="form-tree-dropdown">
        <TreeSelect
          className="w-full"
          treeData={treeData}
          value={value}
          onChange={(v) => onChange?.(v as string | undefined)}
          placeholder={placeholder}
          allowClear
          showSearch
          treeDefaultExpandAll
          treeNodeFilterProp="label"
          status={error ? 'error' : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
        />
      </div>

      {error ? (
        <span id={errId} className={styles.error}>
          {error}
        </span>
      ) : null}
    </label>
  );
};

export default DeptTreeDropdown;
