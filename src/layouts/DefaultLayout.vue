<template>
  <div class="default-layout">
    <!-- Top Navbar -->
    <TopNavbar />
    
    <!-- Sidebar & Main Content Wrapper -->
    <div class="layout-wrapper">
      <!-- Dynamic Sidebar -->
      <component 
        :is="sidebarComponent" 
        :is-open="sidebarOpen"
        @close="closeSidebar"
      />
      
      <!-- Overlay -->
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
      
      <!-- Main Content -->
      <main class="main-content">      
        <div class="content">
          <router-view />
        </div>
      </main>
    </div>
    
    <!-- Bottom Navigation (Mobile) -->
    <nav class="bottom-nav">
      <router-link to="/app/dashboard" class="bottom-nav-item">
        <i class="bi bi-speedometer2"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/app/contributions" class="bottom-nav-item">
        <i class="bi bi-cash-stack"></i>
        <span>Pay</span>
      </router-link>
      <router-link to="/app/loans" class="bottom-nav-item">
        <i class="bi bi-bank"></i>
        <span>Loans</span>
      </router-link>
      <router-link to="/app/meetings" class="bottom-nav-item">
        <i class="bi bi-calendar"></i>
        <span>Meet</span>
      </router-link>
      <a href="#" @click.prevent="logout" class="bottom-nav-item logout-bottom-item">
        <i class="bi bi-box-arrow-right"></i>
        <span>Logout</span>
      </a>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import TopNavbar from '@/components/TopNavbar.vue'

// Import sidebars
const SuperAdminSidebar = defineAsyncComponent(() => import('@/components/sidebars/SuperAdminSidebar.vue'))
const ChamaAdminSidebar = defineAsyncComponent(() => import('@/components/sidebars/ChamaAdminSidebar.vue'))
const TreasurerSidebar = defineAsyncComponent(() => import('@/components/sidebars/TreasurerSidebar.vue'))
const SecretarySidebar = defineAsyncComponent(() => import('@/components/sidebars/SecretarySidebar.vue'))
const MemberSidebar = defineAsyncComponent(() => import('@/components/sidebars/MemberSidebar.vue'))

const router = useRouter()
const sidebarOpen = ref(false)
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const sidebarComponent = computed(() => {
  const roles = user.value.roles || []
  const chamaRole = user.value.current_chama_role
  
  if (roles.includes('super-admin')) return SuperAdminSidebar
  if (roles.includes('chama-admin') || chamaRole === 'admin') return ChamaAdminSidebar
  if (roles.includes('treasurer') || chamaRole === 'treasurer') return TreasurerSidebar
  if (roles.includes('secretary') || chamaRole === 'secretary') return SecretarySidebar
  
  return MemberSidebar
})

const closeSidebar = () => {
  sidebarOpen.value = false
}

const logout = async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const handleToggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

onMounted(() => {
  window.addEventListener('toggle-sidebar', handleToggleSidebar)
})

onUnmounted(() => {
  window.removeEventListener('toggle-sidebar', handleToggleSidebar)
})
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* Layout Wrapper: Sidebar + Content */
.layout-wrapper {
  display: flex;
  flex: 1;
  margin-top: 70px; /* Account for TopNavbar height */
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.content {
  padding: 24px;
  flex: 1;
}

/* Sidebar Overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
}

/* Bottom Navigation (Mobile) */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
  padding: 8px 16px;
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 12px;
  transition: color 0.2s;
  flex: 1;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
}

.bottom-nav-item i {
  font-size: 24px;
}

.bottom-nav-item.router-link-active {
  color: var(--primary-color);
}

.logout-bottom-item {
  color: var(--danger-color);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .sidebar-overlay {
    display: block;
  }

  .bottom-nav {
    display: flex;
    justify-content: space-around;
  }

  .content {
    padding: 16px;
    padding-bottom: 80px;
  }
}
</style>
