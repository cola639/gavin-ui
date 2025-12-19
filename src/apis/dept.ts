// src/apis/dept.ts
import request from 'utils/request';

export type DeptStatus = 'Enabled' | 'Disabled';

export type DeptTreeApiNode = {
  id: number;
  label: string;
  disabled?: boolean;
  children?: DeptTreeApiNode[];
};

export type DeptDetail = {
  deptId: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  orderNum?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: string; // backend might be "0"/"1" or "Enabled"/"Disabled"
  delFlag?: string;
  createTime?: string;
  remark?: string;
};

export type DeptPayload = {
  deptId?: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: DeptStatus;
  delFlag: 'Normal';
  parentName?: string;
  remark?: string;
  children?: any[];
};

export const normalizeDeptStatus = (s?: string): DeptStatus => {
  if (!s) return 'Enabled';
  if (s === '0') return 'Enabled';
  if (s === '1') return 'Disabled';
  if (s === 'Enabled' || s === 'Disabled') return s;
  return 'Enabled';
};

export function getDeptTreeApi(params?: { deptName?: string; status?: DeptStatus }) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: {
      deptName: params?.deptName || undefined,
      status: params?.status || undefined
    }
  });
}

export function getDeptApi(deptId: number | string) {
  return request({
    url: `/system/dept/${deptId}`,
    method: 'get'
  });
}

export function addDeptApi(data: DeptPayload) {
  return request({
    url: '/system/dept',
    method: 'post',
    data
  });
}

export function updateDeptApi(data: DeptPayload & { deptId: number }) {
  return request({
    url: '/system/dept',
    method: 'put',
    data
  });
}

export function deleteDeptApi(deptId: number | string) {
  return request({
    url: `/system/dept/${deptId}`,
    method: 'delete'
  });
}
