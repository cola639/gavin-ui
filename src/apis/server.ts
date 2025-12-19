// src/apis/server.ts
import request from 'utils/request';

export type ApiResult<T> = {
  msg: string;
  code: number;
  data: T;
};

export type ServerCpu = {
  cpuNum: number;
  totalUsage: number; // e.g. 99800.0
  systemUsage: number; // %
  userUsage: number; // %
  waitRate: number; // %
  freeRate: number; // %
};

export type ServerMem = {
  usagePercent: number; // %
  totalGB: number;
  usedGB: number;
  freeGB: number;
};

export type ServerJvm = {
  version: string;
  home: string;
  usagePercent: number; // %
  inputArgs: string | string[];
  startTime: string; // "YYYY-MM-DD HH:mm:ss"
  totalMemoryMB: number;
  maxMemoryMB: number;
  freeMemoryMB: number;
  usedMemoryMB: number;
  runTime: string; // "0 days 1 hours 5 minutes"
  jvmName: string;
};

export type ServerSys = {
  computerName: string;
  computerIp: string;
  userDir: string;
  osName: string;
  osArch: string;
};

export type ServerDisk = {
  dirName: string;
  sysTypeName: string;
  typeName: string;
  total: string; // e.g. "460.4 GB"
  free: string; // e.g. "86.6 GB"
  used: string; // e.g. "373.8 GB"
  usagePercent: number; // %
};

export type ServerMonitorData = {
  cpu: ServerCpu;
  mem: ServerMem;
  jvm: ServerJvm;
  sys: ServerSys;
  disks: ServerDisk[];
};

export function getServerMonitorApi() {
  return request<ApiResult<ServerMonitorData>>({
    url: '/monitor/server',
    method: 'get'
  });
}
