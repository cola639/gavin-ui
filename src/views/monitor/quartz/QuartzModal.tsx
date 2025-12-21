// src/views/monitor/quartz/QuartzModal.tsx
import { Checkbox, Modal, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import Dropdown from '@/components/form/dropdown/Dropdown';
import TextInput from '@/components/form/input/TextInput';
import inputStyles from '@/components/form/input/input.module.scss';
import RadioGroup from '@/components/form/radio/RadioGroup';

import type { QuartzJobRow } from './type';

// ✅ moved cron logic here
import {
  CRON_MODE_OPTIONS,
  CronMode,
  WEEKDAYS,
  buildCronExpression,
  buildHourOptions,
  buildMinuteOptions,
  buildMonthDayOptions,
  detectCronMode,
  getCronPreviewText
} from './cron';

type Errors = Partial<Record<'jobName' | 'jobGroup' | 'invokeTarget' | 'cronExpression', string>>;
type Option = { label: string; value: string };

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<QuartzJobRow> | null;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
};

const JOB_GROUP_OPTIONS: Option[] = [
  { label: 'DEFAULT', value: 'DEFAULT' },
  { label: 'SYSTEM', value: 'SYSTEM' }
];

const MISFIRE_OPTIONS: Option[] = [
  { label: 'Default', value: '1' },
  { label: 'Ignore Misfires', value: '2' },
  { label: 'Fire Once Now', value: '3' }
];

const CONCURRENT_OPTIONS: Option[] = [
  { label: 'Allow Concurrent', value: '0' },
  { label: 'Forbid Concurrent', value: '1' }
];

const STATUS_OPTIONS: Option[] = [
  { label: 'Normal', value: '0' },
  { label: 'Paused', value: '1' }
];

const QuartzModal: React.FC<Props> = ({ open, mode, initial, onCancel, onSubmit }) => {
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [jobName, setJobName] = useState('');
  const [jobGroup, setJobGroup] = useState('DEFAULT');
  const [invokeTarget, setInvokeTarget] = useState('');

  const [cronExpression, setCronExpression] = useState('');

  // cron builder state
  const [cronMode, setCronMode] = useState<CronMode>('daily');
  const [hh, setHh] = useState('9');
  const [mm, setMm] = useState('0');
  const [weekdays, setWeekdays] = useState<string[]>(['MON']);
  const [monthDay, setMonthDay] = useState('1');

  const [misfirePolicy, setMisfirePolicy] = useState('1');
  const [concurrent, setConcurrent] = useState('1');
  const [status, setStatus] = useState<'0' | '1'>('0');
  const [remark, setRemark] = useState('');

  const title = useMemo(() => (isEdit ? 'Edit Task' : 'New Task'), [isEdit]);

  const previewText = useMemo(() => {
    return getCronPreviewText({
      mode: cronMode,
      hh,
      mm,
      weekdays,
      monthDay,
      custom: cronExpression
    });
  }, [cronMode, hh, mm, weekdays, monthDay, cronExpression]);

  // init/reset when open
  useEffect(() => {
    if (!open) return;

    setErrors({});

    setJobName(initial?.jobName ?? '');
    setJobGroup(initial?.jobGroup ?? 'DEFAULT');
    setInvokeTarget(initial?.invokeTarget ?? '');

    const initCron = (initial?.cronExpression ?? '').trim();
    setCronExpression(initCron);

    const detected = detectCronMode(initCron);
    setCronMode(detected.mode);

    if (detected.hh) setHh(String(Number(detected.hh)));
    if (detected.mm) setMm(String(Number(detected.mm)));
    if (detected.dom) setMonthDay(String(Number(detected.dom)));
    if (detected.dows?.length) setWeekdays(detected.dows);

    setMisfirePolicy(String((initial?.misfirePolicy ?? 1) as any));
    setConcurrent(String((initial?.concurrent ?? 1) as any));
    setStatus((initial?.status ?? '0') as any);
    setRemark((initial as any)?.remark ?? '');
  }, [open, initial]);

  // auto-generate cron when not custom
  useEffect(() => {
    if (!open) return;
    if (cronMode === 'custom') return;

    const next = buildCronExpression({
      mode: cronMode,
      hh,
      mm,
      weekdays,
      monthDay,
      custom: cronExpression
    });

    setCronExpression(next);
    setErrors((prev) => ({ ...prev, cronExpression: undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cronMode, hh, mm, weekdays, monthDay]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!jobName.trim()) e.jobName = 'Please input task name.';
    if (!jobGroup) e.jobGroup = 'Please choose task group.';
    if (!invokeTarget.trim()) e.invokeTarget = 'Please input invoke target.';
    if (!cronExpression.trim()) e.cronExpression = 'Please input cron expression.';
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;

    const payload = {
      ...(initial?.jobId ? { jobId: initial.jobId } : {}),
      jobName: jobName.trim(),
      jobGroup,
      invokeTarget: invokeTarget.trim(),
      cronExpression: cronExpression.trim(),
      misfirePolicy: Number(misfirePolicy),
      concurrent: Number(concurrent),
      status,
      remark: remark.trim() || undefined
    };

    setLoading(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      message.error(isEdit ? 'Update failed' : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={submit}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={loading}
      width={580}
      style={{ maxWidth: '92vw' }}
      destroyOnClose
    >
      <div className="grid grid-cols-1 gap-4">
        {/* Row 1: Task Group + Task Name */}
        <div className="grid grid-cols-2 gap-3">
          <Dropdown
            label="Task Group"
            value={jobGroup}
            onChange={(v) => {
              setJobGroup(v as string);
              setErrors((prev) => ({ ...prev, jobGroup: undefined }));
            }}
            options={JOB_GROUP_OPTIONS}
          />

          <TextInput
            label="Task Name"
            value={jobName}
            onChange={(e) => {
              setJobName(e.target.value);
              setErrors((prev) => ({ ...prev, jobName: undefined }));
            }}
            error={errors.jobName}
            placeholder="Please input task name"
          />
        </div>

        {/* Row 2: Invoke Target + Status */}
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Invoke Target"
            value={invokeTarget}
            onChange={(e) => {
              setInvokeTarget(e.target.value);
              setErrors((prev) => ({ ...prev, invokeTarget: undefined }));
            }}
            error={errors.invokeTarget}
            placeholder="ryTask.ryParams('testJob')"
          />

          <RadioGroup label="Status" value={status} onChange={(v) => setStatus(v as any)} options={STATUS_OPTIONS} />
        </div>

        {/* Row 3: Misfire Policy + Concurrent */}
        <div className="grid grid-cols-2 gap-3">
          <Dropdown label="Misfire Policy" value={misfirePolicy} onChange={(v) => setMisfirePolicy(String(v))} options={MISFIRE_OPTIONS} />
          <Dropdown label="Concurrent" value={concurrent} onChange={(v) => setConcurrent(String(v))} options={CONCURRENT_OPTIONS} />
        </div>

        {/* Row 4: Cron Builder */}
        <div>
          <div className="text-sm font-semibold text-[var(--text-bold)] mb-1">Cron Builder</div>
          <div className="text-xs text-[var(--text-muted)] mb-3">
            Choose a schedule to generate the cron automatically. Switch to <b>Custom</b> to edit manually.
          </div>

          <RadioGroup label="" value={cronMode} onChange={(v) => setCronMode(v as CronMode)} options={CRON_MODE_OPTIONS} />

          <div className="mt-3">
            {(cronMode === 'daily' || cronMode === 'weekly' || cronMode === 'monthly') && (
              <div className="grid grid-cols-2 gap-3">
                <Dropdown label="Hour" value={hh} onChange={(v) => setHh(String(v))} options={buildHourOptions()} />
                <Dropdown label="Minute" value={mm} onChange={(v) => setMm(String(v))} options={buildMinuteOptions()} />
              </div>
            )}

            {cronMode === 'weekly' && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-[var(--text-bold)] mb-2">Weekdays</div>
                <Checkbox.Group value={weekdays} onChange={(vals) => setWeekdays((vals as string[])?.length ? (vals as string[]) : ['MON'])}>
                  <div className="flex flex-wrap gap-3">
                    {WEEKDAYS.map((d) => (
                      <Checkbox key={d.key} value={d.key}>
                        {d.label}
                      </Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              </div>
            )}

            {cronMode === 'monthly' && (
              <div className="mt-3">
                <Dropdown label="Day of Month" value={monthDay} onChange={(v) => setMonthDay(String(v))} options={buildMonthDayOptions()} />
              </div>
            )}

            <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-page)] p-3">
              <div className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wide">SCHEDULE PREVIEW</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-bold)]">{previewText}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                Tip: If your cron is complex, choose <b>Custom</b> and paste the expression directly.
              </div>
            </div>
          </div>
        </div>

        {/* Row 5: Cron Expression */}
        <TextInput
          label="Cron Expression"
          value={cronExpression}
          onChange={(e) => {
            setCronExpression(e.target.value);
            setErrors((prev) => ({ ...prev, cronExpression: undefined }));
          }}
          error={errors.cronExpression}
          placeholder="0/15 * * * * ?"
          disabled={cronMode !== 'custom'}
        />

        {/* Row 6: Remark */}
        <label className={inputStyles.field}>
          <span className={inputStyles.label}>Remark</span>
          <textarea
            className={inputStyles.input}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Please enter remark..."
            style={{ minHeight: 88, resize: 'vertical' }}
          />
        </label>
      </div>
    </Modal>
  );
};

export default QuartzModal;
