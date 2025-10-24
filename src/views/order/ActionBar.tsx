import { Button, Checkbox, Tooltip } from 'antd';
import { CheckSquare, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import styles from './orders.module.scss';
import type { OrderRow } from './types';

type Props = {
  allRows: OrderRow[];
  selectedKeys: React.Key[];
  onDelete: () => void;
  onExport: () => void;
  onAdd?: () => void; // optional add handler
};

const ActionBar: React.FC<Props> = ({ allRows, selectedKeys, onDelete, onExport, onAdd }) => {
  const allSelected = allRows.length > 0 && selectedKeys.length === allRows.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;
  const nothingSelected = selectedKeys.length === 0;

  return (
    <div className={styles.actionBar}>
      {/* LEFT: everything lives on the left now */}
      <div className={styles.actionSide}>
        {/* Add */}
        <Tooltip title="Add a new order">
          <Button
            className="font-bold"
            type="primary"
            icon={<Plus className={styles.icon} />}
            onClick={() => {
              onAdd?.();
              console.log('ADD');
            }}
          >
            Add
          </Button>
        </Tooltip>

        {/* Delete — ALWAYS disabled when none selected; stays red on hover */}
        <Tooltip title={nothingSelected ? 'Select rows to delete' : 'Delete selected'}>
          <span>
            <Button danger disabled={nothingSelected} icon={<Trash2 className={styles.icon} />} onClick={onDelete}>
              Delete
            </Button>
          </span>
        </Tooltip>

        {/* Export — nicer primary pill style */}
        <Tooltip title="Export visible rows as Excel (CSV)">
          <Button className="font-bold" type="primary" icon={<FileSpreadsheet className={styles.icon} />} onClick={onExport}>
            Export
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ActionBar;
