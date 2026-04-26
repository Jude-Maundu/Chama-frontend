<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">👑</div>
        <span class="logo-text">System<span>Admin</span></span>
      </div>
      <button class="close-sidebar" @click="$emit('close')">✕</button>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Global Management</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/admin/dashboard" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-speedometer2"></i>
            <span>Platform Overview</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/users" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-people"></i>
            <span>Admin Management</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/chamas" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-diagram-3"></i>
            <span>Chama Management</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">System Configuration</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/admin/settings" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-gear"></i>
            <span>System Settings</span>
          </router-link>
        </li>
        <li>
          <router-link to="/admin/logs" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-journal-text"></i>
            <span>Audit Logs</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section mt-auto">
      <ul class="sidebar-menu">
        <li>
          <router-link to="/profile" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-person-circle"></i>
            <span>My Profile</span>
          </router-link>
        </li>
        <li>
          <a href="#" @click.prevent="logout" class="sidebar-link text-danger">
            <i class="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])
const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
@import './sidebar-styles.css';
</style>
