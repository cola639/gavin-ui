// src/views/monitor/quartz/QuartzModal.tsx
import { Modal, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import Dropdown from '@/components/form/dropdown/Dropdown';
import inputStyles from '@/components/form/input/input.module.scss';
import TextInput from '@/components/form/input/TextInput';
import RadioGroup from '@/components/form/radio/RadioGroup';

import type { QuartzJobRow } from './type';

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
  { label: 'Default ', value: '1' },
  { label: 'Ignore Misfires ', value: '2' },
  { label: 'Fire Once Now ', value: '3' }
];

const CONCURRENT_OPTIONS: Option[] = [
  { label: 'Allow Concurrent ', value: '0' },
  { label: 'Forbid Concurrent ', value: '1' }
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
  const [misfirePolicy, setMisfirePolicy] = useState('1'); // dropdown
  const [concurrent, setConcurrent] = useState('1'); // dropdown
  const [status, setStatus] = useState<'0' | '1'>('0');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (!open) return;

    setErrors({});

    setJobName(initial?.jobName ?? '');
    setJobGroup(initial?.jobGroup ?? 'DEFAULT');
    setInvokeTarget(initial?.invokeTarget ?? '');
    setCronExpression(initial?.cronExpression ?? '');
    setMisfirePolicy(String(initial?.misfirePolicy ?? 1));
    setConcurrent(String(initial?.concurrent ?? 1));
    setStatus((initial?.status ?? '0') as any);
    setRemark((initial as any)?.remark ?? '');
  }, [open, initial]);

  const title = useMemo(() => (isEdit ? 'Edit Task' : 'New Task'), [isEdit]);

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
    <Modal title={title} open={open} onCancel={onCancel} onOk={submit} okText={isEdit ? 'Save' : 'Create'} confirmLoading={loading} destroyOnClose>
      <div className="grid grid-cols-1 gap-4">
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

        <TextInput
          label="Cron Expression"
          value={cronExpression}
          onChange={(e) => {
            setCronExpression(e.target.value);
            setErrors((prev) => ({ ...prev, cronExpression: undefined }));
          }}
          error={errors.cronExpression}
          placeholder="0/15 * * * * ?"
        />

        {/* ✅ both dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <Dropdown label="Misfire Policy" value={misfirePolicy} onChange={(v) => setMisfirePolicy(String(v))} options={MISFIRE_OPTIONS} />
          <Dropdown label="Concurrent" value={concurrent} onChange={(v) => setConcurrent(String(v))} options={CONCURRENT_OPTIONS} />
        </div>

        <RadioGroup label="Status" value={status} onChange={(v) => setStatus(v as any)} options={STATUS_OPTIONS} />

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
