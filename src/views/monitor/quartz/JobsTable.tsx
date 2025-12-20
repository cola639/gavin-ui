import { DeleteOutlined, EditOutlined, EllipsisOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Dropdown, Table, Tag } from 'antd';
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
        width: 240,
        render: (_: any, row: QuartzJobRow) => {
          const items = [
            {
              key: 'run',
              label: 'Execute Once',
              icon: <PlayCircleOutlined />,
              onClick: () => onRunOnce(row)
            },
            {
              key: 'logs',
              label: 'Execution Logs',
              onClick: () => onOpenLogs(row)
            }
          ];

          return (
            <div className="flex items-center gap-2">
              <Button type="link" icon={<EditOutlined />} onClick={() => onModify(row)}>
                Edit
              </Button>
              <Button type="link" danger icon={<DeleteOutlined />} onClick={() => onDelete(row)}>
                Delete
              </Button>
              <Dropdown menu={{ items }} trigger={['click']}>
                <Button type="link" icon={<EllipsisOutlined />}>
                  More
                </Button>
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
