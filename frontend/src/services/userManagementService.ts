import axiosInstance from './axiosInstance';

export interface UserManagementResponse {
  success: boolean;
  data?: any;
  message?: string;
}

class UserManagementService {
  async getAllUsers(): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, message: 'Failed to fetch users' };
    }
  }

  async getUserById(id: string): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return { success: false, message: 'Failed to fetch user details' };
    }
  }

  async createUser(userData: any): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.post('/api/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'Failed to create user' };
    }
  }

  async updateUser(id: string, userData: any): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return { success: false, message: 'Failed to update user' };
    }
  }

  async deleteUser(id: string): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return { success: false, message: 'Failed to delete user' };
    }
  }

  async enableDisableUser(id: string, enabled: boolean): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.put(`/api/users/${id}/status`, { enabled });
      return {
        success: true,
        data: response.data,
        message: `User ${enabled ? 'enabled' : 'disabled'} successfully.`
      };
    } catch (error) {
      console.error('Error enabling/disabling user:', error);
      return {
        success: false,
        message: 'Failed to update user status.'
      };
    }
  }
}

export default new UserManagementService();
