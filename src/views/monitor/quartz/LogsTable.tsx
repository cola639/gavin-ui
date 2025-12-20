import { EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig, TableRowSelection } from 'antd/es/table/interface';
import React, { useMemo } from 'react';
import type { QuartzLogRow } from './type';

const statusTag = (s: QuartzLogRow['status']) => {
  if (s === '0')
    return (
      <Tag color="#9fe2dc" className="text-[#065f5b] font-semibold rounded-full px-3 py-[2px]">
        Success
      </Tag>
    );
  return (
    <Tag color="#fde68a" className="text-[#92400e] font-semibold rounded-full px-3 py-[2px]">
      Fail
    </Tag>
  );
};

const fmtTime = (v?: string | number) => {
  if (v == null) return '-';
  if (typeof v === 'number') return new Date(v).toLocaleString();
  return v;
};

type Props = {
  data: QuartzLogRow[];
  loading?: boolean;
  rowSelection: TableRowSelection<QuartzLogRow>;
  pagination: { current: number; pageSize: number; total: number };
  onChangePage: (page: number, pageSize: number) => void;
  onDetail: (row: QuartzLogRow) => void;
};

const LogsTable: React.FC<Props> = ({ data, loading, rowSelection, pagination, onChangePage, onDetail }) => {
  const columns: ColumnsType<QuartzLogRow> = useMemo(
    () => [
      { title: 'LOG ID', dataIndex: 'jobLogId', key: 'jobLogId', width: 110 },
      { title: 'TASK NAME', dataIndex: 'jobName', key: 'jobName', render: (v: string) => <span className="font-medium">{v}</span> },
      { title: 'TASK GROUP', dataIndex: 'jobGroup', key: 'jobGroup', width: 140 },
      { title: 'INVOKE TARGET', dataIndex: 'invokeTarget', key: 'invokeTarget', ellipsis: true },
      { title: 'LOG INFO', dataIndex: 'jobMessage', key: 'jobMessage', ellipsis: true },
      { title: 'STATUS', dataIndex: 'status', key: 'status', width: 120, render: statusTag },
      { title: 'EXEC TIME', dataIndex: 'createTime', key: 'createTime', width: 190, render: fmtTime },
      {
        title: 'ACTION',
        key: 'action',
        width: 120,
        render: (_: any, row: QuartzLogRow) => (
          <Button type="link" icon={<EyeOutlined />} onClick={() => onDetail(row)}>
            Detail
          </Button>
        )
      }
    ],
    [onDetail]
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
    <Table<QuartzLogRow>
      rowKey="jobLogId"
      columns={columns}
      dataSource={data}
      rowSelection={rowSelection}
      loading={loading}
      pagination={tablePagination}
      onChange={(p) => onChangePage(p.current ?? 1, p.pageSize ?? pagination.pageSize)}
    />
  );
};

export default LogsTable;
