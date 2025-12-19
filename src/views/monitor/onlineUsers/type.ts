// src/views/monitor/onlineUsers/type.ts
export type OnlineUserRow = {
  tokenId: string;
  deptName: string;
  userName: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  loginTime: number | null;
};
