export type UserStatus = 'Enabled' | 'Disabled';

export interface UserRow {
  id: string;
  username: string;
  avatar: string; // URL
  email: string;
  department: string;
  phone: string;
  status: UserStatus;
  createTime: string; // ISO
  visible: boolean; // for “action is visible”
}
