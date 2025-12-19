// src/views/monitor/server/index.tsx
import { Card, Descriptions, message, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';

import { getServerMonitorApi, type ServerDisk, type ServerMonitorData } from '@/apis/server';
import styles from './Server.module.scss';

type KvRow = { key: string; label: string; value: React.ReactNode };
type MemRow = { key: string; item: string; memory: React.ReactNode; jvm: React.ReactNode };

const pct = (n?: number) => (typeof n === 'number' && Number.isFinite(n) ? `${n.toFixed(2)}%` : '-');
const gb = (n?: number) => (typeof n === 'number' && Number.isFinite(n) ? `${n.toFixed(2)} GB` : '-');
const mb = (n?: number) => (typeof n === 'number' && Number.isFinite(n) ? `${n.toFixed(2)} MB` : '-');

const pickData = (res: any): ServerMonitorData | null => {
  // backend: { code, msg, data: {...} }
  const d = res?.data?.data ?? res?.data ?? null;
  if (!d?.cpu || !d?.mem || !d?.jvm || !d?.sys) return null;
  return d as ServerMonitorData;
};

const UsagePill: React.FC<{ value?: number }> = ({ value }) => {
  const v = typeof value === 'number' ? value : 0;
  const cls = v >= 85 ? styles.pillDanger : v >= 70 ? styles.pillWarn : styles.pillOk;
  return <span className={`${styles.pill} ${cls}`}>{pct(v)}</span>;
};

const ServerPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ServerMonitorData | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const res: any = await getServerMonitorApi();
        if (!alive) return;

        const d = pickData(res);
        if (!d) {
          message.error('Server monitor data format is invalid');
          return;
        }
        setData(d);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        message.error('Failed to load server monitor data');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const cpuRows: KvRow[] = useMemo(() => {
    const cpu = data?.cpu;
    return [
      { key: 'cpuNum', label: 'CPU Cores', value: cpu?.cpuNum ?? '-' },
      { key: 'userUsage', label: 'User Usage', value: pct(cpu?.userUsage) },
      { key: 'systemUsage', label: 'System Usage', value: pct(cpu?.systemUsage) },
      { key: 'waitRate', label: 'Wait Rate', value: pct(cpu?.waitRate) },
      { key: 'freeRate', label: 'Free Rate', value: pct(cpu?.freeRate) }
    ];
  }, [data]);

  const memRows: MemRow[] = useMemo(() => {
    const mem = data?.mem;
    const jvm = data?.jvm;

    return [
      { key: 'total', item: 'Total', memory: gb(mem?.totalGB), jvm: mb(jvm?.maxMemoryMB) },
      { key: 'used', item: 'Used', memory: gb(mem?.usedGB), jvm: mb(jvm?.usedMemoryMB) },
      { key: 'free', item: 'Free', memory: gb(mem?.freeGB), jvm: mb(jvm?.freeMemoryMB) },
      { key: 'usage', item: 'Usage', memory: pct(mem?.usagePercent), jvm: pct(jvm?.usagePercent) }
    ];
  }, [data]);

  const cpuTableCols: ColumnsType<KvRow> = useMemo(
    () => [
      { title: 'Item', dataIndex: 'label', key: 'label', width: 220 },
      { title: 'Value', dataIndex: 'value', key: 'value' }
    ],
    []
  );

  const memTableCols: ColumnsType<MemRow> = useMemo(
    () => [
      { title: 'Item', dataIndex: 'item', key: 'item', width: 220 },
      { title: 'Memory', dataIndex: 'memory', key: 'memory' },
      { title: 'JVM', dataIndex: 'jvm', key: 'jvm' }
    ],
    []
  );

  const diskColumns: ColumnsType<ServerDisk> = useMemo(
    () => [
      { title: 'Mount', dataIndex: 'dirName', key: 'dirName' },
      { title: 'FS Type', dataIndex: 'sysTypeName', key: 'sysTypeName', width: 120 },
      { title: 'Disk', dataIndex: 'typeName', key: 'typeName', width: 160 },
      { title: 'Total', dataIndex: 'total', key: 'total', width: 120 },
      { title: 'Free', dataIndex: 'free', key: 'free', width: 120 },
      { title: 'Used', dataIndex: 'used', key: 'used', width: 120 },
      {
        title: 'Usage',
        dataIndex: 'usagePercent',
        key: 'usagePercent',
        width: 120,
        render: (v: number) => <UsagePill value={v} />
      }
    ],
    []
  );

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Server Monitor</h1>

      <Spin spinning={loading}>
        {/* Top row: CPU + Memory */}
        <div className={styles.gridTop}>
          <Card className={styles.card} title={<span className={styles.cardTitle}>CPU</span>} bordered={false}>
            <Table<KvRow> size="small" columns={cpuTableCols} dataSource={cpuRows} pagination={false} rowKey="key" className={styles.simpleTable} />
          </Card>

          <Card className={styles.card} title={<span className={styles.cardTitle}>Memory</span>} bordered={false}>
            <Table<MemRow> size="small" columns={memTableCols} dataSource={memRows} pagination={false} rowKey="key" className={styles.simpleTable} />
          </Card>
        </div>

        {/* ✅ add spacing wrapper for the next 3 cards */}
        <div className={styles.stack}>
          <Card className={styles.card} title={<span className={styles.cardTitle}>Server Information</span>} bordered={false}>
            <Descriptions size="small" column={2} bordered className={styles.desc}>
              <Descriptions.Item label="Computer Name">{data?.sys?.computerName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Computer IP">{data?.sys?.computerIp ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="OS">{data?.sys?.osName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Arch">{data?.sys?.osArch ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="User Dir" span={2}>
                <span className={styles.mono}>{data?.sys?.userDir ?? '-'}</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className={styles.card} title={<span className={styles.cardTitle}>Java Virtual Machine</span>} bordered={false}>
            <Descriptions size="small" column={2} bordered className={styles.desc}>
              <Descriptions.Item label="JVM Name">{data?.jvm?.jvmName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Java Version">{data?.jvm?.version ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Start Time">{data?.jvm?.startTime ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Run Time">{data?.jvm?.runTime ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Java Home" span={2}>
                <span className={styles.mono}>{data?.jvm?.home ?? '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Input Args" span={2}>
                <pre className={styles.pre}>{Array.isArray(data?.jvm?.inputArgs) ? data?.jvm?.inputArgs.join(' ') : data?.jvm?.inputArgs ?? ''}</pre>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className={styles.card} title={<span className={styles.cardTitle}>Disk Status</span>} bordered={false}>
            <Table<ServerDisk>
              size="small"
              columns={diskColumns}
              dataSource={data?.disks ?? []}
              rowKey={(r) => `${r.dirName}-${r.typeName}`}
              pagination={false}
              className={styles.diskTable}
            />
          </Card>
        </div>
      </Spin>
    </main>
  );
};

export default ServerPage;
