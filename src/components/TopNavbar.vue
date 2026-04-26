<template>
  <nav class="top-navbar">
    <!-- Left Section: Menu Toggle & Logo -->
    <div class="navbar-left">
      <button class="menu-toggle" @click="toggleSidebar" title="Toggle Menu">
        <i class="bi bi-list"></i>
      </button>
      <div class="navbar-brand">
        <div class="logo-mini">💰</div>
        <span class="brand-text">ChamaSystem</span>
      </div>
    </div>

    <!-- Right Section: Actions & User -->
    <div class="navbar-right">
      <!-- Theme Toggle -->
      <button class="icon-btn theme-toggle" @click="toggleTheme" title="Toggle Theme">
        <i class="bi bi-moon"></i>
      </button>

      <!-- User Menu -->
      <div class="navbar-item user-menu">
        <button class="user-btn" @click="toggleUserMenu" :title="user?.name">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-info">
            <div class="user-name">{{ user?.name }}</div>
            <div class="user-role">
              <span v-if="isSuperAdmin" class="role-badge super-admin">Super Admin</span>
              <span v-else-if="isChamaAdmin" class="role-badge chama-admin">Chama Admin</span>
              <span v-else-if="isTreasurer" class="role-badge treasurer">Treasurer</span>
              <span v-else class="role-badge member">Member</span>
            </div>
          </div>
          <i class="bi bi-chevron-down"></i>
        </button>

        <!-- User Dropdown Menu -->
        <div v-if="showUserMenu" class="dropdown-menu user-dropdown">
          <router-link to="/app/profile" class="dropdown-item" @click="closeMenus">
            <i class="bi bi-person"></i> My Profile
          </router-link>
          <router-link to="/app/settings" class="dropdown-item" @click="closeMenus">
            <i class="bi bi-gear"></i> Settings
          </router-link>
          <div v-if="isSuperAdmin" class="dropdown-divider"></div>
          <router-link v-if="isSuperAdmin" to="/admin/dashboard" class="dropdown-item" @click="closeMenus">
            <i class="bi bi-shield"></i> System Admin
          </router-link>
          <div class="dropdown-divider"></div>
          <button @click="logout" class="dropdown-item text-danger">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showUserMenu = ref(false)
const user = ref(null)
const isSuperAdmin = ref(false)
const isChamaAdmin = ref(false)
const isTreasurer = ref(false)

const userInitial = computed(() => {
  return user.value?.name?.charAt(0).toUpperCase() || 'U'
})

const toggleSidebar = () => {
  const event = new Event('toggle-sidebar', { bubbles: true })
  window.dispatchEvent(event)
}

const toggleTheme = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark')
  localStorage.setItem('theme', isDark ? 'light' : 'dark')
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeMenus = () => {
  showUserMenu.value = false
}

const logout = async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const handleClickOutside = (e) => {
  const userMenuElement = document.querySelector('.user-menu')
  if (userMenuElement && !userMenuElement.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  // Load user profile
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
      isSuperAdmin.value = user.value?.roles?.includes('super-admin') || user.value?.is_super_admin === true
      isChamaAdmin.value = user.value?.roles?.includes('chama-admin') || user.value?.current_chama_role === 'admin'
      isTreasurer.value = user.value?.roles?.includes('treasurer') || user.value?.current_chama_role === 'treasurer'
    } catch (e) {
      console.error('Failed to parse user:', e)
    }
  }

  // Load theme preference
  const savedTheme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', savedTheme)

  // Close menu when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  height: 70px;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 1rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-primary);
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.menu-toggle:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
}

.logo-mini {
  font-size: 1.5rem;
}

.brand-text {
  font-size: 1.1rem;
  letter-spacing: -0.5px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--text-primary);
  padding: 0.5rem;
  border-radius: 8px;
  position: relative;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
}

.navbar-item {
  position: relative;
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-btn:hover {
  border-color: var(--primary-color);
  background-color: rgba(46, 125, 50, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.role-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.75rem;
}

.role-badge.super-admin {
  background-color: rgba(211, 47, 47, 0.1);
  color: #D32F2F;
}

.role-badge.chama-admin {
  background-color: rgba(46, 125, 50, 0.1);
  color: var(--primary-color);
}

.role-badge.treasurer {
  background-color: rgba(21, 101, 192, 0.1);
  color: var(--info-color);
}

.role-badge.member {
  background-color: rgba(158, 158, 158, 0.1);
  color: var(--text-secondary);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  min-width: 220px;
  margin-top: 0.5rem;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background-color: var(--bg-tertiary);
  color: var(--primary-color);
}

.dropdown-item.text-danger {
  color: var(--danger-color);
}

.dropdown-item.text-danger:hover {
  background-color: rgba(229, 57, 53, 0.1);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .top-navbar {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }

  .user-info {
    display: none;
  }

  .user-btn {
    padding: 0.5rem;
    border: none;
  }

  .brand-text {
    display: none;
  }
}
</style>