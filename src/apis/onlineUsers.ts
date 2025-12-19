// src/apis/onlineUsers.ts
import request from 'utils/request';

export type OnlineUserApiRow = {
  tokenId: string;
  deptName?: string;
  userName?: string;
  ipaddr?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  loginTime?: number; // ms timestamp
};

export type OnlineUsersQuery = {
  pageNum: number;
  pageSize: number;
  ipaddr?: string;
  userName?: string;
};

export function getOnlineUsersApi(params: OnlineUsersQuery) {
  return request({
    url: '/monitor/online/list',
    method: 'get',
    params
  });
}

/** DELETE /monitor/online/{tokenId} */
export function forceLogoutApi(tokenId: string) {
  return request({
    url: `/monitor/online/${tokenId}`,
    method: 'delete'
  });
}
