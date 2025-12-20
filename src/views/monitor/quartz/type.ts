export type QuartzJobStatus = '0' | '1'; // 0=Normal, 1=Paused (common ruoyi-like)
export type QuartzLogStatus = '0' | '1'; // 0=Success, 1=Fail

export type QuartzJobRow = {
  jobId: number;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  cronExpression: string;
  misfirePolicy?: number;
  concurrent?: number;
  status: QuartzJobStatus;
  createTime?: string;
};

export type QuartzLogRow = {
  jobLogId: number;
  jobName: string;
  jobGroup: string;
  invokeTarget?: string;
  jobMessage?: string;
  status: QuartzLogStatus;
  exceptionInfo?: string;
  createTime?: string | number; // sometimes ms
};
