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

// apis/user.ts
export function deleteUserApi(userIds: number | string | Array<number | string>) {
  const ids = Array.isArray(userIds) ? userIds.join(',') : userIds;

  return request({
    url: `/system/user/${ids}`,
    method: 'delete'
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

export function getUserDetailApi(userId: number) {
  return request({
    url: '/system/user/info',
    method: 'get',
    params: { userId }
  });
}
