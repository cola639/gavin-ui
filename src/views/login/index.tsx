import React, { useState } from 'react';
import styles from './index.module.scss';
import LoginForm from './LoginForm';
import logo from './logo.png';
import SignupForm from './SignupForm';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <main className={`min-h-screen ${styles.page}`}>
      <section
        className="
    grid grid-cols-1
    lg:grid-cols-[40%_60%]
    lg:grid-rows-[auto_1fr]
    items-stretch
    lg:gap-0
    min-h-[calc(100vh)]
  "
      >
        <div
          className="fixed top-1/2 left-[38%] -translate-x-1/2 -translate-y-1/2  pointer-events-none z-0                
  "
        >
          <img
            src={typeof logo === 'string' ? logo : ''}
            alt="Logo"
            className="rotate-[10deg] object-contain max-w-[35vw] max-h-[35vw] drop-shadow-xl"
          />
        </div>
        {/* RIGHT: Top bar (right col, row 1) */}
        <header
          className="
      col-start-1 lg:col-start-2
      row-start-1
      bg-white
      px-6 py-4
      lg:rounded-tl-[48px]
    "
        >
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>English (UK)</span>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </div>
          </div>
        </header>

        {/* RIGHT: Form (right col, row 2) */}
        <div
          className="
      col-start-1 lg:col-start-2
      row-start-2
      bg-white
      lg:rounded-bl-[48px]
      flex items-center justify-center
      p-6 lg:p-10
    "
        >
          <div className="w-full max-w-[520px]">
            {mode === 'login' ? <LoginForm onSwitchToSignup={() => setMode('signup')} /> : <SignupForm onSwitchToLogin={() => setMode('login')} />}
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
