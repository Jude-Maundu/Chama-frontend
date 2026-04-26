<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">🏢</div>
        <span class="logo-text">Chama<span>Admin</span></span>
      </div>
      <button class="close-sidebar" @click="$emit('close')">✕</button>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Chama Management</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/chama-admin/dashboard" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-graph-up"></i>
            <span>Overview</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/members" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-person-lines-fill"></i>
            <span>Members</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Operations</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/app/expenses" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-receipt"></i>
            <span>Expenses</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/petty-cash" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-wallet2"></i>
            <span>Petty Cash</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/bank-reconciliation" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-patch-check"></i>
            <span>Bank Reconcile</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/finances" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-cash-coin"></i>
            <span>Finances</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/loans" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-bank"></i>
            <span>Loans</span>
          </router-link>
        </li>
        <li>
          <router-link to="/chama-admin/meetings" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-calendar-event"></i>
            <span>Meetings</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Settings</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/chama-admin/settings" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-gear"></i>
            <span>Chama Settings</span>
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
