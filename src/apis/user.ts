import request from 'utils/request';

// @/apis/user
export function getUsersApi(payload) {
  const { pageNum, pageSize, ...filters } = payload;
  return request({
    url: '/system/user/list',
    method: 'post',
    params: { pageNum, pageSize },
    data: filters
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

export function getRolePost() {
  return request({
    url: '/system/user/',
    method: 'get'
  });
}
