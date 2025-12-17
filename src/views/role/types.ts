// src/views/role/types.ts
export type RoleStatus = 'Enabled' | 'Disabled';

export type RoleRow = {
  id: string; // roleId
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: RoleStatus;
  createTime: string;
  remark?: string;
};
