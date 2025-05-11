import axiosInstance from './axiosInstance';

export const userService = {
  async getAllUsers(filters = {}) {
    try {
      const response = await axiosInstance.get('/api/users', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getUserById(id: number) {
    try {
      const response = await axiosInstance.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async createUser(userData: any) {
    try {
      const response = await axiosInstance.post('/api/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async updateUser(id: number, userData: any) {
    try {
      const response = await axiosInstance.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async deleteUser(id: number) {
    try {
      const response = await axiosInstance.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
    async assignRoles(id: number, roles: string[]) {
    try {
      const response = await axiosInstance.put(`/api/users/${id}/roles`, { roles });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async updateAvatar(id: number, avatarUrl: string) {
    try {
      const response = await axiosInstance.put(`/api/users/${id}`, { avatarUrl });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;