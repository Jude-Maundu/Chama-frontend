<template>
  <div class="chama-selector">
    <div class="dropdown">
      <button class="chama-dropdown-btn" @click="toggleDropdown">
        <i class="bi bi-people-fill"></i>
        <span>{{ currentChama?.name || 'Select Chama' }}</span>
        <i class="bi bi-chevron-down"></i>
      </button>
      
      <div v-if="dropdownOpen" class="dropdown-menu-custom">
        <div class="dropdown-header">
          <span>Your Chamas</span>
          <router-link to="/chamas/create" class="create-link">
            <i class="bi bi-plus-lg"></i> New
          </router-link>
        </div>
        
        <div class="dropdown-items">
          <div v-for="chama in myChamas" :key="chama.id" 
               class="dropdown-item" 
               :class="{ active: currentChama?.id === chama.id }"
               @click="switchChama(chama)">
            <div class="chama-avatar">{{ chama.name.charAt(0) }}</div>
            <div class="chama-info">
              <div class="chama-name">{{ chama.name }}</div>
              <div class="chama-role">{{ getMemberRole(chama) }}</div>
            </div>
            <i v-if="currentChama?.id === chama.id" class="bi bi-check-circle-fill"></i>
          </div>
          
          <div v-if="myChamas.length === 0" class="empty-state">
            <p>No chamas yet. Create one!</p>
          </div>
        </div>
        
        <div class="dropdown-footer">
          <router-link to="/chamas" class="view-all-link">
            <i class="bi bi-grid"></i> View All Chamas
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()
const dropdownOpen = ref(false)
const myChamas = ref([])
const currentChama = ref(null)

const loadMyChamas = async () => {
  try {
    const response = await api.get('/chamas/my-chamas')
    myChamas.value = response.data.data || []
    currentChama.value = response.data.current || null
  } catch (error) {
    console.error('Failed to load chamas:', error)
  }
}

const switchChama = async (chama) => {
  try {
    await api.post(`/chamas/${chama.slug}/switch`)
    currentChama.value = chama
    dropdownOpen.value = false
    window.location.reload()
  } catch (error) {
    console.error('Failed to switch chama:', error)
  }
}

const getMemberRole = (chama) => {
  const role = chama.pivot?.role || 'member'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.chama-selector')) {
    dropdownOpen.value = false
  }
})

onMounted(() => {
  loadMyChamas()
})
</script>

<style scoped>
.chama-selector {
  position: relative;
}

.chama-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border: none;
  border-radius: 40px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.chama-dropdown-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.create-link {
  color: #2E7D32;
  text-decoration: none;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-items {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.active {
  background: #E8F5E9;
}

.chama-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.chama-info {
  flex: 1;
}

.chama-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.chama-role {
  font-size: 11px;
  color: #999;
}

.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.view-all-link {
  color: #2E7D32;
  text-decoration: none;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: #999;
}
</style>
