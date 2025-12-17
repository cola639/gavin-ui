// src/views/role/RoleForm.tsx
import TextInput from '@/components/form/input/TextInput';
import RadioGroup from '@/components/form/radio/RadioGroup';
import React, { useState } from 'react';

type Errors = Partial<Record<'roleName' | 'roleKey' | 'roleSort' | 'status', string>>;

export type RoleFormValues = {
  roleName: string;
  roleKey: string;
  roleSort: string; // keep as string for input
  status: 'Enabled' | 'Disabled';
  remark?: string;
};

export type RoleFormProps = {
  initial?: Partial<RoleFormValues>;
  submitLabel?: string;
  onSubmit: (values: RoleFormValues) => void;
};

const STATUS_OPTIONS = [
  { label: 'Enabled', value: 'Enabled' },
  { label: 'Disabled', value: 'Disabled' }
];

const RoleForm: React.FC<RoleFormProps> = ({ initial, submitLabel = 'Submit', onSubmit }) => {
  const [roleName, setRoleName] = useState(initial?.roleName ?? '');
  const [roleKey, setRoleKey] = useState(initial?.roleKey ?? '');
  const [roleSort, setRoleSort] = useState(initial?.roleSort ?? '0');
  const [status, setStatus] = useState<RoleFormValues['status']>(initial?.status ?? 'Enabled');

  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const e: Errors = {};
    if (!roleName.trim()) e.roleName = 'Please enter role name.';
    if (!roleKey.trim()) e.roleKey = 'Please enter role key.';
    if (roleSort.trim() === '') e.roleSort = 'Please enter sort.';
    else if (Number.isNaN(Number(roleSort))) e.roleSort = 'Sort must be a number.';
    if (!status) e.status = 'Please choose status.';
    return e;
  };

  const clear = (k: keyof Errors) => setErrors((prev) => ({ ...prev, [k]: undefined }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const eMap = validate();
    setErrors(eMap);
    if (Object.values(eMap).some(Boolean)) return;

    onSubmit({
      roleName: roleName.trim(),
      roleKey: roleKey.trim(),
      roleSort: roleSort.trim(),
      status
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Role Name"
          value={roleName}
          onChange={(e) => {
            setRoleName(e.target.value);
            clear('roleName');
          }}
          error={errors.roleName}
          placeholder="e.g., Admin"
        />

        <TextInput
          label="Role Key"
          value={roleKey}
          onChange={(e) => {
            setRoleKey(e.target.value);
            clear('roleKey');
          }}
          error={errors.roleKey}
          placeholder="e.g., admin"
        />

        <TextInput
          label="Role Sort"
          type="number"
          value={roleSort}
          onChange={(e) => {
            setRoleSort(e.target.value);
            clear('roleSort');
          }}
          error={errors.roleSort}
          placeholder="0"
        />

        <div className="col-span-1">
          <RadioGroup
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v as any);
              clear('status');
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-5">
        <button type="submit" className="w-full rounded-xl px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-strong)] text-white font-semibold">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;
