import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import LandingPage from '@/views/LandingPage.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
    meta: { layout: 'public' }
  },
  {
    path: '/login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/forgot-password',
    component: () => import('@/views/auth/ForgotPassword.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/app',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('@/views/dashboard/MemberDashboard.vue') },
      { path: 'members', component: () => import('@/views/members/MemberList.vue') },
      { path: 'members/:id', component: () => import('@/views/members/MemberProfile.vue') },
      { path: 'contributions', component: () => import('@/views/contributions/MakeContribution.vue') },
      { path: 'contributions/history', component: () => import('@/views/contributions/ContributionHistory.vue') },
      { path: 'loans', component: () => import('@/views/loans/LoanList.vue') },
      { path: 'loans/apply', component: () => import('@/views/loans/ApplyLoan.vue') },
      { path: 'loans/:id/repay', component: () => import('@/views/loans/RepayLoan.vue') },
      { path: 'meetings', component: () => import('@/views/meetings/MeetingList.vue') },
      { path: 'meetings/schedule', component: () => import('@/views/meetings/ScheduleMeeting.vue') },
      { path: 'dividends', component: () => import('@/views/dividends/DividendHistory.vue') },
      { path: 'investments', component: () => import('@/views/investments/InvestmentList.vue') },
      { path: 'reports', component: () => import('@/views/reports/FinancialReports.vue') },
      { path: 'mpesa', component: () => import('@/views/mpesa/MpesaPayment.vue') },
      { path: 'settings', component: () => import('@/views/settings/GeneralSettings.vue') },
      { path: 'profile', component: () => import('@/views/profile/MyProfile.vue') },
      
      // Phase 1: Quick Win Features
      { path: 'financial-goals', component: () => import('@/views/financial-goals/FinancialGoals.vue') },
      { path: 'emergency-fund', component: () => import('@/views/emergency-fund/EmergencyFund.vue') },
      { path: 'wallets', component: () => import('@/views/wallets/WalletManagement.vue') },
      { path: 'loans/eligibility', component: () => import('@/views/loans/LoanEligibility.vue') },
      { path: 'members/directory', component: () => import('@/views/members/MemberDirectory.vue') },
      { path: 'members/exit-management', component: () => import('@/views/members/ExitManagement.vue') },
      { path: 'recurring-contributions', component: () => import('@/views/recurring-contributions/RecurringContributions.vue') },
      { path: 'expenses', component: () => import('@/views/expenses/ExpenseTracking.vue') },
      { path: 'petty-cash', component: () => import('@/views/expenses/PettyCash.vue') },
      { path: 'bank-reconciliation', component: () => import('@/views/chama-admin/BankReconciliation.vue') },
      
      // New Phase 1-6 Routes
      { path: 'community', component: () => import('@/views/community/CommunityHub.vue') },
      { path: 'engagement', component: () => import('@/views/engagement/EngagementDashboard.vue') },
      { path: 'events', component: () => import('@/views/events/EventList.vue') },
      { path: 'meetings', component: () => import('@/views/events/MeetingCenter.vue') },
      { path: 'analytics', component: () => import('@/views/analytics/PredictiveAnalytics.vue') }
    ]
  },
  // Super Admin Routes
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('@/views/admin/SuperAdminDashboard.vue') },
      { path: 'users', component: () => import('@/views/admin/UserManagement.vue') },
      { path: 'chamas', component: () => import('@/views/admin/ChamaManagement.vue') },
      { path: 'settings', component: () => import('@/views/admin/SystemSettings.vue') },
      { path: 'logs', component: () => import('@/views/admin/SystemLogs.vue') }
    ]
  },
  // Chama Admin Routes
  {
    path: '/chama-admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresChamaAdmin: true },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('@/views/chama-admin/ChamaAdminDashboard.vue') },
      { path: 'members', component: () => import('@/views/chama-admin/MembersManagement.vue') },
      { path: 'finances', component: () => import('@/views/chama-admin/FinancesOverview.vue') },
      { path: 'loans', component: () => import('@/views/chama-admin/LoansManagement.vue') },
      { path: 'meetings', component: () => import('@/views/events/MeetingCenter.vue') },
      { path: 'bank-reconciliation', component: () => import('@/views/chama-admin/BankReconciliation.vue') },
      { path: 'settings', component: () => import('@/views/settings/GeneralSettings.vue') },
      
      // New Admin Routes
      { path: 'compliance', component: () => import('@/views/security/ComplianceChecklist.vue') },
      { path: 'webhooks', component: () => import('@/views/security/WebhookManager.vue') }
    ]
  },
  // Top-level redirect routes for convenience
  { path: '/dashboard', redirect: '/app/dashboard' },
  { path: '/members', redirect: '/app/members' },
  { path: '/contributions', redirect: '/app/contributions' },
  { path: '/loans', redirect: '/app/loans' },
  { path: '/meetings', redirect: '/app/meetings' },
  { path: '/dividends', redirect: '/app/dividends' },
  { path: '/investments', redirect: '/app/investments' },
  { path: '/reports', redirect: '/app/reports' },
  { path: '/settings', redirect: '/app/settings' },
  { path: '/profile', redirect: '/app/profile' },
  { path: '/community', redirect: '/app/community' },
  { path: '/engagement', redirect: '/app/engagement' },
  { path: '/financial-goals', redirect: '/app/financial-goals' },
  { path: '/emergency-fund', redirect: '/app/emergency-fund' },
  { path: '/wallets', redirect: '/app/wallets' },
  { path: '/member-directory', redirect: '/app/members/directory' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roles = user.roles || []
  
  // Check authentication
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  
  // Redirect to role-specific dashboard if accessing generic /dashboard or /app
  if (to.path === '/dashboard' || to.path === '/app' || to.path === '/app/') {
    if (roles.includes('super-admin')) {
      next('/admin/dashboard')
    } else if (roles.includes('chama-admin')) {
      next('/chama-admin/dashboard')
    } else {
      next('/app/dashboard')
    }
    return
  }
  
  // Redirect to dashboard if already logged in and trying to visit login
  if (to.path === '/login' && token) {
    if (roles.includes('super-admin')) {
      next('/admin/dashboard')
    } else if (roles.includes('chama-admin')) {
      next('/chama-admin/dashboard')
    } else {
      next('/app/dashboard')
    }
    return
  }
  
  // Check admin role requirements
  if (to.meta.requiresAdmin && !roles.includes('super-admin')) {
    next('/app/dashboard')
    return
  }
  
  // Check chama admin role requirements
  if (to.meta.requiresChamaAdmin && !roles.includes('chama-admin') && !roles.includes('super-admin')) {
    next('/app/dashboard')
    return
  }
  
  next()
})

export default router
