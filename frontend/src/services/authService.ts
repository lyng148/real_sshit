import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu token hết hạn (401), logout user
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username: string, password: string) {
    try {
      const response = await axiosInstance.post('/auth/login', {
        username,
        password
      });
      
      if (response.data.data?.token) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async signup(username: string, email: string, fullName: string, password: string) {
    try {
      const response = await axiosInstance.post('/auth/register', {
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
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
};

// Export axiosInstance để các service khác sử dụng
export default axiosInstance;