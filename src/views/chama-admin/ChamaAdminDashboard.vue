<template>
  <div class="admin-content">
    <div class="admin-header">
      <h1 class="admin-header-title">{{ chamaName }} - Dashboard</h1>
      <div class="admin-header-actions">
        <button class="btn btn-primary btn-sm" @click="refreshData">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="admin-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Total Members</h6>
            <div class="stat-card-value">{{ stats.total_members || 0 }}</div>
          </div>
          <div class="stat-card-icon">
            <i class="bi bi-people"></i>
          </div>
        </div>
        <div class="stat-card-change positive">
          <i class="bi bi-arrow-up"></i> Active: {{ stats.active_members || 0 }}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Total Contributions</h6>
            <div class="stat-card-value">KES {{ formatCurrency(stats.total_contributions || 0) }}</div>
          </div>
          <div class="stat-card-icon">
            <i class="bi bi-cash-coin"></i>
          </div>
        </div>
        <div class="stat-card-change positive">
          <i class="bi bi-arrow-up"></i> This Month: KES {{ formatCurrency(stats.monthly_contributions || 0) }}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Active Loans</h6>
            <div class="stat-card-value">{{ stats.active_loans_count || 0 }}</div>
          </div>
          <div class="stat-card-icon">
            <i class="bi bi-bank"></i>
          </div>
        </div>
        <div class="stat-card-change" :class="stats.default_rate > 5 ? 'negative' : 'positive'">
          <i :class="stats.default_rate > 5 ? 'bi-arrow-up' : 'bi-arrow-down'"></i> Default: {{ stats.default_rate || 0 }}%
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Available Balance</h6>
            <div class="stat-card-value">KES {{ formatCurrency(stats.available_balance || 0) }}</div>
          </div>
          <div class="stat-card-icon">
            <i class="bi bi-wallet"></i>
          </div>
        </div>
        <div class="stat-card-change">
          <i class="bi bi-info-circle"></i> Reserve: KES {{ formatCurrency(stats.reserve_fund || 0) }}
        </div>
      </div>
    </div>

    <!-- Charts and Details -->
    <div class="admin-row">
      <div class="admin-col">
        <div class="admin-chart-container">
          <h5 class="admin-chart-title">Monthly Contributions Trend</h5>
          <canvas id="contributionsChart" height="300"></canvas>
        </div>
      </div>

      <div class="admin-col">
        <div class="admin-chart-container">
          <h5 class="admin-chart-title">Loan Distribution</h5>
          <canvas id="loansChart" height="300"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="admin-row">
      <div class="admin-col">
        <div class="admin-table-container">
          <div class="admin-table-header">
            <h5>Recent Members</h5>
          </div>
          <div class="admin-table-wrapper">
            <table class="admin-table" v-if="recentMembers.length > 0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in recentMembers" :key="member.id">
                  <td class="fw-semibold">{{ member.name }}</td>
                  <td>{{ member.phone_number }}</td>
                  <td>{{ formatDate(member.created_at) }}</td>
                  <td>
                    <span class="status-indicator" :class="member.is_active ? 'online' : 'offline'">
                      {{ member.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="p-3 text-center text-muted">
              No members found
            </div>
          </div>
        </div>
      </div>

      <div class="admin-col">
        <div class="admin-table-container">
          <div class="admin-table-header">
            <h5>Recent Contributions</h5>
          </div>
          <div class="admin-table-wrapper">
            <table class="admin-table" v-if="recentContributions.length > 0">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="contribution in recentContributions" :key="contribution.id">
                  <td class="fw-semibold">{{ contribution.member_name }}</td>
                  <td>KES {{ formatCurrency(contribution.amount) }}</td>
                  <td>{{ formatDate(contribution.created_at) }}</td>
                  <td>
                    <span class="badge" :class="`badge-${contribution.status}`">
                      {{ contribution.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="p-3 text-center text-muted">
              No contributions found
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Loan Approvals -->
    <div class="admin-table-container mt-3">
      <div class="admin-table-header">
        <h5>Pending Loan Approvals</h5>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table" v-if="pendingLoans.length > 0">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Loan Amount</th>
              <th>Purpose</th>
              <th>Applied</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in pendingLoans" :key="loan.id">
              <td class="fw-semibold">{{ loan.applicant_name }}</td>
              <td>KES {{ formatCurrency(loan.amount) }}</td>
              <td>{{ loan.purpose }}</td>
              <td>{{ formatDate(loan.created_at) }}</td>
              <td>
                <button class="admin-table-action-btn edit" @click="approveLoan(loan.id)">
                  Approve
                </button>
                <button class="admin-table-action-btn delete" @click="rejectLoan(loan.id)">
                  Reject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-3 text-center text-muted">
          No pending loan approvals
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import Chart from 'chart.js/auto'
import api from '@/api/axios'

const stats = ref({})
const recentMembers = ref([])
const recentContributions = ref([])
const pendingLoans = ref([])
const chamaName = ref('Chama')
const loading = ref(false)
let contributionsChart = null
let loansChart = null

const formatCurrency = (amount) => {
  return Number(amount).toLocaleString()
}

const formatDate = (date) => {
  return dayjs(date).format('MMM DD, YYYY')
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const response = await api.get('/chama-admin/dashboard')
    stats.value = response.data.stats || {}
    recentMembers.value = response.data.recent_members || []
    recentContributions.value = response.data.recent_contributions || []
    pendingLoans.value = response.data.pending_loans || []
    chamaName.value = response.data.chama_name || 'Chama'

    // Initialize charts
    await initializeCharts()
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    Swal.fire('Error', 'Failed to fetch dashboard data', 'error')
  } finally {
    loading.value = false
  }
}

const initializeCharts = async () => {
  // Wait for DOM to be ready
  await new Promise(resolve => setTimeout(resolve, 100))

  const contributionsCtx = document.getElementById('contributionsChart')
  const loansCtx = document.getElementById('loansChart')

  if (contributionsCtx) {
    if (contributionsChart) {
      contributionsChart.destroy()
    }
    contributionsChart = new Chart(contributionsCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Monthly Contributions',
          data: stats.value.monthly_trend || [],
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }

  if (loansCtx) {
    if (loansChart) {
      loansChart.destroy()
    }
    loansChart = new Chart(loansCtx, {
      type: 'doughnut',
      data: {
        labels: ['Disbursed', 'Pending', 'Repaid', 'Defaulted'],
        datasets: [{
          data: [
            stats.value.disbursed_loans || 0,
            stats.value.pending_loans_count || 0,
            stats.value.repaid_loans || 0,
            stats.value.defaulted_loans || 0
          ],
          backgroundColor: [
            '#2E7D32',
            '#F57C00',
            '#388E3C',
            '#D32F2F'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    })
  }
}

const refreshData = () => {
  fetchDashboardData()
}

const approveLoan = async (loanId) => {
  const confirmed = await Swal.fire({
    title: 'Approve Loan?',
    text: 'Are you sure you want to approve this loan?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Approve',
    cancelButtonText: 'Cancel'
  })

  if (confirmed.isConfirmed) {
    try {
      await api.post(`/chama-admin/loans/${loanId}/approve`)
      Swal.fire('Success', 'Loan approved successfully', 'success')
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving loan:', error)
      Swal.fire('Error', 'Failed to approve loan', 'error')
    }
  }
}

const rejectLoan = async (loanId) => {
  const confirmed = await Swal.fire({
    title: 'Reject Loan?',
    text: 'Are you sure you want to reject this loan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Reject',
    cancelButtonText: 'Cancel'
  })

  if (confirmed.isConfirmed) {
    try {
      await api.post(`/chama-admin/loans/${loanId}/reject`)
      Swal.fire('Success', 'Loan rejected successfully', 'success')
      fetchDashboardData()
    } catch (error) {
      console.error('Error rejecting loan:', error)
      Swal.fire('Error', 'Failed to reject loan', 'error')
    }
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.mt-3 {
  margin-top: 1.5rem;
}

canvas {
  max-height: 300px;
}
</style>
