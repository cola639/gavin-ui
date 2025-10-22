import React, { useState } from 'react';
import SocialButton from './SocialButton';

type FieldErrors = { nick?: string; email?: string; pwd?: string };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const hasLetter = /[A-Za-z]/;
const hasNumber = /\d/;

const Input = ({
  label,
  type = 'text',
  error,
  id,
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errId = `${inputId}-error`;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <input
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-3 outline-none ring-0 transition
            placeholder:text-gray-400 placeholder:italic
            ${error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-teal-300'} focus:shadow-md`}
          {...props}
        />
        {children}
      </div>
      {error ? (
        <p id={errId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      ) : null}
    </label>
  );
};

const LoginForm: React.FC = () => {
  const [show, setShow] = useState(false);

  // form values
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  // errors only appear after submit; any edit clears that field’s error
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(values: { nick: string; email: string; pwd: string }): FieldErrors {
    const e: FieldErrors = {};
    const n = values.nick.trim();
    if (!n) e.nick = 'Please enter your nickname.';
    else if (n.length < 2) e.nick = 'Nickname must be at least 2 characters.';
    else if (n.length > 32) e.nick = 'Nickname must be 32 characters or fewer.';
    else if (!/^[\w\- ]+$/.test(n)) e.nick = 'Only letters, numbers, space, _ and - allowed.';

    if (!values.email) e.email = 'Please enter your email address.';
    else if (!emailRegex.test(values.email)) e.email = 'Enter a valid email like you@example.com.';

    if (!values.pwd) e.pwd = 'Please enter your password.';
    else if (values.pwd.length < 8) e.pwd = 'Password must be at least 8 characters.';
    else if (!hasLetter.test(values.pwd) || !hasNumber.test(values.pwd)) e.pwd = 'Use letters and numbers (e.g., MyPass123).';

    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate({ nick, email, pwd });
    setErrors(newErrors);
    const ok = Object.keys(newErrors).length === 0;
    if (!ok) return;

    // no API call — console only
    console.log('SIGNUP_FORM_SUBMIT', {
      nickname: nick.trim(),
      email: email.trim(),
      passwordLength: pwd.length
    });
    setSubmitted(true);
  }

  // per-field change handlers that clear that field’s error immediately
  function onNickChange(v: string) {
    setNick(v);
    if (errors.nick) setErrors((e) => ({ ...e, nick: undefined }));
  }
  function onEmailChange(v: string) {
    setEmail(v);
    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
  }
  function onPwdChange(v: string) {
    setPwd(v);
    if (errors.pwd) setErrors((e) => ({ ...e, pwd: undefined }));
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] lg:p-10">
      <h2 className="text-3xl font-semibold text-gray-900">Create Account</h2>

      {/* Social */}
      <div className="mt-6 flex gap-3">
        <SocialButton provider="google" />
        <SocialButton provider="facebook" />
      </div>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold tracking-widest text-gray-400">- OR -</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Form */}
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {/* 1) Better placeholder copy + styling handled in Input */}
        <Input
          label="Nick Name"
          type="text"
          placeholder="e.g., Jane"
          value={nick}
          onChange={(e) => onNickChange(e.target.value)}
          error={errors.nick}
          autoComplete="nickname"
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
        />
        <Input
          label="Password"
          type={show ? 'text' : 'password'}
          placeholder="At least 8 characters, letters & numbers"
          value={pwd}
          onChange={(e) => onPwdChange(e.target.value)}
          error={errors.pwd}
          autoComplete="new-password"
        >
          <button
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:text-gray-600 active:scale-95"
          >
            {show ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </button>
        </Input>

        {/* 2) Submit (console only) */}
        <button
          type="submit"
          className="cursor-pointer mt-2 w-full rounded-xl bg-teal-300 px-6 py-3 text-center text-base font-semibold text-white transition hover:brightness-95 active:scale-[.99] active:brightness-90"
        >
          Create Account
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Already have an account?
          <a href="/login" className="ml-[8px] font-medium text-teal-600 hover:underline">
            Log in
          </a>
        </p>

        {submitted && <p className="mt-2 text-xs text-green-600">Submitted! Check the dev console for the payload.</p>}
      </form>
    </div>
  );
};

export default LoginForm;
