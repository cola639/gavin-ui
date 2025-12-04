import request from 'utils/request';

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

export function getUserInfoApi(params) {
  return request({
    url: '/system/user/info',
    method: 'get',
    params
  });
}

export function getUserDetailApi(userId?: string | number) {
  return request({
    url: '/system/user/' + (userId ? userId : ''),
    method: 'get'
  });
}
