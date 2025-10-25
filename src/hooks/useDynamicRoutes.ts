// hooks/useDynamicRoutes.ts
import type { RootState } from '@/store';
import type { Router as RemixRouter } from '@remix-run/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { buildAppRouter, buildAuthRouter, createRouterForLocation } from 'routes';

export default function useDynamicRoutes(): RemixRouter | null {
  const [router, setRouter] = useState<RemixRouter | null>(null);
  const token = useSelector((s: RootState) => s.auth.token);

  // Initial bootstrap (decides whitelist vs full; already fetches if needed)
  useEffect(() => {
    let cancelled = false;
    createRouterForLocation(window.location.pathname).then((r) => {
      if (!cancelled) setRouter(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // React to token changes (login/logout)
  useEffect(() => {
    let cancelled = false;
    async function rebuild() {
      const r = token ? await buildAppRouter() : buildAuthRouter();
      if (!cancelled) setRouter(r);
    }
    // Skip running twice on very first mount by checking router presence
    if (router !== null) rebuild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return router;
}
