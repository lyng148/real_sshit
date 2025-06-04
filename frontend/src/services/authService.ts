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

  async forgotPassword(email: string) {
    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', {
        email
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async validateResetToken(token: string) {
    try {
      const response = await axiosInstance.get(`/api/auth/reset-password/validate?token=${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    try {
      const response = await axiosInstance.post('/api/auth/reset-password', {
        token,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    try {
      const response = await axiosInstance.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
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