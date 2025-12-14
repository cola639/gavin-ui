// src/api/menu.ts
import request from '@/utils/request'; // ⬅️ change to your real request helper

/** Raw menu record as returned by backend (/system/menu/list) */
export interface RawMenu {
  menuId: number;
  menuName: string;
  parentId: number;
  orderNum: number;
  path: string;
  component: string | null;
  query: string;
  routeName: string;
  isFrame: string;
  isCache: string;
  menuType: string; // 'M' | 'C' | 'F'
  visible: string;
  status: string; // 'Normal' | 'Disabled' | ...
  perms: string;
  icon: string;
  remark?: string | null;
  children?: RawMenu[];
}

// add this near your other exports
export type UpdateOrderItem = { menuId: number; orderNum: number };

/** Common RuoYi-style response wrapper */
export interface ApiResp<T> {
  code: number;
  msg: string;
  data: T;
}

/** GET /system/menu/list */
export function fetchMenuList(params?: Record<string, any>) {
  return request.get<ApiResp<RawMenu[]>>('/system/menu/list', {
    params
  });
}

/** POST /system/menu */
export function createMenu(data: Partial<RawMenu>) {
  // fill required defaults here if your backend needs them
  return request.post<ApiResp<null>>('/system/menu', data);
}

/** PUT /system/menu */
export function updateMenu(data: Partial<RawMenu> & { menuId: number }) {
  return request.put<ApiResp<null>>('/system/menu', data);
}

// if your backend expects POST instead of PUT, switch to request.post(...)
export function updateMenuOrders(data: UpdateOrderItem[]) {
  return request.put('/system/menu/update-orders', data);
}

/** DELETE /system/menu/{menuId} */
export function deleteMenu(menuId: number | string) {
  return request.delete<ApiResp<null>>(`/system/menu/${menuId}`);
}
