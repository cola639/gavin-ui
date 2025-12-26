// src/views/auth/OAuth2Callback.tsx
import { Spin, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { exchangeOAuthCodeApi } from '@/apis/oauth2';
import { buildAppRoutes } from '@/store/slice/routeSlice';
import { getToken, setToken } from '@/utils/auth';

function pickToken(res: any): string {
  return res?.token || res?.data?.token || res?.data?.data?.token || res?.data?.data?.data?.token || '';
}

/** Supports:
 *  - /oauth2/callback?code=xxxx
 *  - /oauth2/callback?redirect=/%3Fcode%3Dxxxx
 */
function pickCodeFromSearch(search: string) {
  const sp = new URLSearchParams(search);

  const direct = sp.get('code');
  if (direct) return direct;

  const redirectRaw = sp.get('redirect');
  if (!redirectRaw) return '';

  const decoded = decodeURIComponent(redirectRaw);
  const qIndex = decoded.indexOf('?');
  if (qIndex < 0) return '';

  const nestedQuery = decoded.slice(qIndex + 1);
  return new URLSearchParams(nestedQuery).get('code') || '';
}

function clearOAuthParamsFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('redirect');
  url.searchParams.delete('state');
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}

const DASHBOARD_PATH = '/dashboard';
const LOCK_PREFIX = 'oauth2_exchange:'; // sessionStorage lock, survives StrictMode remount

const OAuth2Callback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const code = useMemo(() => pickCodeFromSearch(location.search), [location.search]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // already logged in
    if (getToken()) {
      clearOAuthParamsFromUrl();
      navigate(DASHBOARD_PATH, { replace: true });
      return;
    }

    if (!code) {
      message.error('Missing OAuth2 code.');
      navigate('/login', { replace: true });
      return;
    }

    const lockKey = `${LOCK_PREFIX}${code}`;
    const lock = sessionStorage.getItem(lockKey);

    // ✅ If exchange already running (React 18 dev StrictMode remount), DON'T call again.
    if (lock === 'running') {
      // wait for the first request to finish and token to appear
      const startedAt = Date.now();
      const timer = window.setInterval(() => {
        if (getToken()) {
          window.clearInterval(timer);
          sessionStorage.setItem(lockKey, 'done');
          clearOAuthParamsFromUrl();
          navigate(DASHBOARD_PATH, { replace: true });
          return;
        }
        if (Date.now() - startedAt > 6000) {
          window.clearInterval(timer);
          sessionStorage.removeItem(lockKey);
          message.error('GitHub login is taking too long. Please try again.');
          navigate('/login', { replace: true });
        }
      }, 200);

      return () => window.clearInterval(timer);
    }

    // ✅ If already exchanged before (same session), just go dashboard.
    if (lock === 'done') {
      clearOAuthParamsFromUrl();
      navigate(DASHBOARD_PATH, { replace: true });
      return;
    }

    // ✅ Mark running immediately so any StrictMode remount won't re-call exchange.
    sessionStorage.setItem(lockKey, 'running');

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const res: any = await exchangeOAuthCodeApi(code);
        const token = pickToken(res);
        if (!token) throw new Error('Token not found in exchange response');

        setToken(token);
        sessionStorage.setItem(lockKey, 'done');

        clearOAuthParamsFromUrl();

        // optional: rebuild routes after token
        try {
          await buildAppRoutes();
        } catch {
          // ignore
        }

        if (!cancelled) navigate(DASHBOARD_PATH, { replace: true });
      } catch (e) {
        // allow retry
        sessionStorage.removeItem(lockKey);
        clearOAuthParamsFromUrl();
        // eslint-disable-next-line no-console
        console.error(e);
        message.error('OAuth2 exchange failed');
        if (!cancelled) navigate('/login', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

  useEffect(() => {
    console.log('OAuth2 exchange is disabled in this demo.');
  }, []);

  useEffect(() => {
    console.log('MOUNT');
    return () => console.log('UNMOUNT');
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spin spinning={loading} tip="Signing you in..." />
    </div>
  );
};

export default OAuth2Callback;
