import axiosInstance from './authService';

export const userService = {
  async getAllUsers(filters = {}) {
    try {
      const response = await axiosInstance.get('/users', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getUserById(id: number) {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async createUser(userData: any) {
    try {
      const response = await axiosInstance.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async updateUser(id: number, userData: any) {
    try {
      const response = await axiosInstance.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async deleteUser(id: number) {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async assignRoles(id: number, roles: string[]) {
    try {
      const response = await axiosInstance.put(`/users/${id}/roles`, { roles });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;