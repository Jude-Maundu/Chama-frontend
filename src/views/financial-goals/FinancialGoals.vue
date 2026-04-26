<template>
  <div class="financial-goals-container container">
    <div class="header flex-between gap-4">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Financial Goals</h1>
      <button @click="showCreateModal = true" class="btn btn-primary whitespace-nowrap">
        <i class="fas fa-plus"></i> <span class="hide-mobile">New Goal</span><span class="show-mobile">Add</span>
      </button>
    </div>

    <!-- Goals Summary -->
    <div class="summary-cards grid grid-cols-1 grid-cols-2-tablet grid-cols-3-desktop gap-4 margin-y-4">
      <div class="summary-card">
        <h3 class="text-sm">Total Target</h3>
        <p class="amount text-xl-desktop text-lg-tablet text-base">{{ formatCurrency(totalTarget) }}</p>
      </div>
      <div class="summary-card">
        <h3 class="text-sm">Total Saved</h3>
        <p class="amount saved text-xl-desktop text-lg-tablet text-base">{{ formatCurrency(totalSaved) }}</p>
      </div>
      <div class="summary-card">
        <h3 class="text-sm">Overall Progress</h3>
        <p class="amount text-xl-desktop text-lg-tablet text-base">{{ overallProgress }}%</p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: overallProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Goals List -->
    <div class="goals-list">
      <div v-if="goals.length === 0" class="empty-state">
        <i class="fas fa-target"></i>
        <p>No financial goals yet. Create one to get started!</p>
      </div>

      <div v-for="goal in goals" :key="goal.id" class="goal-card">
        <div class="goal-header">
          <h3>{{ goal.goal_name }}</h3>
          <div class="goal-actions">
            <button @click="editGoal(goal)" class="btn-icon" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteGoal(goal.id)" class="btn-icon danger" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <p class="goal-description">{{ goal.goal_description }}</p>

        <div class="goal-category">
          <span :class="['category-badge', goal.category]">
            {{ formatCategory(goal.category) }}
          </span>
          <span :class="['status-badge', goal.status]">
            {{ formatStatus(goal.status) }}
          </span>
        </div>

        <div class="goal-progress">
          <div class="progress-info">
            <div>
              <span class="label">Saved</span>
              <span class="value">{{ formatCurrency(goal.current_amount) }}</span>
            </div>
            <div>
              <span class="label">Target</span>
              <span class="value">{{ formatCurrency(goal.target_amount) }}</span>
            </div>
            <div>
              <span class="label">Progress</span>
              <span class="value">{{ goalProgress(goal) }}%</span>
            </div>
          </div>

          <div class="progress-bar">
            <div class="progress" :style="{ width: goalProgress(goal) + '%' }"></div>
          </div>
        </div>

        <div class="goal-date">
          <i class="fas fa-calendar"></i>
          Target: {{ formatDate(goal.target_date) }}
        </div>

        <button @click="openContributeModal(goal)" class="btn btn-sm btn-success">
          <i class="fas fa-plus"></i> Add Contribution
        </button>
      </div>
    </div>

    <!-- Create/Edit Goal Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveGoal">
            <div class="form-group">
              <label>Goal Name *</label>
              <input
                v-model="form.goal_name"
                type="text"
                class="form-control"
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="form.goal_description"
                class="form-control"
                placeholder="What is this goal for?"
                rows="3"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Target Amount *</label>
                <input
                  v-model.number="form.target_amount"
                  type="number"
                  class="form-control"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="form-group">
                <label>Target Date *</label>
                <input
                  v-model="form.target_date"
                  type="date"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Category *</label>
              <select v-model="form.category" class="form-control" required>
                <option value="">Select Category</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="investment">Investment</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingGoal ? 'Update' : 'Create' }} Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Contribute Modal -->
    <div v-if="showContributeModal" class="modal-overlay" @click="closeContributeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Add Contribution to {{ selectedGoal?.goal_name }}</h2>
          <button @click="closeContributeModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="addContribution">
            <div class="form-group">
              <label>Amount to Contribute *</label>
              <input
                v-model.number="contributionAmount"
                type="number"
                class="form-control"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <p class="info-text">
              Current: {{ formatCurrency(selectedGoal?.current_amount) }} / Target: {{ formatCurrency(selectedGoal?.target_amount) }}
            </p>

            <div class="form-actions">
              <button type="button" @click="closeContributeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Add Contribution
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Loading/Error States -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading goals...</p>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { financialGoalsApi } from '@/api/financialGoals'

export default {
  name: 'FinancialGoals',
  setup() {
    const goals = ref([])
    const loading = ref(false)
    const error = ref('')
    const showCreateModal = ref(false)
    const showContributeModal = ref(false)
    const editingGoal = ref(null)
    const selectedGoal = ref(null)
    const contributionAmount = ref(0)

    const currentChamaId = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.current_chama_id || 1
    })

    const form = ref({
      goal_name: '',
      goal_description: '',
      target_amount: 0,
      target_date: '',
      category: ''
    })

    const totalTarget = computed(() => {
      return goals.value.reduce((sum, goal) => sum + parseFloat(goal.target_amount || 0), 0)
    })

    const totalSaved = computed(() => {
      return goals.value.reduce((sum, goal) => sum + parseFloat(goal.current_amount || 0), 0)
    })

    const overallProgress = computed(() => {
      return totalTarget.value > 0 ? Math.round((totalSaved.value / totalTarget.value) * 100) : 0
    })

    const loadGoals = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await financialGoalsApi.getAll(currentChamaId.value)
        goals.value = response.data
      } catch (err) {
        error.value = 'Failed to load goals'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const saveGoal = async () => {
      error.value = ''
      try {
        if (editingGoal.value) {
          await financialGoalsApi.update(currentChamaId.value, editingGoal.value.id, form.value)
        } else {
          await financialGoalsApi.create(currentChamaId.value, form.value)
        }
        closeModal()
        loadGoals()
      } catch (err) {
        error.value = 'Failed to save goal'
        console.error(err)
      }
    }

    const editGoal = (goal) => {
      editingGoal.value = goal
      form.value = { ...goal }
      showCreateModal.value = true
    }

    const deleteGoal = async (id) => {
      if (confirm('Are you sure you want to delete this goal?')) {
        try {
          await financialGoalsApi.delete(currentChamaId.value, id)
          loadGoals()
        } catch (err) {
          error.value = 'Failed to delete goal'
          console.error(err)
        }
      }
    }

    const openContributeModal = (goal) => {
      selectedGoal.value = goal
      contributionAmount.value = 0
      showContributeModal.value = true
    }

    const addContribution = async () => {
      error.value = ''
      try {
        await financialGoalsApi.addProgress(currentChamaId.value, selectedGoal.value.id, {
          amount: contributionAmount.value
        })
        closeContributeModal()
        loadGoals()
      } catch (err) {
        error.value = 'Failed to add contribution'
        console.error(err)
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingGoal.value = null
      form.value = {
        goal_name: '',
        goal_description: '',
        target_amount: 0,
        target_date: '',
        category: ''
      }
    }

    const closeContributeModal = () => {
      showContributeModal.value = false
      selectedGoal.value = null
      contributionAmount.value = 0
    }

    const goalProgress = (goal) => {
      const target = parseFloat(goal.target_amount || 0)
      return target > 0 ? Math.round((parseFloat(goal.current_amount || 0) / target) * 100) : 0
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

    const formatCategory = (category) => {
      return category.charAt(0).toUpperCase() + category.slice(1)
    }

    const formatStatus = (status) => {
      const statuses = {
        active: 'Active',
        achieved: 'Achieved',
        abandoned: 'Abandoned'
      }
      return statuses[status] || status
    }

    onMounted(() => {
      loadGoals()
    })

    return {
      goals,
      loading,
      error,
      showCreateModal,
      showContributeModal,
      editingGoal,
      selectedGoal,
      contributionAmount,
      form,
      totalTarget,
      totalSaved,
      overallProgress,
      saveGoal,
      editGoal,
      deleteGoal,
      openContributeModal,
      addContribution,
      closeModal,
      closeContributeModal,
      goalProgress,
      formatCurrency,
      formatDate,
      formatCategory,
      formatStatus
    }
  }
}
</script>

<style scoped>
.financial-goals-container {
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

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.summary-card .amount {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c5aa0;
}

.summary-card .amount.saved {
  color: #27ae60;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-bar .progress {
  height: 100%;
  background: linear-gradient(90deg, #2c5aa0, #4a7dc4);
  transition: width 0.3s ease;
}

/* Goals List */
.goals-list {
  display: grid;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  color: #ddd;
  display: block;
  margin-bottom: 1rem;
}

.goal-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.goal-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.goal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: #2c5aa0;
  padding: 0.25rem;
  font-size: 1rem;
}

.btn-icon:hover {
  color: #1e4277;
}

.btn-icon.danger {
  color: #e74c3c;
}

.btn-icon.danger:hover {
  color: #c0392b;
}

.goal-description {
  margin: 0.5rem 0 1rem 0;
  color: #666;
  font-size: 0.95rem;
}

.goal-category {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-badge.education {
  background: #e3f2fd;
  color: #1976d2;
}

.category-badge.health {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-badge.investment {
  background: #e8f5e9;
  color: #388e3c;
}

.category-badge.emergency {
  background: #fff3e0;
  color: #f57c00;
}

.category-badge.other {
  background: #f5f5f5;
  color: #666;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #c8e6c9;
  color: #1b5e20;
}

.status-badge.achieved {
  background: #fff9c4;
  color: #f57f17;
}

.status-badge.abandoned {
  background: #ffcdd2;
  color: #b71c1c;
}

.goal-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.progress-info div {
  display: flex;
  flex-direction: column;
}

.progress-info .label {
  color: #999;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.progress-info .value {
  color: #333;
  font-weight: 600;
  font-size: 1.1rem;
}

.goal-date {
  color: #999;
  font-size: 0.9rem;
  margin: 1rem 0;
}

.goal-date i {
  margin-right: 0.5rem;
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

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

/* Forms */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.info-text {
  background: #f0f7ff;
  color: #2c5aa0;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
  font-size: 0.95rem;
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

/* Loading */
.loading {
  text-align: center;
  padding: 3rem;
  color: #999;
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

/* Responsive */
@media (max-width: 768px) {
  .financial-goals-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .progress-info {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
  }
}
</style>
