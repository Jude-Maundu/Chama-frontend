<template>
  <div class="admin-layout">
    <TopNavbar />
    
    <div class="admin-wrapper">
      <!-- Dynamic Sidebar based on role -->
      <component 
        :is="sidebarComponent" 
        :is-open="sidebarOpen"
        @close="closeSidebar"
      />

      <div v-if="sidebarOpen" class="admin-overlay" @click="closeSidebar"></div>

      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import TopNavbar from '@/components/TopNavbar.vue'

// Import sidebars
const SuperAdminSidebar = defineAsyncComponent(() => import('@/components/sidebars/SuperAdminSidebar.vue'))
const ChamaAdminSidebar = defineAsyncComponent(() => import('@/components/sidebars/ChamaAdminSidebar.vue'))
const TreasurerSidebar = defineAsyncComponent(() => import('@/components/sidebars/TreasurerSidebar.vue'))
const SecretarySidebar = defineAsyncComponent(() => import('@/components/sidebars/SecretarySidebar.vue'))
const MemberSidebar = defineAsyncComponent(() => import('@/components/sidebars/MemberSidebar.vue'))

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
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.admin-wrapper {
  display: flex;
  flex: 1;
  margin-top: 70px;
}

.admin-content {
  flex: 1;
  margin-left: 280px;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  padding: 24px;
  transition: all 0.3s ease;
}

.admin-overlay {
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .admin-content {
    margin-left: 0;
    padding: 16px;
  }

  .admin-overlay {
    display: block;
  }
}
</style>
