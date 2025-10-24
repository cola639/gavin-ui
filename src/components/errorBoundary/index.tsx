import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
  const err = useRouteError();
  const message = isRouteErrorResponse(err) ? `${err.status} ${err.statusText}` : (err as any)?.message || 'Something went wrong';

  return (
    <div style={{ padding: 24 }}>
      <h2>Oops…</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{String(message)}</pre>
    </div>
  );
}
