import React, { useRef, useState } from 'react';
import Dropdown from './dropdown/Dropdown';
import styles from './index.module.scss';
import TextInput from './input/TextInput';
import RadioGroup from './radio/RadioGroup';

type Errors = Partial<Record<'nick' | 'dept' | 'post' | 'role' | 'phone' | 'email' | 'sex' | 'status', string>>;

const DEPARTMENTS = ['Design', 'Engineering', 'Finance', 'HR', 'Marketing'].map((x) => ({ label: x, value: x }));
const ROLES = ['IC', 'Lead', 'Manager', 'Director'].map((x) => ({ label: x, value: x }));
const POSTS = ['Full-time', 'Part-time', 'Contractor', 'Intern'].map((x) => ({ label: x, value: x }));
const SEXES = ['Male', 'Female', 'Other', 'Prefer not to say'].map((x) => ({ label: x, value: x }));

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const UserFormPage: React.FC = () => {
  // values
  const [avatar, setAvatar] = useState<string | null>(null);
  const [nick, setNick] = useState('Alex Smith');
  const [dept, setDept] = useState<string>('');
  const [post, setPost] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [sex, setSex] = useState<string>('');
  const [status, setStatus] = useState<string>('Disable');

  // errors (only set on submit; clear when editing)
  const [errors, setErrors] = useState<Errors>({});

  const fileRef = useRef<HTMLInputElement>(null);

  function onPickAvatar() {
    fileRef.current?.click();
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
  }

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const eMap = validate();
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    // Placeholder — log only
    console.log('ADD_USER', {
      avatar: avatar ? '(image selected)' : null,
      nick,
      dept,
      post,
      role,
      phone,
      email,
      sex,
      status
    });
    alert('Submitted! Check console for payload.');
  }

  // helpers to clear error on edit
  const clear = (k: keyof Errors) => setErrors((prev) => ({ ...prev, [k]: undefined }));

  return (
    <main className={styles.wrap}>
      <form className={styles.card} onSubmit={submit} noValidate>
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar} onClick={onPickAvatar}>
              {avatar ? (
                <>
                  <img src={avatar} alt="Avatar" />
                  {/* show a small badge to change image when one exists */}
                  <button
                    type="button"
                    className={styles.uploadBadge}
                    title="Change photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPickAvatar();
                    }}
                  >
                    +
                  </button>
                </>
              ) : (
                // Default: big "+" placeholder
                <div className={styles.avatarPlaceholder}>+</div>
              )}

              {/* Full clickable layer to open file picker */}
              <input ref={fileRef} className={styles.hiddenInput} type="file" accept="image/*" onChange={onFileChange} />
            </div>
            <div className={styles.helper}>PNG/JPG up to 2MB</div>
          </div>
        </div>

        <div className={styles.grid}>
          {/* left col */}
          <TextInput
            label="Nick Name"
            value={nick}
            onChange={(e) => {
              setNick(e.target.value);
              clear('nick');
            }}
            error={errors.nick}
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
            error={errors.dept}
            options={DEPARTMENTS}
          />
          <Dropdown
            label="Role"
            value={role}
            onChange={(v) => {
              setRole(v);
              clear('role');
            }}
            error={errors.role}
            options={ROLES}
          />
          <Dropdown
            label="Post"
            value={post}
            onChange={(v) => {
              setPost(v);
              clear('post');
            }}
            error={errors.post}
            options={POSTS}
          />
          <Dropdown
            label="Sex"
            value={sex}
            onChange={(v) => {
              setSex(v);
              clear('sex');
            }}
            error={errors.sex}
            options={SEXES}
          />
          <RadioGroup
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v);
              clear('status');
            }}
            options={[
              { label: 'Enable', value: 'Enable' },
              { label: 'Disable', value: 'Disable' }
            ]}
          />
        </div>

        <div className={styles.controls}>
          <button type="submit" className={styles.btn}>
            Add User
          </button>
        </div>
      </form>
    </main>
  );
};

export default UserFormPage;
