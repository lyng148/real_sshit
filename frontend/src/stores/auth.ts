import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email: string
  fullName: string
  roles: string[]
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    hasRole: (state) => (role: string) => {
      return state.user?.roles.includes(role) ?? false
    },
    isAdmin: (state) => {
      return state.user?.roles.includes('ADMIN') ?? false
    },
    isInstructor: (state) => {
      return state.user?.roles.includes('INSTRUCTOR') ?? false
    },
    isStudent: (state) => {
      return state.user?.roles.includes('STUDENT') ?? false
    },
  },

  actions: {
    setAuthenticated(status: boolean) {
      this.isAuthenticated = status
    },

    setUser(user: User | null) {
      this.user = user
    },

    logout() {
      this.isAuthenticated = false
      this.user = null
      localStorage.removeItem('token')
    },

    initializeAuthState() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          this.user = user
          this.isAuthenticated = true
        } catch (error) {
          this.logout()
        }
      }
    },
  },
})
