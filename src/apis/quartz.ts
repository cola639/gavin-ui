// src/apis/quartz.ts
import request from 'utils/request';

/** ----------------------------- Common types ----------------------------- */
export type TableData<T> = {
  code?: number;
  msg?: string;
  total?: number;
  rows?: T[];
  data?: any;
};

/** ----------------------------- Quartz Jobs ------------------------------ */
/** RuoYi-like quartz status: 0 = normal, 1 = paused (commonly) */
export type QuartzJobStatus = '0' | '1' | string;

export type QuartzJobRow = {
  jobId: number;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  cronExpression: string;
  misfirePolicy: number; // e.g. 1
  concurrent: number; // e.g. 1
  status: QuartzJobStatus; // e.g. "0"
  createTime?: string;
  remark?: string;
};

export type QuartzJobPayload = {
  jobId?: number;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  cronExpression: string;
  misfirePolicy: number;
  concurrent: number;
  status: QuartzJobStatus;
};

/** GET /monitor/job/list */
export function getQuartzJobsApi(params: {
  pageNum?: number;
  pageSize?: number;
  unpaged?: boolean;
  jobName?: string;
  jobGroup?: string;
  status?: QuartzJobStatus;
  beginTime?: string;
  endTime?: string;
}) {
  return request<TableData<QuartzJobRow>>({
    url: '/monitor/job/list',
    method: 'get',
    params
  });
}

/** GET /monitor/job/{jobId} */
export function getQuartzJobApi(jobId: number | string) {
  return request({
    url: `/monitor/job/${jobId}`,
    method: 'get'
  });
}

/** POST /monitor/job */
export function addQuartzJobApi(data: QuartzJobPayload) {
  const payload = { ...data };
  delete (payload as any).jobId; // create should not send jobId
  return request({
    url: '/monitor/job',
    method: 'post',
    data: payload
  });
}

/** PUT /monitor/job */
export function updateQuartzJobApi(data: QuartzJobPayload & { jobId: number }) {
  return request({
    url: '/monitor/job',
    method: 'put',
    data
  });
}

/** DELETE /monitor/job/{jobId} */
export function deleteQuartzJobApi(jobId: number | string) {
  return request({
    url: `/monitor/job/${jobId}`,
    method: 'delete'
  });
}

/** PUT /monitor/job/run  (trigger once) */
export function runQuartzJobApi(payload: { jobId: number; jobGroup: string }) {
  return request({
    url: '/monitor/job/run',
    method: 'put',
    data: payload
  });
}

/** ---------------------------- Quartz Job Logs --------------------------- */
export type QuartzLogStatus = '0' | '1' | string;

export type QuartzJobLogRow = {
  jobLogId: number;
  jobName?: string;
  jobGroup?: string;
  invokeTarget?: string;
  jobMessage?: string;
  status?: QuartzLogStatus;
  exceptionInfo?: string;
  createTime?: string;
};

export type QuartzJobLogQuery = {
  pageNum?: number;
  pageSize?: number;
  unpaged?: boolean;

  beginTime?: string;
  endTime?: string;

  jobName?: string;
  jobGroup?: string;
  status?: QuartzLogStatus;

  /** your screenshot shows jobLogId=8 */
  jobLogId?: number | string;
};

/** GET /monitor/jobLog/list */
export function getQuartzJobLogsApi(params: QuartzJobLogQuery) {
  return request<TableData<QuartzJobLogRow>>({
    url: '/monitor/jobLog/list',
    method: 'get',
    params
  });
}

/** DELETE /monitor/jobLog/clean */
export function cleanAllQuartzJobLogsApi() {
  return request({
    url: '/monitor/jobLog/clean',
    method: 'delete'
  });
}

/** DELETE /monitor/jobLog/12,13  (batch delete by ids) */
export function deleteQuartzJobLogsApi(ids: number | string | Array<number | string>) {
  const joined = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: `/monitor/jobLog/${joined}`,
    method: 'delete'
  });
}
