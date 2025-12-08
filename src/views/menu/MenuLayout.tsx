import IconTextButton from '@/components/button/IconTextButton';
import { Input } from 'antd';
import { Plus, RotateCcw, Search } from 'lucide-react';
import React from 'react';
import styles from './MenuLayout.module.scss';

type MenuLayoutProps = {
  name: string;
  onNameChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onNew: () => void;
  children: React.ReactNode;
};

const MenuLayout: React.FC<MenuLayoutProps> = ({ name, onNameChange, onSearch, onReset, onNew, children }) => {
  return (
    <div className={styles.page}>
      {/* LEFT FILTER PANEL */}
      <aside className={styles.left}>
        <div className={styles.card}>
          {/* Name + input in ONE line */}
          <div className={styles.fieldRow}>
            <label className={styles.label}>Name</label>
            <Input
              size="middle"
              placeholder="Enter menu name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onPressEnter={onSearch}
              className={styles.input}
            />
          </div>

          {/* Buttons row: Search + Reset */}
          <div className={styles.actionsRow}>
            <IconTextButton icon={<Search size={14} />} label="Search" onClick={onSearch} />
            <IconTextButton icon={<RotateCcw size={14} />} label="Reset" onClick={onReset} />{' '}
            <IconTextButton icon={<Plus size={14} />} label="New" type="primary" onClick={onNew} />
          </div>
        </div>
      </aside>

      {/* RIGHT TREE TABLE */}
      <section className={styles.right}>{children}</section>
    </div>
  );
};

export default MenuLayout;
