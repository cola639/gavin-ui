// src/views/dept/DeptLayout.tsx
import type { DeptStatus } from '@/apis/dept';
import IconTextButton from '@/components/button/IconTextButton';
import { Input, Select } from 'antd';
import { Plus, RotateCcw, Search } from 'lucide-react';
import React from 'react';
import styles from './DeptLayout.module.scss';

type Props = {
  deptName: string;
  status: DeptStatus | null;

  onDeptNameChange: (v: string) => void;
  onStatusChange: (v: DeptStatus | null) => void;

  onSearch: () => void;
  onReset: () => void;
  onNew: () => void;

  children: React.ReactNode;
};

const DeptLayout: React.FC<Props> = ({ deptName, status, onDeptNameChange, onStatusChange, onSearch, onReset, onNew, children }) => {
  return (
    <div className={styles.page}>
      <aside className={styles.left}>
        <div className={styles.card}>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Dept Name</label>
            <Input
              size="middle"
              placeholder="Enter dept name"
              value={deptName}
              onChange={(e) => onDeptNameChange(e.target.value)}
              onPressEnter={onSearch}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.label}>Status</label>
            <Select
              value={status ?? undefined}
              onChange={(v) => onStatusChange((v as any) ?? null)}
              allowClear
              placeholder="All"
              className={styles.select}
              options={[
                { label: 'Enabled', value: 'Enabled' },
                { label: 'Disabled', value: 'Disabled' }
              ]}
            />
          </div>

          <div className={styles.actionsRow}>
            <IconTextButton icon={<Search size={14} />} label="Search" onClick={onSearch} />
            <IconTextButton icon={<RotateCcw size={14} />} label="Reset" onClick={onReset} />
            <IconTextButton icon={<Plus size={14} />} label="Add" type="primary" onClick={onNew} />
          </div>
        </div>
      </aside>

      <section className={styles.right}>{children}</section>
    </div>
  );
};

export default DeptLayout;
