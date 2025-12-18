// src/apis/role.ts
import request from 'utils/request';

export type RoleStatusUI = 'Enabled' | 'Disabled';

export type RoleListQuery = {
  pageNum: number;
  pageSize: number;
  roleName?: string;
  status?: RoleStatusUI | null;
};

export type ApiRoleRow = {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string; // usually '0'/'1' or 'Enabled'/'Disabled'
  createTime?: string;
  remark?: string;
};

export function getRolesApi(payload: any) {
  const { pageNum = 1, pageSize = 10, ...filters } = payload ?? {};

  return request({
    url: '/system/role/list',
    method: 'get',
    // SysRole fields must be in params too
    params: {
      pageNum,
      pageSize,
      ...filters
    }
  });
}

export function addRoleApi(data: Partial<ApiRoleRow>) {
  return request({
    url: '/system/role',
    method: 'post',
    data
  });
}

export function updateRoleApi(data: Partial<ApiRoleRow> & { roleId: number }) {
  return request({
    url: '/system/role',
    method: 'put',
    data
  });
}

/** DELETE /system/role/104,101 */
export function deleteRoleApi(roleIds: Array<number | string> | number | string) {
  const ids = Array.isArray(roleIds) ? roleIds.join(',') : String(roleIds);
  return request({
    url: `/system/role/${ids}`,
    method: 'delete'
  });
}

/** GET /system/role/roleMenuTreeselect/{roleId} */
export function getRoleMenuTreeselectApi(roleId: number | string) {
  return request({
    url: `/system/role/roleMenuTreeselect/${roleId}`,
    method: 'get'
  });
}

/** GET allocated users */
export function getRoleAllocatedUsersApi(params: { roleId: number; pageNum: number; pageSize: number; userName?: string; phonenumber?: string }) {
  return request({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params
  });
}

/** GET unallocated users */
export function getRoleUnallocatedUsersApi(params: { roleId: number; pageNum: number; pageSize: number; userName?: string; phonenumber?: string }) {
  return request({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params
  });
}

/**
 * ✅ Assign/unassign endpoints differ by backend.
 * If your backend is RuoYi-like, commonly:
 * - PUT /system/role/authUser/selectAll { roleId, userIds }
 * - PUT /system/role/authUser/cancelAll { roleId, userIds }
 * Replace these two functions to match your real endpoints.
 */
export function assignUsersToRoleApi(payload: { roleId: number; userIds: number[] }) {
  return request({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    data: payload
  });
}

export function removeUsersFromRoleApi(payload: { roleId: number; userIds: number[] }) {
  return request({
    url: '/system/role/authUser/cancelAll',
    method: 'put',
    data: payload
  });
}
