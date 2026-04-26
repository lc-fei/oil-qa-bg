// 用户管理类型集中描述列表、详情、提交和角色选项，避免页面重复声明接口形状。
export interface PageQuery {
  pageNum: number;
  pageSize: number;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface UserListItem {
  id: number;
  username: string;
  account: string;
  phone: string | null;
  email: string | null;
  status: number;
  roles: string[];
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserListQuery extends PageQuery {
  username?: string;
  account?: string;
  roleCode?: string;
  status?: number;
}

export interface UserDetail {
  id: number;
  username: string;
  account: string;
  phone: string | null;
  email: string | null;
  status: number;
  roleIds: number[];
  roleCodes: string[];
  createdAt: string;
}

export interface UserPayload {
  username: string;
  account?: string;
  password?: string;
  phone?: string;
  email?: string;
  roleIds: number[];
  status: number;
}

export interface UserStatusPayload {
  status: number;
}

export interface RoleOption {
  id: number;
  roleName: string;
  roleCode: string;
  description: string;
  status: number;
  isSystem: number;
}
