// src/apis/role.ts
import request from 'utils/request';

export type RoleStatus = 'Enabled' | 'Disabled';

export type SysRolePayload = {
  roleId?: number;
  roleName: string;
  roleKey: string;
  roleSort?: number; // force 0 from frontend
  status: RoleStatus; // ✅ strings only
  remark?: string;
  menuIds?: number[];
};

export type RoleListQuery = {
  pageNum: number;
  pageSize: number;
  roleName?: string;
  status?: RoleStatus;
};

export type ApiRoleRow = {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: RoleStatus;
  createTime?: string;
  remark?: string;
};

export function getRolesApi(payload: any) {
  const { pageNum = 1, pageSize = 10, ...filters } = payload ?? {};
  return request({
    url: '/system/role/list',
    method: 'get',
    params: {
      pageNum,
      pageSize,
      ...filters
    }
  });
}

export function addRoleApi(data: SysRolePayload) {
  const payload: SysRolePayload = {
    ...data,
    roleSort: 0, // ✅ always 0
    status: data.status // ✅ "Enabled" | "Disabled"
  };

  // Usually POST(create) should NOT include roleId
  delete payload.roleId;

  return request({
    url: '/system/role',
    method: 'post',
    data: payload
  });
}

export function updateRoleApi(data: SysRolePayload & { roleId: number }) {
  return request({
    url: '/system/role',
    method: 'put',
    data: {
      ...data,
      roleSort: 0 // ✅ always 0
    }
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
 * ✅ Your controller uses @RequestParam("roleId") and @RequestParam("userIds")
 * so we must send them as query params.
 *
 * NOTE: For Long[] userIds Spring commonly accepts comma-separated: userIds=1,2,3
 */
export function assignUsersToRoleApi(payload: { roleId: number; userIds: number[] }) {
  return request({
    url: '/system/role/authUser/batch-assign',
    method: 'put',
    params: {
      roleId: payload.roleId,
      userIds: payload.userIds.join(',')
    }
  });
}

export function removeUsersFromRoleApi(payload: { roleId: number; userIds: number[] }) {
  return request({
    url: '/system/role/authUser/batch-revoke',
    method: 'put',
    params: {
      roleId: payload.roleId,
      userIds: payload.userIds.join(',')
    }
  });
}
