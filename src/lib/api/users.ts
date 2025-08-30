import { api } from './client';
import { LoginRequest, LoginResponse, RefreshTokenRequest, ChangePasswordRequest, User } from '@/types/auth';

// Legacy User Types (keeping for backward compatibility)
export interface UserRole {
  roleId: number;
  roleName: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
}

export interface Permission {
  permissionId: number;
  permissionName: string;
  description?: string;
  resource: string;
  action: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  roleIds?: number[];
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: number[];
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  keyword?: string;
  isActive?: boolean;
  roleId?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}

export interface GetUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Management API
export const userAPI = {
  // Authentication
  async login(data: LoginRequest): Promise<LoginResponse> {
    return api.post('/api/v1/user-service/auth/login', data);
  },

  async logout(): Promise<void> {
    return api.post('/api/v1/user-service/auth/logout');
  },

  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    return api.post('/api/v1/user-service/auth/refresh', data);
  },

  async getProfile(): Promise<User> {
    return api.get('/api/v1/user-service/auth/profile');
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return api.post('/api/v1/user-service/auth/change-password', data);
  },

  // User CRUD
  async getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
    return api.get('/api/v1/user-service/users', params);
  },

  async getUserById(userId: number): Promise<User> {
    return api.get(`/api/v1/user-service/users/${userId}`);
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    return api.post('/api/v1/user-service/users', data);
  },

  async updateUser(userId: number, data: UpdateUserRequest): Promise<User> {
    return api.patch(`/api/v1/user-service/users/${userId}`, data);
  },

  async deleteUser(userId: number): Promise<void> {
    return api.delete(`/api/v1/user-service/users/${userId}`);
  },

  async activateUser(userId: number): Promise<User> {
    return api.patch(`/api/v1/user-service/users/${userId}/activate`);
  },

  async deactivateUser(userId: number): Promise<User> {
    return api.patch(`/api/v1/user-service/users/${userId}/deactivate`);
  },

  // Role Management
  async getRoles(): Promise<UserRole[]> {
    return api.get('/api/v1/user-service/roles');
  },

  async getRoleById(roleId: number): Promise<UserRole> {
    return api.get(`/api/v1/user-service/roles/${roleId}`);
  },

  async createRole(data: { roleName: string; description?: string; permissionIds?: number[] }): Promise<UserRole> {
    return api.post('/api/v1/user-service/roles', data);
  },

  async updateRole(roleId: number, data: { roleName?: string; description?: string; permissionIds?: number[] }): Promise<UserRole> {
    return api.patch(`/api/v1/user-service/roles/${roleId}`, data);
  },

  async deleteRole(roleId: number): Promise<void> {
    return api.delete(`/api/v1/user-service/roles/${roleId}`);
  },

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    return api.post(`/api/v1/user-service/users/${userId}/roles/${roleId}`);
  },

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    return api.delete(`/api/v1/user-service/users/${userId}/roles/${roleId}`);
  },

  // Permission Management
  async getPermissions(): Promise<Permission[]> {
    return api.get('/api/v1/user-service/permissions');
  },

  async getPermissionById(permissionId: number): Promise<Permission> {
    return api.get(`/api/v1/user-service/permissions/${permissionId}`);
  },

  async createPermission(data: { permissionName: string; description?: string; resource: string; action: string }): Promise<Permission> {
    return api.post('/api/v1/user-service/permissions', data);
  },

  async updatePermission(permissionId: number, data: { permissionName?: string; description?: string; resource?: string; action?: string }): Promise<Permission> {
    return api.patch(`/api/v1/user-service/permissions/${permissionId}`, data);
  },

  async deletePermission(permissionId: number): Promise<void> {
    return api.delete(`/api/v1/user-service/permissions/${permissionId}`);
  },

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    return api.post(`/api/v1/user-service/roles/${roleId}/permissions/${permissionId}`);
  },

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    return api.delete(`/api/v1/user-service/roles/${roleId}/permissions/${permissionId}`);
  },

  async assignPermissionToUser(userId: number, permissionId: number): Promise<void> {
    return api.post(`/api/v1/user-service/users/${userId}/permissions/${permissionId}`);
  },

  async removePermissionFromUser(userId: number, permissionId: number): Promise<void> {
    return api.delete(`/api/v1/user-service/users/${userId}/permissions/${permissionId}`);
  },
};

// Export types for use in components
// export type {
//   User,
//   UserRole,
//   Permission,
//   CreateUserRequest,
//   UpdateUserRequest,
//   ChangePasswordRequest,
//   GetUsersParams,
//   GetUsersResponse,
//   LoginRequest,
//   LoginResponse,
//   RefreshTokenRequest,
// };
