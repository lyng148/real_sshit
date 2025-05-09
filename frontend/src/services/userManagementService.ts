import axiosInstance from './axiosInstance';

export interface UserManagementResponse {
  success: boolean;
  message: string;
  data?: any;
}

const userManagementService = {
  getAllUsers: async (): Promise<UserManagementResponse> => {
    try {
      const response = await axiosInstance.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, message: 'Failed to fetch users' };
    }
  },

  getUserById: async (id: string): Promise<UserManagementResponse> => {
    try {
      const response = await axiosInstance.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return { success: false, message: 'Failed to fetch user details' };
    }
  },

  createUser: async (userData: any): Promise<UserManagementResponse> => {
    try {
      const response = await axiosInstance.post('/api/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'Failed to create user' };
    }
  },

  updateUser: async (id: string, userData: any): Promise<UserManagementResponse> => {
    try {
      const response = await axiosInstance.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return { success: false, message: 'Failed to update user' };
    }
  },

  deleteUser: async (id: string): Promise<UserManagementResponse> => {
    try {
      const response = await axiosInstance.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return { success: false, message: 'Failed to delete user' };
    }
  }
};

export default userManagementService;
