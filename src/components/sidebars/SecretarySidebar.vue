<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">📝</div>
        <span class="logo-text">Chama<span>Secretary</span></span>
      </div>
      <button class="close-sidebar" @click="$emit('close')">✕</button>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Communication Hub</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/app/dashboard" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-speedometer2"></i>
            <span>Overview</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Meetings & Events</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/chama-admin/meetings" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-calendar-event"></i>
            <span>Manage Meetings</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/meetings/schedule" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-calendar-plus"></i>
            <span>Schedule New</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/attendance" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-person-check"></i>
            <span>Attendance</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Documentation</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/chama-admin/minutes" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-file-earmark-text"></i>
            <span>Meeting Minutes</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/documents" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-folder"></i>
            <span>Chama Files</span>
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
