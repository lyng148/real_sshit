
export interface User {
  id: number | string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  enabled?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSummary {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: User | User[];
}
