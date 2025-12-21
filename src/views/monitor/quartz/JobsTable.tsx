// src/views/monitor/quartz/JobsTable.tsx
import IconTextButton from '@/components/button/IconTextButton';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, FileTextOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Dropdown, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig, TableRowSelection } from 'antd/es/table/interface';
import React, { useMemo } from 'react';
import type { QuartzJobRow } from './type';

const statusTag = (s: QuartzJobRow['status']) => {
  if (s === '0') {
    return (
      <Tag color="#9fe2dc" className="text-[#065f5b] font-semibold rounded-full px-3 py-[2px]">
        Normal
      </Tag>
    );
  }
  return (
    <Tag color="#fde68a" className="text-[#92400e] font-semibold rounded-full px-3 py-[2px]">
      Paused
    </Tag>
  );
};

const fmtTime = (v?: string) => (v ? v : '-');

type Props = {
  data: QuartzJobRow[];
  loading?: boolean;
  rowSelection: TableRowSelection<QuartzJobRow>;
  pagination: { current: number; pageSize: number; total: number };
  onChangePage: (page: number, pageSize: number) => void;

  onModify: (row: QuartzJobRow) => void;
  onDelete: (row: QuartzJobRow) => void;
  onRunOnce: (row: QuartzJobRow) => void;
  onOpenLogs: (row: QuartzJobRow) => void;
};

const JobsTable: React.FC<Props> = ({ data, loading, rowSelection, pagination, onChangePage, onModify, onDelete, onRunOnce, onOpenLogs }) => {
  const columns: ColumnsType<QuartzJobRow> = useMemo(
    () => [
      { title: 'TASK ID', dataIndex: 'jobId', key: 'jobId', width: 90 },
      { title: 'TASK NAME', dataIndex: 'jobName', key: 'jobName', render: (v: string) => <span className="font-medium">{v}</span> },
      { title: 'TASK GROUP', dataIndex: 'jobGroup', key: 'jobGroup', width: 140 },
      { title: 'INVOKE TARGET', dataIndex: 'invokeTarget', key: 'invokeTarget', ellipsis: true },
      { title: 'CRON', dataIndex: 'cronExpression', key: 'cronExpression', width: 160 },
      { title: 'STATUS', dataIndex: 'status', key: 'status', width: 120, render: statusTag },
      { title: 'CREATETIME', dataIndex: 'createTime', key: 'createTime', width: 180, render: (v: string) => fmtTime(v) },
      {
        title: 'ACTION',
        key: 'action',
        width: 160,
        render: (_: any, row: QuartzJobRow) => {
          const items: any[] = [
            {
              key: 'run',
              label: 'Execute Once',
              icon: <PlayCircleOutlined />,
              onClick: () => onRunOnce(row)
            },
            {
              key: 'logs',
              label: 'Execution Logs',
              icon: <FileTextOutlined />,
              onClick: () => onOpenLogs(row)
            }
          ];

          return (
            <div className="flex items-center gap-1">
              <IconTextButton className="!min-w-[40px]" size="small" icon={<EditOutlined />} label="" onClick={() => onModify(row)} />
              <IconTextButton className="!min-w-[40px]" size="small" danger icon={<DeleteOutlined />} label="" onClick={() => onDelete(row)} />

              <Dropdown menu={{ items }} trigger={['click']}>
                <span>
                  <IconTextButton className="!min-w-[40px]" size="small" icon={<EllipsisOutlined />} label="" onClick={() => {}} />
                </span>
              </Dropdown>
            </div>
          );
        }
      }
    ],
    [onDelete, onModify, onOpenLogs, onRunOnce]
  );

  const tablePagination: TablePaginationConfig = {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: false,
    showQuickJumper: false,
    showTotal: (t) => `Total: ${t}`,
    position: ['bottomRight']
  };

  return (
    <Table<QuartzJobRow>
      rowKey="jobId"
      columns={columns}
      dataSource={data}
      rowSelection={rowSelection}
      loading={loading}
      pagination={tablePagination}
      onChange={(p) => onChangePage(p.current ?? 1, p.pageSize ?? pagination.pageSize)}
    />
  );
};

export default JobsTable;
