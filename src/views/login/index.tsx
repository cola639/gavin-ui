import React from 'react';
import Illustration from './Illustration';
import styles from './index.module.scss';
import LoginForm from './LoginForm';

const LoginPage: React.FC = () => {
  return (
    <main className={`min-h-screen ${styles.page}`}>
      {/* Top Bar */}
      <header className="flex items-center justify-end px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>English (UK)</span>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </div>
      </header>

      {/* Split layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
        {/* Left: Illustration */}
        <div className="relative hidden lg:block">
          <Illustration />
          <div className="absolute inset-0 flex">
            <div className="m-auto max-w-[520px] pl-8">
              <h1 className="text-white/90 text-3xl font-semibold leading-snug">
                Find 3D Objects, Mockups
                <br />
                and Illustration here
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[560px]">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
