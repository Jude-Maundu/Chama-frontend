<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">💰</div>
        <span class="logo-text">Chama<span>Member</span></span>
      </div>
      <button class="close-sidebar" @click="$emit('close')">✕</button>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">My Dashboard</div>
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
      <div class="sidebar-title">Financials</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/app/contributions" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-cash-stack"></i>
            <span>Contributions</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/recurring-contributions" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-calendar-check"></i>
            <span>Recurring</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/financial-goals" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-target"></i>
            <span>Financial Goals</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/loans" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-bank"></i>
            <span>My Loans</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/loans/eligibility" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-graph-up-arrow"></i>
            <span>Loan Eligibility</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/dividends" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-gift"></i>
            <span>My Dividends</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Wallet & Payments</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/app/wallets" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-wallet2"></i>
            <span>My Wallet</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/emergency-fund" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-exclamation-circle"></i>
            <span>Emergency Fund</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/expenses" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-receipt"></i>
            <span>Expenses</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/petty-cash" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-cash"></i>
            <span>Petty Cash</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-title">Engagement</div>
      <ul class="sidebar-menu">
        <li>
          <router-link to="/app/meetings" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-calendar-event"></i>
            <span>Meetings</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/investments" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-graph-up"></i>
            <span>Chama Investments</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/members/directory" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-people"></i>
            <span>Member Directory</span>
          </router-link>
        </li>
        <li>
          <router-link to="/app/members/exit-management" class="sidebar-link" @click="$emit('close')">
            <i class="bi bi-door-open"></i>
            <span>Exit & Succession</span>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section mt-auto">
      <ul class="sidebar-menu">
        <li>
          <router-link to="/app/profile" class="sidebar-link" @click="$emit('close')">
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
