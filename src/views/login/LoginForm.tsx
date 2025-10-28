import { authUserApi } from '@/apis/auth'; // << use the user API you asked for
import { buildAppRoutes } from '@/store/slice/routeSlice';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SocialButton from './SocialButton';

type FieldErrors = { email?: string; pwd?: string };
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

type LoginFormProps = { onSwitchToSignup?: () => void };
const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(values: { email: string; pwd: string }): FieldErrors {
    const e: FieldErrors = {};
    if (!values.email) e.email = 'Please enter your email address.';
    else if (!emailRegex.test(values.email)) e.email = 'Enter a valid email like you@example.com.';

    if (!values.pwd) e.pwd = 'Please enter your password.';
    else if (values.pwd.length < 8) e.pwd = 'Password must be at least 8 characters.';
    else if (!hasLetter.test(values.pwd) || !hasNumber.test(values.pwd)) e.pwd = 'Use letters and numbers (e.g., MyPass123).';

    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate({ email, pwd });
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      setLoading(true);

      // API expects { username, password, code, uuid }
      const res = await authUserApi({
        email: email.trim(),
        password: pwd
      });

      // Adjust to your backend shape if needed
      const token = (res as any)?.token;
      if (!token) {
        throw new Error('Token missing in response');
      }

      localStorage.setItem('token', token);
      toast.success('Logged in successfully', { autoClose: 1500 });

      // after login success
      const next = await buildAppRoutes(); // fetch backend & rebuild router (no reload)
      next.navigate('/view/user', { replace: true }); // navigate using the new router instance

      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
      <h2 className="text-3xl font-semibold text-gray-900">Login</h2>

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
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          disabled={loading}
        />
        <Input
          label="Password"
          type={show ? 'text' : 'password'}
          placeholder="Enter your password"
          value={pwd}
          onChange={(e) => onPwdChange(e.target.value)}
          error={errors.pwd}
          autoComplete="current-password"
          disabled={loading}
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

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 w-full rounded-xl px-6 py-3 text-center text-base font-semibold text-white transition
            ${loading ? 'bg-teal-200 cursor-not-allowed' : 'bg-teal-300 hover:brightness-95 active:scale-[.99] active:brightness-90'}`}
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Don’t have an account?
          <button type="button" onClick={onSwitchToSignup} className="ml-2 font-medium text-teal-600 hover:underline">
            Create one
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
