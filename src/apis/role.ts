// src/apis/role.ts
import request from 'utils/request';

export type Id = number | string;

export type PageQuery<T extends Record<string, any> = Record<string, any>> = T & {
  pageNum?: number;
  pageSize?: number;
};

export type Role = {
  roleId?: number;
  roleName?: string;
  roleKey?: string;
  roleSort?: number;
  status?: string;
  remark?: string;

  // common ruoyi fields
  menuIds?: number[];
  deptIds?: number[];
  dataScope?: string;

  [k: string]: any;
};

/**
 * GET/POST role list
 * Your backend uses: POST /system/role/list
 * - pageNum/pageSize in params
 * - filters in body
 */
export function getRolesApi(payload: PageQuery = {}) {
  const { pageNum = 1, pageSize = 10, ...filters } = payload;
  return request({
    url: '/system/role/list',
    method: 'post',
    params: { pageNum, pageSize },
    data: filters
  });
}

/** POST /system/role */
export function addRoleApi(data: Role) {
  return request({
    url: '/system/role',
    method: 'post',
    data
  });
}

/** PUT /system/role */
export function updateRoleApi(data: Role & { roleId: Id }) {
  return request({
    url: '/system/role',
    method: 'put',
    data
  });
}

/** GET /system/role/{roleId} (role detail) */
export function getRoleDetailApi(roleId: Id) {
  return request({
    url: `/system/role/${roleId}`,
    method: 'get'
  });
}

/**
 * DELETE /system/role/{roleIds}
 * Example: /system/role/104,101
 */
export function deleteRoleApi(roleIds: Id | Id[]) {
  const ids = Array.isArray(roleIds) ? roleIds.join(',') : roleIds;
  return request({
    url: `/system/role/${ids}`,
    method: 'delete'
  });
}

/**
 * GET /system/role/roleMenuTreeselect/{roleId}
 * Returns menu tree + checkedKeys(menuIds) in Ruoyi style.
 */
export function getRoleMenuTreeselectApi(roleId: Id) {
  return request({
    url: `/system/role/roleMenuTreeselect/${roleId}`,
    method: 'get'
  });
}

/**
 * GET /system/role/authUser/allocatedList
 * Example:
 * /system/role/authUser/allocatedList?roleId=100&pageNum=1&pageSize=20
 */
export function getAllocatedUserListApi(payload: PageQuery<{ roleId: Id }>) {
  const { roleId, pageNum = 1, pageSize = 20, ...filters } = payload;
  return request({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params: { roleId, pageNum, pageSize, ...filters }
  });
}

/**
 * GET /system/role/authUser/unallocatedList
 * Example:
 * /system/role/authUser/unallocatedList?roleId=100&pageNum=1&pageSize=20
 */
export function getUnallocatedUserListApi(payload: PageQuery<{ roleId: Id }>) {
  const { roleId, pageNum = 1, pageSize = 20, ...filters } = payload;
  return request({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params: { roleId, pageNum, pageSize, ...filters }
  });
}

/**
 * Optional alias if your UI uses "get_role_menuIds" naming:
 * (It’s the same endpoint; menuIds are typically in `checkedKeys`.)
 */
export function getRoleMenuIdsApi(roleId: Id) {
  return getRoleMenuTreeselectApi(roleId);
}
