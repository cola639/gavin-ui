// src/apis/oauth2.ts
import request from 'utils/request';

export type OAuth2ExchangeResponse = {
  code?: number;
  msg?: string;
  token?: string;
  data?: any;
  [k: string]: any;
};

function trimSlash(s: string) {
  return s.replace(/\/+$/, '');
}

/**
 * If you have a dev proxy, you can leave this empty and it will use relative URLs.
 * If you don't, set one of these in .env:
 * - VITE_API_BASE_URL=http://localhost:8989
 * - VITE_BASE_API=http://localhost:8989
 * - VITE_API_URL=http://localhost:8989
 */
export function getBackendBaseUrl() {
  const env = (import.meta as any).env || {};
  const base = env.VITE_API_BASE_URL || env.VITE_BASE_API || env.VITE_API_URL || '';

  return base ? trimSlash(String(base)) : '';
}

/** Browser redirect (NOT ajax) */
export function startGithubOAuth() {
  const base = getBackendBaseUrl();
  window.location.assign(`${base}/auth/github/start`);
}

/** Exchange the temporary login code for JWT token */
export function exchangeOAuthCodeApi(code: string) {
  return request<OAuth2ExchangeResponse>({
    url: '/auth/exchange',
    method: 'get',
    params: { code }
  });
}

export function extractToken(resp: any): string | undefined {
  // backend puts token in top-level "token" usually
  return resp?.token ?? resp?.data?.token ?? resp?.data?.access_token ?? resp?.access_token;
}
