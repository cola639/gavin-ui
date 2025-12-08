// src/views/menu/MenuLayout.tsx
import IconTextButton from '@/components/button/IconTextButton';
import { Plus, RotateCcw, Search } from 'lucide-react';
import React from 'react';
import styles from './MenuLayout.module.scss';

type Props = {
  name: string;
  onNameChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onNew: () => void;
  children?: React.ReactNode; // right-side content (your menu tree table)
};

// small icon+text button wrapper
type IconTextButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  type?: 'default' | 'primary';
  danger?: boolean;
};

const MenuLayout: React.FC<Props> = ({ name, onNameChange, onSearch, onReset, onNew, children }) => {
  return (
    <div className={styles.page}>
      {/* LEFT FILTER PANEL */}
      <aside className={styles.sidebar}>
        <div className={styles.card}>
          {/* name label + input in one line */}
          <div className={styles.fieldRow}>
            <label className={styles.label} htmlFor="menu-name">
              Name
            </label>
            <input
              id="menu-name"
              className={styles.input}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter menu name"
            />
          </div>

          {/* buttons in one line */}
          <div className={styles.buttonRow}>
            <IconTextButton icon={<Search size={14} />} label="Search" onClick={onSearch} />
            <IconTextButton icon={<RotateCcw size={14} />} label="Reset" onClick={onReset} />
            <IconTextButton icon={<Plus size={14} />} label="New" type="primary" onClick={onNew} />{' '}
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <section className={styles.main}>
        <div className={styles.tableCard}>{children}</div>
      </section>
    </div>
  );
};

export default MenuLayout;
