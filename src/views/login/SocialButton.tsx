import React from 'react';

type Provider = 'google' | 'facebook';

const icons: Record<Provider, JSX.Element> = {
  google: (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 31.9 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 5.1 29.7 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 19.5-21 0-1.1-.1-2.2-.3-3.5z"
      />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.3 16 18.8 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 5.1 29.7 3 24 3 15.8 3 8.8 7.7 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 10.1-2 13.6-5.4l-6.3-5.2C29.2 35.8 26.8 37 24 37c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C8.9 40.1 15.9 45 24 45z" />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3C34.7 31.9 30.3 35 24 35c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C8.9 40.1 15.9 45 24 45c10.5 0 19.5-7.6 19.5-21 0-1.1-.1-2.2-.3-3.5z"
      />
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.7c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0022 12z" />
    </svg>
  )
};

const labels: Record<Provider, string> = {
  google: 'Sign up with Google',
  facebook: 'Sign up with Facebook'
};

const SocialButton: React.FC<{ provider: Provider }> = ({ provider }) => {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
    >
      {icons[provider]}
      <span>{labels[provider]}</span>
    </button>
  );
};

export default SocialButton;
