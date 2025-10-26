import request from 'utils/request';

export function authUserApi(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: data
  });
}
