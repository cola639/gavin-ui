// src/apis/common.ts
import { getToken } from '@/utils/auth';
import { message } from 'antd';
import axios from 'axios';

// create an axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30 * 1000 // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    // let each request carry token
    if (getToken()) {
      config.headers['Authorization'] = 'Bearer ' + getToken();
    }
    return config;
  },
  (error) => {
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

/**
 * Generic Excel exporter using POST + JSON criteria.
 * Uses the configured axios `service` instance (with baseURL + interceptors).
 */
export async function exportExcelApi(exportUrl: string, fileName: string, body?: Record<string, any> | null) {
  const hide = message.loading('Exporting, please wait...', 0);

  try {
    // IMPORTANT: use `service`, not raw axios
    const res = await service.post<Blob>(exportUrl, body ?? null, {
      responseType: 'blob'
    });

    const data = res.data;

    // If backend returned JSON error instead of Excel, detect & show it
    if (data.type === 'application/json') {
      const text = await data.text().catch(() => '');
      try {
        const json = JSON.parse(text);
        message.error(json.msg || 'Export failed');
      } catch {
        message.error('Export failed');
      }
      return;
    }

    // Normal Excel download
    const blob = new Blob([data]); // keep server mime-type from backend
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    message.success('Export finished');
  } catch (e) {
    console.error(e);
    message.error('Export failed');
  } finally {
    hide();
  }
}
