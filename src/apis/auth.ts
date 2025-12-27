// src/apis/auth.ts
import request from 'utils/request';

export function authUserApi(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: data
  });
}

export function getRoutesApi() {
  return request({
    url: '/auth/getRouters',
    method: 'get'
  });
}

export function getInfoApi() {
  return request({
    url: '/auth/getInfo',
    method: 'get'
  });
}
