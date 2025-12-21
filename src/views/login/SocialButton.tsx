import React from 'react';

type Provider = 'google' | 'facebook' | 'github';

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
  ),
  github: (
    <svg width="18" height="18" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"></path>
    </svg>
  )
};

const labels: Record<Provider, string> = {
  google: 'Login with Google',
  facebook: 'Login with Facebook',
  github: 'Login with GitHub'
};

const SocialButton: React.FC<{ provider: Provider }> = ({ provider }) => {
  return (
    <button
      type="button"
      className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
    >
      {icons[provider]}
      <span>{labels[provider]}</span>
    </button>
  );
};

export default SocialButton;
