<template>
  <div class="min-h-screen max-h-screen h-screen overflow-hidden flex flex-col bg-black">
    <!-- Background gradients -->
    <div class="gradient-orb gradient-orb-1"></div>
    <div class="gradient-orb gradient-orb-2"></div>

    <div
      class="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-12"
    >
      <div class="max-w-md w-full space-y-8">
        <div>
          <h1 class="mt-6 text-center text-4xl md:text-5xl font-bold text-white leading-tight">
            Join our platform
          </h1>
          <p class="mt-3 text-center text-lg text-gray-300">Create your account to get started</p>
        </div>

        <div
          class="mt-8 bg-black/30 backdrop-blur-md rounded-xl p-8 border border-gray-800 shadow-2xl"
        >
          <form class="space-y-6" style="margin: 1rem" @submit.prevent="handleRegister">
            <div v-if="error" class="rounded-md bg-red-900/50 border border-red-500 p-4 mb-4">
              <div class="text-sm text-white">{{ error }}</div>
            </div>

            <div class="space-y-4">
              <div>
                <label for="fullName" class="block text-sm font-medium text-gray-300 mb-1"
                  >Full Name</label
                >
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  v-model="registerData.fullName"
                  class="appearance-none relative block w-full px-4 py-3 border bg-gray-900 border-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-300 mb-1"
                  >Email address</label
                >
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  v-model="registerData.email"
                  class="appearance-none relative block w-full px-4 py-3 border bg-gray-900 border-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label for="username" class="block text-sm font-medium text-gray-300 mb-1"
                  >Username</label
                >
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  v-model="registerData.username"
                  class="appearance-none relative block w-full px-4 py-3 border bg-gray-900 border-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="johndoe"
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
                  v-model="registerData.password"
                  class="appearance-none relative block w-full px-4 py-3 border bg-gray-900 border-gray-700 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
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
                {{ loading ? 'Creating account...' : 'Sign up' }}
              </button>
            </div>
          </form>

          <div class="mt-6 text-center mb-2">
            <router-link
              to="/login"
              class="text-base text-blue-400 hover:text-blue-300 transition-colors"
              >Already have an account? <span class="font-medium">Sign in</span></router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authService, { RegisterData } from '../../services/authService'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const registerData = reactive<RegisterData>({
  username: '',
  password: '',
  email: '',
  fullName: '',
})

const handleRegister = async () => {
  loading.value = true
  error.value = ''

  try {
    await authService.register(registerData)
    // Redirect to login page
    router.push({
      path: '/login',
      query: { message: 'Registration successful. Please login with your new account.' },
    })
  } catch (err: any) {
    error.value = err.message || 'Failed to register. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Gradient orbs for background effect like in the home page */
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
