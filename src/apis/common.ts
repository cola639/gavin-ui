import request from 'utils/request';

export function uploadAvatarApi(data: FormData) {
  return request({
    url: '/common/upload-avatar',
    method: 'post',
    data
  });
}
