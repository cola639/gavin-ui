// src/views/auth/OAuth2Callback.tsx
import { exchangeOAuthCodeApi } from '@/apis/oauth2';
import { buildAppRoutes } from '@/store/slice/routeSlice';
import { getToken, setToken } from '@/utils/auth';
import { Spin, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

const DASHBOARD_PATH = '/dashboard'; // change if your real dashboard route differs
const LOCK_PREFIX = 'oauth2_exchange_lock:'; // sessionStorage lock key

const OAuth2Callback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const code = useMemo(() => pickCodeFromSearch(location.search), [location.search]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ do nothing if no code (prevents exchange?code=)
    if (!code) {
      //   message.error('Missing OAuth2 code.');
      //   setLoading(false);
      //   navigate('/login', { replace: true });
      return;
    }

    const lockKey = `${LOCK_PREFIX}${code}`;

    // If StrictMode second mount happens while first request is in flight:
    // - don't call exchange again
    // - wait for token to appear, then navigate
    if (sessionStorage.getItem(lockKey) === '1') {
      const startedAt = Date.now();
      const timer = window.setInterval(async () => {
        const token = getToken();
        if (token) {
          window.clearInterval(timer);
          clearOAuthParamsFromUrl();
          try {
            const next = await buildAppRoutes();
            next?.navigate?.(DASHBOARD_PATH, { replace: true }) ?? navigate(DASHBOARD_PATH, { replace: true });
          } catch {
            navigate(DASHBOARD_PATH, { replace: true });
          } finally {
            setLoading(false);
          }
          return;
        }

        // timeout (avoid infinite spinner)
        if (Date.now() - startedAt > 6000) {
          window.clearInterval(timer);
          sessionStorage.removeItem(lockKey);
          clearOAuthParamsFromUrl();
          message.error('GitHub login is taking too long. Please try again.');
          setLoading(false);
          navigate('/login', { replace: true });
        }
      }, 250);

      return () => window.clearInterval(timer);
    }

    // ✅ acquire lock immediately so StrictMode second mount won't re-exchange
    sessionStorage.setItem(lockKey, '1');

    let cancelled = false;

    (async () => {
      try {
        const res: any = await exchangeOAuthCodeApi(code);
        const token = pickToken(res);

        if (!token) throw new Error('Token not found in exchange response');

        setToken(token);
        clearOAuthParamsFromUrl();
        message.success('Signed in with GitHub');

        // rebuild routes then navigate
        const next = await buildAppRoutes();
        next?.navigate?.(DASHBOARD_PATH, { replace: true }) ?? navigate(DASHBOARD_PATH, { replace: true });
      } catch (e) {
        // if exchange fails, release lock so user can retry
        sessionStorage.removeItem(lockKey);
        clearOAuthParamsFromUrl();
        // eslint-disable-next-line no-console
        console.error(e);
        message.error('OAuth2 exchange failed');
        navigate('/login', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spin spinning={loading} tip="Signing you in..." />
    </div>
  );
};

export default OAuth2Callback;
