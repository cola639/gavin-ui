import request from 'utils/request';

export function getUsersApi(params) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params
  });
}

export function addUserApi(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  });
}

export function deleteUserApi(params) {
  return request({
    url: '/system/user',
    method: 'delete',
    params
  });
}

export function updateUserApi(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  });
}

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
