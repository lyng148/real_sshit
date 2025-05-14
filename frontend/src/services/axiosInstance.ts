import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors with appropriate messages
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          error.message = "You don't have permission to perform this action";
          break;
        default:
          // Use server error message if available
          if (error.response.data && error.response.data.message) {
            error.message = error.response.data.message;
          }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;