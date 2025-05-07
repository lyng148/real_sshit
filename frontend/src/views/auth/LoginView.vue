<template>
  <div class="min-h-screen max-h-screen h-screen overflow-hidden flex flex-col bg-black">
    <!-- Background gradients -->
    <div class="gradient-orb gradient-orb-1"></div>
    <div class="gradient-orb gradient-orb-2"></div>

    <div class="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h1 class="mt-6 text-4xl md:text-5xl font-bold text-white leading-tight">Welcome back</h1>
          <p class="mt-3 text-lg text-gray-300">Sign in to your account to continue</p>
        </div>

        <div
          class="mt-8 bg-black/30 backdrop-blur-md rounded-xl p-8 border border-gray-800 shadow-2xl"
        >
          <form class="space-y-6" style="margin: 1rem" @submit.prevent="handleLogin">
            <div v-if="error" class="rounded-md bg-red-900/50 border border-red-500 p-4 mb-4">
              <div class="text-sm text-white">{{ error }}</div>
            </div>

            <div class="space-y-4">
              <div>
                <label for="username" class="block text-sm font-medium text-gray-300 mb-1"
                  >Username</label
                >
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  v-model="credentials.username"
                  class="appearance-none relative block w-full px-4 py-3 border bg-gray-900 border-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-300 mb-1"
                  >Password</label
                >
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  v-model="credentials.password"
                  class="appearance-none relative block w-full px-4 py-3 border bg-gray-900 border-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="loading"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <span v-if="loading" class="absolute left-4 inset-y-0 flex items-center">
                  <svg
                    class="animate-spin h-5 w-5 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
                {{ loading ? 'Signing in...' : 'Sign in' }}
              </button>
            </div>
          </form>

          <div class="mt-6 text-center mb-2">
            <router-link
              to="/register"
              class="text-base text-blue-400 hover:text-blue-300 transition-colors"
              style="margin-bottom: 1rem"
              >Don't have an account? <span class="font-medium">Sign up</span></router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authService, { LoginCredentials } from '../../services/authService'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')

const credentials = reactive<LoginCredentials>({
  username: '',
  password: '',
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authService.login(credentials)

    // Redirect to intended page or dashboard
    const redirectPath = (route.query.redirect as string) || '/dashboard'
    router.push(redirectPath)
  } catch (err: any) {
    error.value = err.message || 'Failed to login. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Gradient orbs for background effect */
.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 1;
}

.gradient-orb-1 {
  width: 80vw;
  height: 80vh;
  background: radial-gradient(circle at center, rgba(0, 82, 255, 0.4) 0%, rgba(0, 82, 255, 0) 70%);
  top: 10%;
  left: -30%;
}

.gradient-orb-2 {
  width: 100vw;
  background: radial-gradient(circle at center, rgba(0, 42, 255, 0.4) 0%, rgba(0, 42, 255, 0) 65%);
  bottom: -60%;
  right: -40%;
}

/* Ensure the page fills the entire viewport height */
body,
html {
  height: 100%;
  margin: 0;
}

.min-h-screen {
  height: 100vh;
}
</style>
