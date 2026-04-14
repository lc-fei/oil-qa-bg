export interface UserInfo {
  id: number;
  username: string;
  account: string;
  roles: string[];
}

export interface LoginPayload {
  account: string;
  password: string;
}

export interface LoginResult {
  token: string;
  tokenType: string;
  expiresIn: number;
  userInfo: UserInfo;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
