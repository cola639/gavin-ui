import React from 'react';
import Illustration from './Illustration';
import styles from './index.module.scss';
import LoginForm from './LoginForm';

const LoginPage: React.FC = () => {
  return (
    <main className={`min-h-screen ${styles.page}`}>
      <section
        className="
    grid grid-cols-1
    lg:grid-cols-[30%_1fr]
    lg:grid-rows-[auto_1fr]
    items-stretch
    lg:gap-0
    min-h-[calc(100vh)]
  "
      >
        {/* RIGHT: Top bar (placed in right column, row 1) */}
        <header
          className="
      col-start-1 lg:col-start-2
      row-start-1
      bg-white
      px-6 py-4
      lg:rounded-tl-[48px]
      /* keep edges flush with the block below */
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

        <div
          className="
      col-start-1 lg:col-start-2
      row-start-2
      bg-white
      lg:rounded-bl-[48px]
      flex items-center justify-center
      p-6 lg:p-12
    "
        >
          <div className="w-full max-w-[560px]">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
