import request from 'utils/request';

export function getDeptApi() {
  return request({
    url: '/system/dept/list',
    method: 'get'
  });
}
