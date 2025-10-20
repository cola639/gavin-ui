import request from 'utils/request';

export function loginApi(data) {
  return request({
    url: '/login',
    method: 'post',
    data: data
  });
}

export function logoutApi() {
  return request({
    url: '/logout',
    method: 'post'
  });
}

export function getUserInfoApi() {
  return request({
    url: '/getInfo',
    method: 'get'
  });
}
