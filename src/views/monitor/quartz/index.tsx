import ChromeTabs from '@/components/tabs/ChromeTabs';
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { Modal, message } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { JobsFilterBar, LogsFilterBar } from './FilterBar';
import JobsTable from './JobsTable';
import LogDetailModal from './LogDetailModal';
import LogsTable from './LogsTable';
import QuartzModal from './QuartzModal';

import type { JobFilters, LogFilters } from './FilterBar';
import type { QuartzJobRow, QuartzLogRow } from './type';

import {
  addQuartzJobApi,
  cleanAllQuartzJobLogsApi,
  deleteQuartzJobApi,
  deleteQuartzJobLogsApi,
  getQuartzJobLogsApi,
  getQuartzJobsApi,
  runQuartzJobApi,
  updateQuartzJobApi
} from '@/apis/quartz';

const DEFAULT_JOB_FILTERS: JobFilters = { jobName: '', jobGroup: null, status: null };
const DEFAULT_LOG_FILTERS: LogFilters = { jobName: '', jobGroup: null, status: null, range: null };

const QuartzView: React.FC = () => {
  const [activeKey, setActiveKey] = useState<'jobs' | 'logs'>('jobs');

  // ---------- jobs state ----------
  const [jobFilters, setJobFilters] = useState<JobFilters>(DEFAULT_JOB_FILTERS);
  const [jobRows, setJobRows] = useState<QuartzJobRow[]>([]);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobPageNum, setJobPageNum] = useState(1);
  const [jobPageSize] = useState(10);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobSelected, setJobSelected] = useState<React.Key[]>([]);
  const [jobRefreshKey, setJobRefreshKey] = useState(0);
  const jobReqSeq = useRef(0);

  // modal create/edit
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobModalMode, setJobModalMode] = useState<'create' | 'edit'>('create');
  const [jobEditInitial, setJobEditInitial] = useState<Partial<QuartzJobRow> | null>(null);

  // ---------- logs state ----------
  const [logFilters, setLogFilters] = useState<LogFilters>(DEFAULT_LOG_FILTERS);
  const [logRows, setLogRows] = useState<QuartzLogRow[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logPageNum, setLogPageNum] = useState(1);
  const [logPageSize] = useState(10);
  const [logTotal, setLogTotal] = useState(0);
  const [logSelected, setLogSelected] = useState<React.Key[]>([]);
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const logReqSeq = useRef(0);

  // log detail modal
  const [logDetailOpen, setLogDetailOpen] = useState(false);
  const [logDetailRow, setLogDetailRow] = useState<QuartzLogRow | null>(null);

  const jobQuery = useMemo(
    () => ({
      pageNum: jobPageNum,
      pageSize: jobPageSize,
      jobName: jobFilters.jobName?.trim() || undefined,
      jobGroup: jobFilters.jobGroup ?? undefined,
      status: jobFilters.status ?? undefined
    }),
    [jobFilters.jobGroup, jobFilters.jobName, jobFilters.status, jobPageNum, jobPageSize]
  );

  const logQuery = useMemo(() => {
    const range = logFilters.range as any[] | null | undefined;
    const beginTime = range?.[0] ? range[0].format('YYYY-MM-DD HH:mm:ss') : undefined;
    const endTime = range?.[1] ? range[1].format('YYYY-MM-DD HH:mm:ss') : undefined;

    return {
      pageNum: logPageNum,
      pageSize: logPageSize,
      jobName: logFilters.jobName?.trim() || undefined,
      jobGroup: logFilters.jobGroup ?? undefined,
      status: logFilters.status ?? undefined,
      beginTime,
      endTime
    };
  }, [logFilters.jobGroup, logFilters.jobName, logFilters.range, logFilters.status, logPageNum, logPageSize]);

  // ✅ auto fetch jobs (NO search button)
  useEffect(() => {
    if (activeKey !== 'jobs') return;

    const seq = ++jobReqSeq.current;
    const timer = window.setTimeout(async () => {
      setJobLoading(true);
      try {
        const res: any = await getQuartzJobsApi(jobQuery);
        if (seq !== jobReqSeq.current) return;

        const list: any[] = res?.rows ?? res?.data?.rows ?? [];
        setJobRows(
          list.map((x) => ({
            jobId: Number(x.jobId),
            jobName: x.jobName ?? '',
            jobGroup: x.jobGroup ?? '',
            invokeTarget: x.invokeTarget ?? '',
            cronExpression: x.cronExpression ?? '',
            misfirePolicy: x.misfirePolicy,
            concurrent: x.concurrent,
            status: (x.status ?? '0') as any,
            createTime: x.createTime
          }))
        );
        setJobTotal(Number(res?.total ?? res?.data?.total ?? list.length));
        setJobSelected([]);
      } catch (e) {
        console.error(e);
        message.error('Failed to load tasks');
      } finally {
        if (seq === jobReqSeq.current) setJobLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [activeKey, jobQuery, jobRefreshKey]);

  // ✅ auto fetch logs (NO search button)
  useEffect(() => {
    if (activeKey !== 'logs') return;

    const seq = ++logReqSeq.current;
    const timer = window.setTimeout(async () => {
      setLogLoading(true);
      try {
        const res: any = await getQuartzJobLogsApi(logQuery);
        if (seq !== logReqSeq.current) return;

        const list: any[] = res?.rows ?? res?.data?.rows ?? [];
        setLogRows(
          list.map((x) => ({
            jobLogId: Number(x.jobLogId ?? x.id),
            jobName: x.jobName ?? '',
            jobGroup: x.jobGroup ?? '',
            invokeTarget: x.invokeTarget,
            jobMessage: x.jobMessage ?? x.message,
            status: (x.status ?? '0') as any,
            exceptionInfo: x.exceptionInfo,
            createTime: x.createTime ?? x.createTimeStr ?? x.time ?? x.loginTime
          }))
        );
        setLogTotal(Number(res?.total ?? res?.data?.total ?? list.length));
        setLogSelected([]);
      } catch (e) {
        console.error(e);
        message.error('Failed to load logs');
      } finally {
        if (seq === logReqSeq.current) setLogLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [activeKey, logQuery, logRefreshKey]);

  // ----- jobs actions -----
  const bumpJobRefresh = () => setJobRefreshKey((k) => k + 1);
  const bumpLogRefresh = () => setLogRefreshKey((k) => k + 1);

  const onJobReset = () => {
    setJobFilters(DEFAULT_JOB_FILTERS);
    setJobPageNum(1);
    setJobSelected([]);
    bumpJobRefresh();
  };

  const onJobNew = () => {
    setJobModalMode('create');
    setJobEditInitial(null);
    setJobModalOpen(true);
  };

  const onJobDeleteSelected = () => {
    Modal.confirm({
      title: 'Delete selected tasks?',
      content: `Are you sure you want to delete ${jobSelected.length} task(s)?`,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      async onOk() {
        try {
          await deleteQuartzJobApi(jobSelected as any);
          message.success('Deleted');
          setJobPageNum(1);
          bumpJobRefresh();
        } catch (e) {
          console.error(e);
          message.error('Delete failed');
        }
      }
    });
  };

  const onJobDeleteRow = (row: QuartzJobRow) => {
    Modal.confirm({
      title: 'Delete this task?',
      content: `Are you sure you want to delete "${row.jobName}"?`,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      async onOk() {
        try {
          await deleteQuartzJobApi([row.jobId] as any);
          message.success('Deleted');
          setJobPageNum(1);
          bumpJobRefresh();
        } catch (e) {
          console.error(e);
          message.error('Delete failed');
        }
      }
    });
  };

  const onJobModify = (row: QuartzJobRow) => {
    setJobModalMode('edit');
    setJobEditInitial(row);
    setJobModalOpen(true);
  };

  const onJobSubmit = async (vals: any) => {
    try {
      if (jobModalMode === 'create') {
        await addQuartzJobApi(vals);
        message.success('Created');
      } else {
        await updateQuartzJobApi({ ...vals, jobId: jobEditInitial?.jobId });
        message.success('Updated');
      }
      setJobModalOpen(false);
      setJobPageNum(1);
      bumpJobRefresh();
    } catch (e) {
      console.error(e);
      message.error(jobModalMode === 'create' ? 'Create failed' : 'Update failed');
    }
  };

  const onRunOnce = async (row: QuartzJobRow) => {
    try {
      await runQuartzJobApi({ jobId: row.jobId, jobGroup: row.jobGroup });
      message.success('Triggered');
    } catch (e) {
      console.error(e);
      message.error('Trigger failed');
    }
  };

  const onOpenLogsFromRow = (row: QuartzJobRow) => {
    setActiveKey('logs');
    setLogFilters((prev) => ({ ...prev, jobName: row.jobName, jobGroup: row.jobGroup }));
    setLogPageNum(1);
    bumpLogRefresh();
  };

  // ----- logs actions -----
  const onLogReset = () => {
    setLogFilters(DEFAULT_LOG_FILTERS);
    setLogPageNum(1);
    setLogSelected([]);
    bumpLogRefresh();
  };

  const onLogDeleteSelected = () => {
    Modal.confirm({
      title: 'Delete selected logs?',
      content: `Are you sure you want to delete ${logSelected.length} log(s)?`,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      async onOk() {
        try {
          await deleteQuartzJobLogsApi(logSelected as any);
          message.success('Deleted');
          setLogPageNum(1);
          bumpLogRefresh();
        } catch (e) {
          console.error(e);
          message.error('Delete failed');
        }
      }
    });
  };

  const onLogClean = () => {
    Modal.confirm({
      title: 'Clean all logs?',
      content: 'This will delete ALL execution logs. Continue?',
      okText: 'Clean',
      okType: 'danger',
      centered: true,
      async onOk() {
        try {
          await cleanAllQuartzJobLogsApi();
          message.success('Cleaned');
          setLogPageNum(1);
          bumpLogRefresh();
        } catch (e) {
          console.error(e);
          message.error('Clean failed');
        }
      }
    });
  };

  const items = [
    {
      key: 'jobs',
      label: (
        <span className="inline-flex items-center gap-2">
          <ClockCircleOutlined />
          Quartz Tasks
        </span>
      ),
      children: (
        <>
          <JobsFilterBar
            filters={jobFilters}
            onFilters={(next) => {
              setJobFilters(next);
              setJobPageNum(1);
            }}
            onReset={onJobReset}
            selectedCount={jobSelected.length}
            onNew={onJobNew}
            onDelete={onJobDeleteSelected}
          />

          <JobsTable
            data={jobRows}
            loading={jobLoading}
            rowSelection={{ selectedRowKeys: jobSelected, onChange: setJobSelected }}
            pagination={{ current: jobPageNum, pageSize: jobPageSize, total: jobTotal }}
            onChangePage={(p) => setJobPageNum(p)}
            onModify={onJobModify}
            onDelete={onJobDeleteRow}
            onRunOnce={onRunOnce}
            onOpenLogs={onOpenLogsFromRow}
          />
        </>
      )
    },
    {
      key: 'logs',
      label: (
        <span className="inline-flex items-center gap-2">
          <FileTextOutlined />
          Execution Logs
        </span>
      ),
      children: (
        <>
          <LogsFilterBar
            filters={logFilters}
            onFilters={(next) => {
              setLogFilters(next);
              setLogPageNum(1);
            }}
            onReset={onLogReset}
            selectedCount={logSelected.length}
            onDelete={onLogDeleteSelected}
            onClean={onLogClean}
            onClose={() => setActiveKey('jobs')}
          />

          <LogsTable
            data={logRows}
            loading={logLoading}
            rowSelection={{ selectedRowKeys: logSelected, onChange: setLogSelected }}
            pagination={{ current: logPageNum, pageSize: logPageSize, total: logTotal }}
            onChangePage={(p) => setLogPageNum(p)}
            onDetail={(row) => {
              setLogDetailRow(row);
              setLogDetailOpen(true);
            }}
          />
        </>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-5">Quartz</h1>

      <ChromeTabs activeKey={activeKey} onChange={(k) => setActiveKey(k as any)} items={items as any} />

      <QuartzModal open={jobModalOpen} mode={jobModalMode} initial={jobEditInitial} onCancel={() => setJobModalOpen(false)} onSubmit={onJobSubmit} />

      <LogDetailModal open={logDetailOpen} row={logDetailRow} onClose={() => setLogDetailOpen(false)} />
    </div>
  );
};

export default QuartzView;
