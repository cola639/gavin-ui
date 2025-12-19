// src/views/dept/DeptModal.tsx
import type { DeptDetail, DeptStatus } from '@/apis/dept';
import { addDeptApi, getDeptApi, normalizeDeptStatus, updateDeptApi } from '@/apis/dept';
import inputStyles from '@/components/form/input/input.module.scss';
import TextInput from '@/components/form/input/TextInput';
import RadioGroup from '@/components/form/radio/RadioGroup';
import { Modal, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

type Errors = Partial<Record<'deptName' | 'status', string>>;

const STATUS_OPTIONS = [
  { label: 'Enabled', value: 'Enabled' },
  { label: 'Disabled', value: 'Disabled' }
];

export type DeptModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  parent?: { deptId: number; deptName: string; ancestors: string } | null; // for create child
  deptId?: number | null; // for edit
  onClose: () => void;
  onSuccess: () => void;
};

const DeptModal: React.FC<DeptModalProps> = ({ open, mode, parent, deptId, onClose, onSuccess }) => {
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [deptName, setDeptName] = useState('');
  const [status, setStatus] = useState<DeptStatus>('Enabled');
  const [leader, setLeader] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [remark, setRemark] = useState('');

  const parentName = useMemo(() => (parent ? parent.deptName : 'Root'), [parent]);

  useEffect(() => {
    if (!open) return;

    // reset
    setErrors({});
    setDeptName('');
    setStatus('Enabled');
    setLeader('');
    setPhone('');
    setEmail('');
    setRemark('');

    // edit: load detail
    if (!isEdit || !deptId) return;

    (async () => {
      setLoading(true);
      try {
        const res: any = await getDeptApi(deptId);
        const d: DeptDetail = res?.data?.data ?? res?.data ?? res?.data?.data?.data ?? res?.data?.data?.dept ?? res?.data?.dept ?? res?.data?.data;

        setDeptName(d?.deptName ?? '');
        setStatus(normalizeDeptStatus(d?.status));
        setLeader(d?.leader ?? '');
        setPhone(d?.phone ?? '');
        setEmail(d?.email ?? '');
        setRemark(d?.remark ?? '');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        message.error('Failed to load dept detail');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, isEdit, deptId]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!deptName.trim()) e.deptName = 'Please enter dept name.';
    if (!status) e.status = 'Please choose status.';
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;

    const parentId = parent?.deptId ?? 0;
    const ancestors = parent ? `${parent.ancestors},${parent.deptId}` : '0';

    const payload = {
      parentId,
      ancestors,
      deptName: deptName.trim(),
      orderNum: 0,
      leader: leader.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      status, // ✅ "Enabled" | "Disabled"
      delFlag: 'Normal' as const,
      parentName: parent ? parent.deptName : undefined,
      remark: remark.trim() || undefined,
      children: []
    };

    setLoading(true);
    try {
      if (isEdit) {
        if (!deptId) return;
        await updateDeptApi({ ...payload, deptId });
        message.success('Dept updated');
      } else {
        await addDeptApi(payload);
        message.success('Dept added');
      }
      onSuccess();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      message.error(isEdit ? 'Update failed' : 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Dept' : 'Add Dept'}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText={isEdit ? 'Save' : 'Add'}
      confirmLoading={loading}
      destroyOnClose
    >
      <div className="grid grid-cols-1 gap-4">
        <TextInput label="Parent" value={parentName} onChange={() => {}} disabled />

        <TextInput
          label="Dept Name"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
          error={errors.deptName}
          placeholder="Please enter dept name..."
        />

        {/* ✅ Status as RadioGroup */}
        <RadioGroup
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v as DeptStatus);
            setErrors((prev) => ({ ...prev, status: undefined }));
          }}
          options={STATUS_OPTIONS}
        />

        <TextInput label="Leader" value={leader} onChange={(e) => setLeader(e.target.value)} placeholder="Please enter leader..." />
        <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Please enter phone..." />
        <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Please enter email..." />

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

export default DeptModal;
