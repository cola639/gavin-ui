import { startGithubOAuth } from '@/apis/oauth2';
import React from 'react';
import { toast } from 'react-toastify';

type Provider = 'google' | 'github' | 'facebook';

type Props = {
  provider: Provider;
  onClick?: () => void;
  disabled?: boolean;
};

const ICONS: Record<Provider, React.ReactNode> = {
  google: (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.4H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.6z"
      />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 16 4 9.1 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.5-11.2-8.3l-6.6 5.1C9 39.6 16 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.4H42V20H24v8h11.3c-1 2.8-3 5.2-5.6 6.8l.1.1 6.3 5.2C35.7 41.6 44 36 44 24c0-1.3-.1-2.3-.4-3.6z" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5C5.73.5.75 5.62.75 12.02c0 5.15 3.44 9.52 8.21 11.06.6.12.82-.27.82-.58v-2.2c-3.34.75-4.04-1.66-4.04-1.66-.55-1.42-1.34-1.8-1.34-1.8-1.1-.77.08-.76.08-.76 1.21.09 1.85 1.27 1.85 1.27 1.08 1.9 2.83 1.35 3.52 1.03.11-.81.42-1.35.76-1.66-2.67-.31-5.47-1.37-5.47-6.09 0-1.35.46-2.46 1.24-3.33-.13-.31-.54-1.56.11-3.26 0 0 1-.33 3.3 1.27.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.3-1.6 3.3-1.27 3.3-1.27.65 1.7.24 2.95.12 3.26.77.87 1.24 1.98 1.24 3.33 0 4.73-2.8 5.77-5.48 6.09.43.38.81 1.11.81 2.26v3.35c0 .32.22.7.83.58 4.77-1.54 8.2-5.9 8.2-11.06C23.25 5.62 18.27.5 12 .5z"
      />
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.08 10.13 24v-8.45H7.08v-3.48h3.05V9.43c0-3.04 1.79-4.72 4.54-4.72 1.32 0 2.7.24 2.7.24v2.98h-1.52c-1.5 0-1.97.95-1.97 1.92v2.3h3.35l-.54 3.48h-2.8V24C19.61 23.08 24 18.1 24 12.07z"
      />
    </svg>
  )
};

const LABELS: Record<Provider, string> = {
  google: 'Google',
  github: 'GitHub',
  facebook: 'Facebook'
};

const SocialButton: React.FC<Props> = ({ provider, onClick, disabled }) => {
  const handleClick = () => {
    if (disabled) return;

    // priority: consumer handler
    if (onClick) return onClick();

    // built-in: github oauth2 start
    if (provider === 'github') return startGithubOAuth();

    // others: do nothing by default
    return toast.info(`Only GitHub is supported for social login.`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700
        transition hover:bg-gray-50 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className={provider === 'github' ? 'text-gray-900' : ''}>{ICONS[provider]}</span>
      <span>{LABELS[provider]}</span>
    </button>
  );
};

export default SocialButton;
