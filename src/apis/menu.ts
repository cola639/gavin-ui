import request from 'utils/request';

export function getMenusApi() {
  return request({
    url: '/system/menu/list',
    method: 'get'
  });
}

/* category menu button api */
export function submitMenuApi(data) {
  return request({
    url: '/system/menu',
    method: 'post',
    data
  });
}

export function updateMenuApi(data) {
  return request({
    url: '/system/menu',
    method: 'put',
    data
  });
}

export function deleteMenuApi(menuIds: number | string | Array<number | string>) {
  const ids = Array.isArray(menuIds) ? menuIds.join(',') : menuIds;

  return request({
    url: `/system/menu/${ids}`,
    method: 'delete'
  });
}
