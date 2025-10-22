import React, { useState } from 'react';
import SocialButton from './SocialButton';

const Input = ({ label, type = 'text', children, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
    <div className="relative">
      <input
        type={type}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-teal-300 focus:shadow-md"
        {...props}
      />
      {children}
    </div>
  </label>
);

const LoginForm: React.FC = () => {
  const [show, setShow] = useState(false);

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
      <form className="grid gap-5">
        <Input label="Nick Name" type="text" placeholder="Input your nick name..." />
        <Input label="Email Address" type="email" placeholder="Input your email..." />
        <Input label="Password" type={show ? 'text' : 'password'} placeholder="Enter your password...">
          <button
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            {/* eye / eye-off */}
            {show ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.08A10.94 10.94 0 0112 5c5.52 0 10 4.5 10 7-0 0-1.29 2.53-4.06 4.48M6.1 6.1C3.9 7.47 2 10 2 12c0 0 1.3 2.53 4.07 4.48"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
          className="cursor-pointer mt-2 w-full rounded-xl bg-teal-300 px-6 py-3 text-center text-base font-semibold text-white transition hover:brightness-95 active:brightness-90"
        >
          Create Account
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Already have an account?
          <a href="/login" className="ml-[8px] font-medium text-teal-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
