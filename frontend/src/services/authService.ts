import axiosInstance from './axiosInstance';

export const authService = {
  async login(username: string, password: string) {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        username,
        password
      });
      
      if (response.data.data?.token) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async signup(username: string, email: string, fullName: string, password: string) {
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        username,
        email,
        fullName,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
};