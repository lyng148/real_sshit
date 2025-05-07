import api from './api'
import { useAuthStore } from '@/stores/auth'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  email: string
  fullName: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    username: string
    email: string
    fullName: string
    roles: string[]
  }
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      credentials,
    )

    if (response.data.success) {
      const { token, user } = response.data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user)) // Lưu thông tin user vào localStorage

      console.log('Login successful, user data:', user)
      console.log('User roles:', user.roles)

      const authStore = useAuthStore()
      authStore.setUser(user)
      authStore.setAuthenticated(true)

      return response.data.data
    } else {
      throw new Error('Login failed')
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      data,
    )

    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error('Registration failed')
    }
  },

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    const authStore = useAuthStore()
    authStore.setUser(null)
    authStore.setAuthenticated(false)
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },
}

export default authService
