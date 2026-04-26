<template>
  <div class="admin-content">
    <div class="admin-header">
      <h1 class="admin-header-title">Loans Management</h1>
      <div class="admin-header-actions">
        <select v-model="statusFilter" class="form-select form-select-sm">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="disbursed">Disbursed</option>
          <option value="rejected">Rejected</option>
          <option value="defaulted">Defaulted</option>
        </select>
      </div>
    </div>

    <!-- Loan Stats -->
    <div class="admin-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Total Loan Portfolio</h6>
            <div class="stat-card-value">KES {{ formatCurrency(stats.total_amount || 0) }}</div>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Active Loans</h6>
            <div class="stat-card-value">{{ stats.active_loans || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Pending Requests</h6>
            <div class="stat-card-value">{{ stats.pending_loans || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div>
            <h6 class="stat-card-label">Default Rate</h6>
            <div class="stat-card-value text-danger">{{ stats.default_rate || 0 }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loans Table -->
    <div class="admin-table-container mt-3">
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Borrower</th>
              <th>Amount</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Monthly Pay</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in filteredLoans" :key="loan.id">
              <td>{{ formatDate(loan.created_at) }}</td>
              <td class="fw-semibold">{{ loan.borrower_name }}</td>
              <td>KES {{ formatCurrency(loan.amount) }}</td>
              <td>{{ loan.duration_months }} Months</td>
              <td>
                <span class="badge" :class="`badge-${loan.status}`">
                  {{ loan.status }}
                </span>
              </td>
              <td>KES {{ formatCurrency(loan.monthly_payment) }}</td>
              <td>
                <div class="d-flex gap-1">
                  <button 
                    v-if="loan.status === 'pending'"
                    class="admin-table-action-btn edit" 
                    @click="approveLoan(loan)"
                  >
                    Approve
                  </button>
                  <button 
                    v-if="loan.status === 'pending'"
                    class="admin-table-action-btn delete" 
                    @click="rejectLoan(loan)"
                  >
                    Reject
                  </button>
                  <button 
                    v-if="loan.status === 'approved'"
                    class="admin-table-action-btn edit" 
                    @click="disburseLoan(loan)"
                  >
                    Disburse
                  </button>
                  <button class="admin-table-action-btn" @click="viewDetails(loan)">
                    Details
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredLoans.length === 0">
              <td colspan="7" class="text-center p-3 text-muted">No loans matching filter</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import api from '@/api/axios'

const loans = ref([])
const stats = ref({})
const statusFilter = ref('all')
const loading = ref(false)

const formatCurrency = (amount) => {
  return Number(amount).toLocaleString()
}

const formatDate = (date) => {
  return dayjs(date).format('MMM DD, YYYY')
}

const fetchLoans = async () => {
  loading.value = true
  try {
    const response = await api.get('/chama-admin/loans')
    loans.value = response.data.data || []
    stats.value = response.data.stats || {}
  } catch (error) {
    console.error('Error fetching loans:', error)
    Swal.fire('Error', 'Failed to fetch loans', 'error')
  } finally {
    loading.value = false
  }
}

const filteredLoans = computed(() => {
  if (statusFilter.value === 'all') return loans.value
  return loans.value.filter(l => l.status === statusFilter.value)
})

const approveLoan = async (loan) => {
  const result = await Swal.fire({
    title: 'Approve Loan?',
    text: `Are you sure you want to approve KES ${formatCurrency(loan.amount)} for ${loan.borrower_name}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Approve'
  })

  if (result.isConfirmed) {
    try {
      await api.post(`/chama-admin/loans/${loan.id}/approve`)
      Swal.fire('Approved!', 'Loan has been approved.', 'success')
      fetchLoans()
    } catch (error) {
      Swal.fire('Error', 'Failed to approve loan', 'error')
    }
  }
}

const rejectLoan = async (loan) => {
  const result = await Swal.fire({
    title: 'Reject Loan?',
    text: `Reject loan application for ${loan.borrower_name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, Reject'
  })

  if (result.isConfirmed) {
    try {
      await api.post(`/chama-admin/loans/${loan.id}/reject`)
      Swal.fire('Rejected', 'Loan application rejected.', 'success')
      fetchLoans()
    } catch (error) {
      Swal.fire('Error', 'Failed to reject loan', 'error')
    }
  }
}

const disburseLoan = async (loan) => {
  const result = await Swal.fire({
    title: 'Disburse Funds?',
    text: `Confirm disbursement of KES ${formatCurrency(loan.amount)} to ${loan.borrower_name}?`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Confirm Disbursement'
  })

  if (result.isConfirmed) {
    try {
      await api.post(`/chama-admin/loans/${loan.id}/disburse`)
      Swal.fire('Disbursed!', 'Funds have been disbursed.', 'success')
      fetchLoans()
    } catch (error) {
      Swal.fire('Error', 'Failed to disburse loan', 'error')
    }
  }
}

const viewDetails = (loan) => {
  Swal.fire({
    title: 'Loan Details',
    html: `
      <div class="text-start">
        <p><strong>Borrower:</strong> ${loan.borrower_name}</p>
        <p><strong>Purpose:</strong> ${loan.purpose}</p>
        <p><strong>Amount:</strong> KES ${formatCurrency(loan.amount)}</p>
        <p><strong>Duration:</strong> ${loan.duration_months} Months</p>
        <p><strong>Monthly Repayment:</strong> KES ${formatCurrency(loan.monthly_payment)}</p>
        <p><strong>Remaining Balance:</strong> KES ${formatCurrency(loan.remaining_balance)}</p>
      </div>
    `,
    icon: 'info'
  })
}

onMounted(() => {
  fetchLoans()
})
</script>

<style scoped>
.admin-form-full {
  grid-column: 1 / -1;
}

.negative {
  color: var(--danger-color);
}

p {
  margin: 0;
}
</style>
