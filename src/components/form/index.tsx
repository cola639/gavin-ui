import React, { useRef, useState } from 'react';
import Dropdown from './dropdown/Dropdown';
import styles from './index.module.scss';
import TextInput from './input/TextInput';
import RadioGroup from './radio/RadioGroup';

type Errors = Partial<Record<'nick' | 'dept' | 'post' | 'role' | 'phone' | 'email' | 'sex' | 'status', string>>;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const DEPARTMENTS = ['Design', 'Engineering', 'Finance', 'HR', 'Marketing'].map((x) => ({ label: x, value: x }));
const ROLES = ['IC', 'Lead', 'Manager', 'Director'].map((x) => ({ label: x, value: x }));
const POSTS = ['Full-time', 'Part-time', 'Contractor', 'Intern'].map((x) => ({ label: x, value: x }));
const SEXES = ['Male', 'Female', 'Other', 'Prefer not to say'].map((x) => ({ label: x, value: x }));

export type UserFormValues = {
  avatar?: string | null;
  nick: string;
  dept: string;
  post: string;
  role: string;
  phone: string;
  email: string;
  sex: string;
  status: 'Enable' | 'Disable';
};

export type UserFormProps = {
  initial?: Partial<UserFormValues>;
  submitLabel?: string;
  onSubmit: (values: UserFormValues) => void;
  onCancel?: () => void;
};

const UserForm: React.FC<UserFormProps> = ({ initial, submitLabel = 'Submit', onSubmit }) => {
  const [avatar, setAvatar] = useState<string | null>(initial?.avatar ?? null);
  const [nick, setNick] = useState(initial?.nick ?? '');
  const [dept, setDept] = useState(initial?.dept ?? '');
  const [post, setPost] = useState(initial?.post ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [sex, setSex] = useState(initial?.sex ?? '');
  const [status, setStatus] = useState<UserFormValues['status']>(initial?.status ?? 'Disable');

  const [errors, setErrors] = useState<Errors>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function validate(): Errors {
    const e: Errors = {};
    if (!nick.trim()) e.nick = 'Please enter a nickname.';
    if (!dept) e.dept = 'Please select a department.';
    if (!post) e.post = 'Please select a post.';
    if (!role) e.role = 'Please select a role.';
    if (!phone.trim()) e.phone = 'Please enter a phone number.';
    if (!email.trim()) e.email = 'Please enter an email address.';
    else if (!emailRe.test(email)) e.email = 'Enter a valid email like you@example.com.';
    if (!sex) e.sex = 'Please select sex.';
    if (!status) e.status = 'Please choose status.';
    return e;
  }

  const clear = (k: keyof Errors) => setErrors((prev) => ({ ...prev, [k]: undefined }));
  const onPickAvatar = () => fileRef.current?.click();
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setAvatar(URL.createObjectURL(f));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;
    onSubmit({ avatar, nick, dept, post, role, phone, email, sex, status });
  }

  return (
    <form onSubmit={submit} noValidate>
      {/* avatar */}
      <div className="flex flex-col items-center mb-4">
        <div className={`${styles.avatar} cursor-pointer`} onClick={onPickAvatar}>
          {avatar ? (
            <>
              <img src={avatar} alt="Avatar" />
              <button type="button" className={styles.uploadBadge} onClick={onPickAvatar}>
                +
              </button>
            </>
          ) : (
            <div className={styles.avatarPlaceholder}>+</div>
          )}
          <input ref={fileRef} className={styles.hiddenInput} type="file" accept="image/*" onChange={onFileChange} />
        </div>
        <div className={styles.helper}>PNG/JPG up to 2MB</div>
      </div>

      {/* fields grid (tailwind layout wrapper only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Nick Name"
          value={nick}
          onChange={(e) => {
            setNick(e.target.value);
            clear('nick');
          }}
          error={errors.nick}
          placeholder="e.g., +1 555 0123"
        />
        <TextInput
          label="Phone"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clear('phone');
          }}
          error={errors.phone}
          placeholder="e.g., +1 555 0123"
        />
        <TextInput
          label="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clear('email');
          }}
          error={errors.email}
          placeholder="you@example.com"
        />

        <Dropdown
          label="Department"
          value={dept}
          onChange={(v) => {
            setDept(v);
            clear('dept');
          }}
          options={DEPARTMENTS}
          error={errors.dept}
        />
        <Dropdown
          label="Role"
          value={role}
          onChange={(v) => {
            setRole(v);
            clear('role');
          }}
          options={ROLES}
          error={errors.role}
        />
        <Dropdown
          label="Post"
          value={post}
          onChange={(v) => {
            setPost(v);
            clear('post');
          }}
          options={POSTS}
          error={errors.post}
        />
        <Dropdown
          label="Sex"
          value={sex}
          onChange={(v) => {
            setSex(v);
            clear('sex');
          }}
          options={SEXES}
          error={errors.sex}
        />

        <div className="col-span-1">
          <RadioGroup
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v as any);
              clear('status');
            }}
            options={[
              { label: 'Enable', value: 'Enable' },
              { label: 'Disable', value: 'Disable' }
            ]}
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

export default UserForm;
