<template>
  <component :is="activeDashboard" />
</template>

<script setup>
import { computed } from 'vue'
import MemberDashboardContent from '@/views/dashboard/components/MemberDashboardContent.vue'
import TreasurerDashboard from '@/views/dashboard/TreasurerDashboard.vue'
import SecretaryDashboard from '@/views/dashboard/SecretaryDashboard.vue'
import ChamaAdminDashboard from '@/views/chama-admin/ChamaAdminDashboard.vue'
import SuperAdminDashboard from '@/views/admin/SuperAdminDashboard.vue'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const roles = user.roles || []

const activeDashboard = computed(() => {
  if (roles.includes('super-admin')) return SuperAdminDashboard
  if (roles.includes('chama-admin')) return ChamaAdminDashboard
  if (roles.includes('treasurer')) return TreasurerDashboard
  if (roles.includes('secretary')) return SecretaryDashboard
  return MemberDashboardContent
})
</script>
