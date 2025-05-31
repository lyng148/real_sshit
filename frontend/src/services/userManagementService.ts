import axiosInstance from './axiosInstance';

export interface UserManagementResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// Backend API Response format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  metadata?: any;
}

class UserManagementService {
  async getAllUsers(): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.get('/api/users');
      const apiResponse: ApiResponse<any[]> = response.data;
      return {
        success: apiResponse.success,
        data: apiResponse.data,
        message: apiResponse.message
      };
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to fetch users' 
      };
    }
  }

  async getAllUsersPaginated(page: number = 0, size: number = 10, sortBy: string = 'fullName', sortDirection: string = 'ASC'): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.get('/api/users/paginated', {
        params: {
          page,
          size,
          sortBy,
          sortDirection
        }
      });
      const apiResponse: ApiResponse<any> = response.data;
      return {
        success: apiResponse.success,
        data: apiResponse.data,
        message: apiResponse.message
      };
    } catch (error: any) {
      console.error('Error fetching paginated users:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to fetch paginated users' 
      };
    }
  }

  async getUserById(id: string): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.get(`/api/users/${id}`);
      const apiResponse: ApiResponse<any> = response.data;
      return {
        success: apiResponse.success,
        data: apiResponse.data,
        message: apiResponse.message
      };
    } catch (error: any) {
      console.error(`Error fetching user ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to fetch user details' 
      };
    }
  }

  async createUser(userData: any): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.post('/api/users', userData);
      const apiResponse: ApiResponse<any> = response.data;
      return {
        success: apiResponse.success,
        data: apiResponse.data,
        message: apiResponse.message
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to create user' 
      };
    }
  }

  async updateUser(id: string, userData: any): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.put(`/api/users/${id}`, userData);
      const apiResponse: ApiResponse<any> = response.data;
      return {
        success: apiResponse.success,
        data: apiResponse.data,
        message: apiResponse.message
      };
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to update user' 
      };
    }
  }

  async deleteUser(id: string): Promise<UserManagementResponse> {
    try {
      const response = await axiosInstance.delete(`/api/users/${id}`);
      const apiResponse: ApiResponse<any> = response.data;
      return {
        success: apiResponse.success,
        data: apiResponse.data,
        message: apiResponse.message
      };
    } catch (error: any) {
      console.error(`Error deleting user ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to delete user' 
      };
    }
  }

  async enableDisableUser(id: string, enabled: boolean): Promise<UserManagementResponse> {
    try {
      // Note: Backend doesn't have this endpoint, so we'll use the update endpoint
      const response = await axiosInstance.put(`/api/users/${id}`, { enabled });
      const apiResponse: ApiResponse<any> = response.data;
      return {
        success: apiResponse.success,
        data: apiResponse.data,
        message: `User ${enabled ? 'enabled' : 'disabled'} successfully.`
      };
    } catch (error: any) {
      console.error('Error enabling/disabling user:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update user status.'
      };
    }
  }
}

export default new UserManagementService();
