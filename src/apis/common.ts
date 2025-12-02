import request from 'utils/request';

export function uploadAvatar(data: FormData) {
  return request({
    url: '/common/upload-avatar',
    method: 'post',
    data
  });
}
