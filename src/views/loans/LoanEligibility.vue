<template>
  <div class="loan-eligibility-container container">
    <div class="header flex-between gap-4 flex-col-mobile">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Loan Eligibility</h1>
      <button @click="refreshEligibility" class="btn btn-primary whitespace-nowrap">
        <i class="fas fa-sync"></i> <span class="hide-mobile">Refresh Score</span><span class="show-mobile">Refresh</span>
      </button>
    </div>

    <!-- My Eligibility Score -->
    <div class="eligibility-score-card card margin-y-4">
      <div class="score-header flex-between">
        <h2 class="text-xl-desktop text-lg-tablet text-base">Your Loan Eligibility Score</h2>
        <span v-if="myEligibility" :class="['eligibility-badge', getEligibilityLevel(myEligibility.score)]">
          {{ getEligibilityLabel(myEligibility.score) }}
        </span>
      </div>

      <div v-if="myEligibility" class="score-content grid grid-cols-1 grid-cols-2-tablet gap-6 margin-y-4">
        <!-- Main Score Circle -->
        <div class="score-circle">
          <div class="score-number text-4xl-desktop text-3xl-tablet text-2xl">{{ Math.round(myEligibility.score) }}</div>
          <div class="score-label text-sm">out of 100</div>
        </div>

        <!-- Score Details -->
        <div class="score-details">
          <div class="detail-row flex-between">
            <span class="detail-label text-sm">Maximum Loan Amount</span>
            <span class="detail-value text-base-mobile text-lg-tablet">{{ formatCurrency(myEligibility.max_loan_amount) }}</span>
          </div>

          <div class="detail-row flex-between">
            <span class="detail-label text-sm">Recommended Loan Amount</span>
            <span class="detail-value text-base-mobile text-lg-tablet">{{ formatCurrency(myEligibility.recommended_amount) }}</span>
          </div>

          <div class="detail-row flex-between">
            <span class="detail-label text-sm">Interest Rate</span>
            <span class="detail-value text-base-mobile text-lg-tablet">{{ myEligibility.interest_rate }}% per annum</span>
          </div>

          <div class="detail-row flex-between">
            <span class="detail-label text-sm">Last Updated</span>
            <span class="detail-value text-base-mobile text-lg-tablet">{{ formatDate(myEligibility.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Eligibility Factors -->
      <div class="factors-section margin-y-6">
        <h3 class="text-lg-desktop text-base-tablet margin-y-4">Factors Affecting Your Score</h3>

        <div class="factors-grid grid grid-cols-2-mobile grid-cols-4-tablet grid-cols-4-desktop gap-4">
          <div class="factor-card">
            <div class="factor-icon" :style="{ color: getFactorColor(myEligibility.contribution_score) }">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <h4 class="text-sm">Contributions</h4>
            <p class="factor-score text-base">{{ Math.round(myEligibility.contribution_score) }}/25</p>
            <p class="factor-description text-xs">Regular contributions</p>
          </div>

          <div class="factor-card">
            <div class="factor-icon" :style="{ color: getFactorColor(myEligibility.savings_score) }">
              <i class="fas fa-piggy-bank"></i>
            </div>
            <h4 class="text-sm">Savings</h4>
            <p class="factor-score text-base">{{ Math.round(myEligibility.savings_score) }}/25</p>
            <p class="factor-description text-xs">Accumulated savings</p>
          </div>

          <div class="factor-card">
            <div class="factor-icon" :style="{ color: getFactorColor(myEligibility.repayment_score) }">
              <i class="fas fa-handshake"></i>
            </div>
            <h4 class="text-sm">Repayment History</h4>
            <p class="factor-score text-base">{{ Math.round(myEligibility.repayment_score) }}/25</p>
            <p class="factor-description text-xs">On-time loan repayments</p>
          </div>

          <div class="factor-card">
            <div class="factor-icon" :style="{ color: getFactorColor(myEligibility.engagement_score) }">
              <i class="fas fa-users"></i>
            </div>
            <h4 class="text-sm">Member Engagement</h4>
            <p class="factor-score text-base">{{ Math.round(myEligibility.engagement_score) }}/25</p>
            <p class="factor-description text-xs">Meeting attendance & activity</p>
          </div>
        </div>
      </div>

        <!-- Loan Eligibility Status -->
        <div class="eligibility-status">
          <div v-if="myEligibility.is_eligible" class="status-box eligible">
            <i class="fas fa-check-circle"></i>
            <div>
              <h4>You are eligible to apply for a loan</h4>
              <p>You meet the minimum requirements to apply for a loan</p>
            </div>
          </div>
          <div v-else class="status-box not-eligible">
            <i class="fas fa-times-circle"></i>
            <div>
              <h4>Not yet eligible</h4>
              <p>Improve your score to become eligible for loans</p>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="myEligibility.recommendations && myEligibility.recommendations.length > 0" class="recommendations">
          <h3>How to Improve Your Score</h3>
          <ul>
            <li v-for="(recommendation, index) in myEligibility.recommendations" :key="index">
              {{ recommendation }}
            </li>
          </ul>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading eligibility information...</p>
      </div>
    </div>

    <!-- Member Eligibility List (for admins) -->
    <div v-if="userIsAdmin" class="admin-section">
      <h2>Member Loan Eligibility</h2>

      <!-- Filters -->
      <div class="filters-section">
        <input
          v-model="filterSearch"
          type="text"
          class="form-control filter-input"
          placeholder="Search by member name..."
        />
        <select v-model="filterStatus" class="form-control filter-input">
          <option value="">All Statuses</option>
          <option value="eligible">Eligible</option>
          <option value="not-eligible">Not Eligible</option>
        </select>
      </div>

      <!-- Members Table -->
      <div class="members-table">
        <div v-if="filteredMembers.length === 0" class="empty-state">
          <p>No members found</p>
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Score</th>
              <th>Status</th>
              <th>Max Loan</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in filteredMembers" :key="member.id">
              <td>{{ member.member_name }}</td>
              <td class="score-cell">{{ Math.round(member.score) }}</td>
              <td>
                <span :class="['status-badge', member.is_eligible ? 'eligible' : 'not-eligible']">
                  {{ member.is_eligible ? 'Eligible' : 'Not Eligible' }}
                </span>
              </td>
              <td>{{ formatCurrency(member.max_loan_amount) }}</td>
              <td>{{ formatDate(member.updated_at) }}</td>
              <td>
                <button @click="refreshMemberEligibility(member.id)" class="btn btn-sm btn-secondary">
                  Refresh
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { loanEligibilityApi } from '@/api/loanEligibility'

export default {
  name: 'LoanEligibility',
  setup() {
    const myEligibility = ref(null)
    const allMembers = ref([])
    const loading = ref(false)
    const error = ref('')
    const successMessage = ref('')
    const userIsAdmin = ref(false)
    const filterSearch = ref('')
    const filterStatus = ref('')

    const loadMyEligibility = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await loanEligibilityApi.getForCurrentUser()
        myEligibility.value = response.data

        // Check if user is admin
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        userIsAdmin.value = user.roles?.includes('chama-admin') || user.roles?.includes('super-admin')

        if (userIsAdmin.value) {
          loadAllMembersEligibility()
        }
      } catch (err) {
        error.value = 'Failed to load eligibility information'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const loadAllMembersEligibility = async () => {
      try {
        const response = await loanEligibilityApi.getForCurrentUser()
        // This endpoint should ideally return all members for admin
        // Adjust based on actual API response
        allMembers.value = response.data.all_members || []
      } catch (err) {
        console.error('Failed to load members eligibility', err)
      }
    }

    const refreshMemberEligibility = async (memberId) => {
      try {
        await loanEligibilityApi.refreshForUser(memberId)
        successMessage.value = 'Member eligibility score refreshed!'
        setTimeout(() => successMessage.value = '', 3000)
        loadAllMembersEligibility()
      } catch (err) {
        error.value = 'Failed to refresh member eligibility'
        console.error(err)
      }
    }

    const refreshEligibility = async () => {
      try {
        // Get current user ID
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        await loanEligibilityApi.refreshForUser(user.id)
        successMessage.value = 'Your eligibility score has been refreshed!'
        setTimeout(() => successMessage.value = '', 3000)
        loadMyEligibility()
      } catch (err) {
        error.value = 'Failed to refresh eligibility score'
        console.error(err)
      }
    }

    const filteredMembers = computed(() => {
      return allMembers.value.filter(member => {
        const searchMatch = member.member_name.toLowerCase().includes(filterSearch.value.toLowerCase())
        const statusMatch =
          filterStatus.value === '' ||
          (filterStatus.value === 'eligible' && member.is_eligible) ||
          (filterStatus.value === 'not-eligible' && !member.is_eligible)
        return searchMatch && statusMatch
      })
    })

    const getEligibilityLevel = (score) => {
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'fair'
      return 'poor'
    }

    const getEligibilityLabel = (score) => {
      if (score >= 80) return 'Excellent'
      if (score >= 60) return 'Good'
      if (score >= 40) return 'Fair'
      return 'Poor'
    }

    const getFactorColor = (score) => {
      if (score >= 20) return '#27ae60' // Green
      if (score >= 15) return '#f39c12' // Orange
      return '#e74c3c' // Red
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
      }).format(amount || 0)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    onMounted(() => {
      loadMyEligibility()
    })

    return {
      myEligibility,
      allMembers,
      loading,
      error,
      successMessage,
      userIsAdmin,
      filterSearch,
      filterStatus,
      filteredMembers,
      refreshMemberEligibility,
      refreshEligibility,
      getEligibilityLevel,
      getEligibilityLabel,
      getFactorColor,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
.loan-eligibility-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

/* Eligibility Score Card */
.eligibility-score-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.score-header h2 {
  margin: 0;
  color: #333;
}

.eligibility-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.eligibility-badge.excellent {
  background: #d4edda;
  color: #155724;
}

.eligibility-badge.good {
  background: #cce5ff;
  color: #004085;
}

.eligibility-badge.fair {
  background: #fff3cd;
  color: #856404;
}

.eligibility-badge.poor {
  background: #f8d7da;
  color: #721c24;
}

.score-content {
  display: grid;
  gap: 2rem;
}

/* Score Circle */
.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f8fbff 0%, #e8f2ff 100%);
  border: 4px solid #2c5aa0;
  margin: 0 auto;
}

.score-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c5aa0;
}

.score-label {
  color: #999;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

/* Score Details */
.score-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 6px;
}

.detail-label {
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  color: #2c5aa0;
  font-weight: 600;
}

/* Factors Section */
.factors-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.factors-section h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.factors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.factor-card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e0e0e0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.factor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.factor-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.factor-card h4 {
  margin: 0.75rem 0;
  color: #333;
  font-size: 1rem;
}

.factor-score {
  margin: 0.35rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c5aa0;
}

.factor-description {
  margin: 0.35rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

/* Eligibility Status */
.eligibility-status {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.status-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
}

.status-box i {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.status-box h4 {
  margin: 0;
  color: inherit;
}

.status-box p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.status-box.eligible {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-box.not-eligible {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Recommendations */
.recommendations {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f0f7ff;
  border-radius: 8px;
  border-left: 4px solid #2c5aa0;
}

.recommendations h3 {
  margin: 0 0 1rem 0;
  color: #2c5aa0;
}

.recommendations ul {
  margin: 0;
  padding-left: 1.5rem;
  list-style: none;
}

.recommendations li {
  margin-bottom: 0.75rem;
  color: #2c5aa0;
  padding-left: 1rem;
  position: relative;
}

.recommendations li:before {
  content: '✓';
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* Admin Section */
.admin-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-section h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.75rem;
}

.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-input {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
}

.filter-input:focus {
  outline: none;
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

/* Table */
.members-table {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f9f9f9;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table th {
  font-weight: 600;
  color: #333;
}

.table tbody tr:hover {
  background: #f9f9f9;
}

.score-cell {
  font-weight: 600;
  color: #2c5aa0;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.eligible {
  background: #d4edda;
  color: #155724;
}

.status-badge.not-eligible {
  background: #f8d7da;
  color: #721c24;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #2c5aa0;
  color: white;
}

.btn-primary:hover {
  background: #1e4277;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-danger {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

/* Loading */
.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .loan-eligibility-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .score-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .factors-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .table {
    font-size: 0.85rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }
}
</style>
