// src/apis/role.ts
import request from 'utils/request';

export type RoleStatus = 'Enabled' | 'Disabled';

export type SysRolePayload = {
  roleId?: number;
  roleName: string;
  roleKey: string;
  roleSort?: number; // always send 0
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

export function getRolesApi(payload: RoleListQuery) {
  const { pageNum = 1, pageSize = 10, ...filters } = payload ?? ({} as any);

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
    roleSort: 0,
    status: data.status
  };
  delete payload.roleId;

  return request({
    url: '/system/role',
    method: 'post',
    data: payload
  });
}

export function updateRoleApi(data: SysRolePayload & { roleId: number }) {
  const payload: SysRolePayload & { roleId: number } = {
    ...data,
    roleSort: 0, // ✅ always 0
    status: data.status // ✅ "Enabled" | "Disabled"
  };

  return request({
    url: '/system/role',
    method: 'put',
    data: payload
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

/** helper: Spring @RequestParam("userIds") Long[] userIds likes repeated params */
const buildBatchParams = (roleId: number, userIds: number[]) => {
  const sp = new URLSearchParams();
  sp.set('roleId', String(roleId));
  userIds.forEach((id) => sp.append('userIds', String(id))); // userIds=1&userIds=2
  return sp.toString();
};

/** ✅ PUT /system/role/authUser/batch-assign?roleId=...&userIds=... */
export function assignUsersToRoleApi(payload: { roleId: number; userIds: number[] }) {
  const qs = buildBatchParams(payload.roleId, payload.userIds);

  return request({
    url: `/system/role/authUser/batch-assign?${qs}`,
    method: 'put'
  });
}

/** ✅ PUT /system/role/authUser/batch-revoke?roleId=...&userIds=... */
export function removeUsersFromRoleApi(payload: { roleId: number; userIds: number[] }) {
  const qs = buildBatchParams(payload.roleId, payload.userIds);

  return request({
    url: `/system/role/authUser/batch-revoke?${qs}`,
    method: 'put'
  });
}
