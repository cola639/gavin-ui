import { Modal } from 'antd';
import React from 'react';
import type { QuartzLogRow } from './type';

type Props = {
  open: boolean;
  row?: QuartzLogRow | null;
  onClose: () => void;
};

const LogDetailModal: React.FC<Props> = ({ open, row, onClose }) => {
  return (
    <Modal title="Execution Log Detail" open={open} onCancel={onClose} footer={null} width={800} destroyOnClose>
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div>
          <span className="font-semibold">Log ID:</span> {row?.jobLogId}
        </div>
        <div>
          <span className="font-semibold">Task:</span> {row?.jobName} / {row?.jobGroup}
        </div>
        <div>
          <span className="font-semibold">Invoke Target:</span> {row?.invokeTarget ?? '-'}
        </div>
        <div>
          <span className="font-semibold">Status:</span> {row?.status === '0' ? 'Success' : 'Fail'}
        </div>
        <div>
          <span className="font-semibold">Message:</span> {row?.jobMessage ?? '-'}
        </div>
        <div>
          <span className="font-semibold">Exception:</span>
        </div>
        <pre className="p-3 rounded-lg border border-[var(--border)] bg-gray-50 overflow-auto">{row?.exceptionInfo ?? '-'}</pre>
      </div>
    </Modal>
  );
};

export default LogDetailModal;
