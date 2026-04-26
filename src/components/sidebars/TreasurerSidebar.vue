<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">💰</div>
        <span class="logo-text">Chama<span>Treasurer</span></span>
      </div>
      <button class="close-sidebar" @click="$emit('close')">✕</button>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Financial Dashboard</div>
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
      <div class="sidebar-title">Contributions</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/chama-admin/finances" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-cash-stack"></i>
            <span>View All</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/finances/record" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-plus-circle"></i>
            <span>Record Payment</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Loans & Dividends</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/chama-admin/loans" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-bank"></i>
            <span>Manage Loans</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/dividends" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-gift"></i>
            <span>Dividends</span>
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
