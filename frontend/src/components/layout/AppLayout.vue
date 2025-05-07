<template>
  <div
    class="min-h-screen w-full"
    :class="{
      'bg-gray-100': !isHomePage && !isAuthPage,
      'bg-black': isHomePage || isAuthPage,
      flex: isDashboardPage,
    }"
  >
    <!-- Sidebar for Dashboard pages -->
    <aside v-if="isDashboardPage" class="w-60 bg-white border-r border-gray-200 min-h-screen">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-5 h-5"
            >
              <path
                fill-rule="evenodd"
                d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <span class="text-lg font-semibold">MindTask Inc.</span>
        </div>
      </div>

      <div class="py-4">
        <div class="px-4 mb-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Search"
              class="w-full px-3 py-2 pl-9 bg-gray-100 border-none rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
            >
              <path
                fill-rule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <!-- Admin Menu Option -->
        <ul class="mt-2" v-if="isAdmin">
          <li>
            <router-link
              to="/admin/users"
              class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-5 h-5 mr-3 text-gray-500"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clip-rule="evenodd"
                />
              </svg>
              Admin
            </router-link>
          </li>
        </ul>

        <div class="mt-4 px-4">
          <div class="text-xs font-semibold text-gray-400 px-2 mb-2">PROJECTS</div>
          <ul>
            <li v-for="(project, index) in sampleProjects" :key="index">
              <router-link
                :to="`/projects/${index + 1}`"
                class="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                :class="{ 'bg-gray-100': isCurrentProjectActive(index) }"
              >
                <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                {{ project.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <!-- Navigation bar for regular pages -->
    <nav
      v-if="!isHomePage && !isAuthPage && !isDashboardPage"
      class="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm w-full transition-all duration-300"
    >
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-indigo-600">{{
                appTitle
              }}</router-link>
            </div>
            <!-- Desktop navigation links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8" v-if="isAuthenticated">
              <router-link
                to="/dashboard"
                class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Dashboard
              </router-link>
              <router-link
                to="/projects"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Projects
              </router-link>
              <router-link
                to="/groups"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Groups
              </router-link>
              <router-link
                to="/tasks"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Tasks
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/admin/users"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Users
              </router-link>
            </div>
          </div>

          <!-- User menu -->
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div v-if="isAuthenticated" class="ml-3 relative">
              <div class="flex items-center">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="user-menu-button"
                >
                  <span class="sr-only">Open user menu</span>
                  <span
                    class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700"
                  >
                    {{ userInitials }}
                  </span>
                </button>
                <span class="ml-2">{{ currentUser?.username || 'User' }}</span>
              </div>
              <!-- Dropdown menu -->
              <div
                v-if="showUserMenu"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  tabindex="-1"
                  id="user-menu-item-0"
                  @click="showUserMenu = false"
                >
                  Your Profile
                </router-link>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  tabindex="-1"
                  id="user-menu-item-2"
                  @click="handleLogout"
                >
                  Sign out
                </a>
              </div>
            </div>
            <div v-else class="flex items-center space-x-4">
              <router-link
                to="/login"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Log in
              </router-link>
              <router-link
                to="/register"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign up
              </router-link>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="-mr-2 flex items-center sm:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  v-if="mobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden">
        <div v-if="isAuthenticated" class="pt-2 pb-3 space-y-1">
          <router-link
            to="/dashboard"
            class="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
            inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </router-link>
          <router-link
            to="/projects"
            class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
            inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            @click="mobileMenuOpen = false"
          >
            Projects
          </router-link>
          <router-link
            to="/groups"
            class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
            inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            @click="mobileMenuOpen = false"
          >
            Groups
          </router-link>
          <router-link
            to="/tasks"
            class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
            inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            @click="mobileMenuOpen = false"
          >
            Tasks
          </router-link>
          <router-link
            v-if="isAdmin"
            to="/admin/users"
            class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
            inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            @click="mobileMenuOpen = false"
          >
            Users
          </router-link>
        </div>
        <div v-if="isAuthenticated" class="pt-4 pb-3 border-t border-gray-200">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <span
                class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700"
              >
                {{ userInitials }}
              </span>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">
                {{ currentUser?.fullName || 'User' }}
              </div>
              <div class="text-sm font-medium text-gray-500">{{ currentUser?.email }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <router-link
              to="/profile"
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              @click="mobileMenuOpen = false"
            >
              Your Profile
            </router-link>
            <a
              href="#"
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              @click="handleLogout"
            >
              Sign out
            </a>
          </div>
        </div>
        <div v-else class="py-3 border-t border-gray-200 flex flex-col space-y-3 px-4">
          <router-link
            to="/login"
            class="text-base font-medium text-indigo-600 hover:text-indigo-500"
            @click="mobileMenuOpen = false"
          >
            Log in
          </router-link>
          <router-link
            to="/register"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            @click="mobileMenuOpen = false"
          >
            Sign up
          </router-link>
        </div>
      </div>
    </nav>

    <nav
      v-if="isHomePage || isAuthPage"
      class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      :class="{ 'bg-black/30 backdrop-blur-md shadow-md': scrolled, 'bg-transparent': !scrolled }"
      style="backdrop-filter: blur(10px)"
    >
      <div class="max-w-1400 mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <div class="mr-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 5H20V19H4V5Z" stroke="white" stroke-width="2" />
                  <path d="M4 12H20" stroke="white" stroke-width="2" />
                </svg>
              </div>
              <span class="text-white text-lg font-semibold">Proza</span>
            </router-link>
          </div>

          <!-- Only show menu links on home page, not on auth pages -->
          <div v-if="isHomePage && !isAuthPage" class="hidden md:flex space-x-8">
            <a href="#" class="text-gray-300 hover:text-white text-sm">Features</a>
            <a href="#" class="text-gray-300 hover:text-white text-sm">Resources</a>
            <a href="#" class="text-gray-300 hover:text-white text-sm">Help</a>
            <a href="#" class="text-gray-300 hover:text-white text-sm">Teams</a>
            <a href="#" class="text-gray-300 hover:text-white text-sm">Pricing</a>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Hide login link on login page and signup link on register page -->
            <router-link
              to="/login"
              v-if="!isCurrentPage('/login')"
              class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >Log in</router-link
            >
            <router-link
              to="/register"
              v-if="!isAuthenticated && !isCurrentPage('/register')"
              class="px-4 py-1.5 bg-white text-black rounded-full text-sm hover:bg-gray-200 transition-all duration-200"
            >
              Sign up
            </router-link>
            <button
              v-if="isAuthenticated"
              @click="handleLogout"
              class="px-4 py-1.5 bg-white text-black rounded-full text-sm hover:bg-gray-200 transition-all duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content - ensure full width for non-dashboard pages -->
    <main :class="{ 'w-full': !isDashboardPage, 'flex-1 overflow-auto': isDashboardPage }">
      <slot />
    </main>

    <!-- Footer (Optional) -->
    <footer
      v-if="showFooter && !isHomePage && !isAuthPage && !isDashboardPage"
      class="bg-white w-full"
    >
      <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
        <!-- ... existing code ... -->
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import authService from '../../services/authService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)
const showUserMenu = ref(false)
const scrolled = ref(false)
const showFooter = ref(true)

// Determine page types based on routes
const isHomePage = computed(() => route.path === '/')
const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')
const isDashboardPage = computed(() => {
  const dashboardRoutes = ['/dashboard', '/projects', '/tasks', '/groups']
  return dashboardRoutes.some((path) => route.path.startsWith(path))
})

// Debug user roles
onMounted(() => {
  console.log('Current user:', currentUser.value)
  console.log('User roles:', currentUser.value?.roles)
  console.log('Is Admin?', isAdmin.value)
})

// Sample projects for the sidebar
const sampleProjects = [
  { name: 'MerahPutih - Saas Dashboard' },
  { name: 'Product Backlog' },
  { name: 'NexaAgency - Landing Page' },
  { name: 'Tomoro - POS Dashboard' },
  { name: 'GOTO Project' },
]

// Track scroll position and update navbar style
const handleScroll = () => {
  if (window.scrollY > 20) {
    scrolled.value = true
  } else {
    scrolled.value = false
  }
}

// Add scroll event listener when component is mounted
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Check scroll position immediately in case page is loaded scrolled down
  handleScroll()
})

// Remove scroll event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Use a default value instead of import.meta.env
const appTitle = 'Project Management'

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)

// User initials for avatar
const userInitials = computed(() => {
  if (!currentUser.value?.fullName) return 'U'

  const names = currentUser.value.fullName.split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
})

// Handle logout
const handleLogout = () => {
  authService.logout()
  router.push('/login')
  showUserMenu.value = false
  mobileMenuOpen.value = false
}

// Check if the current page matches a given path
const isCurrentPage = (path: string) => route.path === path

// Check if the current project is active
const isCurrentProjectActive = (index: number) => {
  return route.path === `/projects/${index + 1}`
}
</script>

<style scoped>
.max-w-1400 {
  max-width: 1400px;
}

/* Fix for sticky navbar in Safari */
@supports (-webkit-backdrop-filter: none) {
  nav.fixed {
    -webkit-backdrop-filter: blur(10px);
  }
}
</style>
