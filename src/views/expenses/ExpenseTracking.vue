<template>
  <div class="expense-tracking-container container">
    <div class="header flex-between gap-4 flex-col-mobile">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Expense Tracking</h1>
      <button v-if="userIsAdmin" @click="showCreateModal = true" class="btn btn-primary whitespace-nowrap">
        <i class="fas fa-plus"></i> <span class="hide-mobile">Record Expense</span><span class="show-mobile">Add</span>
      </button>
    </div>

    <!-- Expense Summary -->
    <div class="summary-cards grid grid-cols-1 grid-cols-3-tablet grid-cols-3-desktop gap-4 margin-y-4">
      <div class="summary-card">
        <h3 class="text-sm">This Month</h3>
        <p class="amount text-xl-desktop text-lg-tablet text-base">{{ formatCurrency(stats.thisMonth) }}</p>
        <span :class="['trend', stats.trend > 0 ? 'up' : 'down']">
          <i :class="['fas', stats.trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
          {{ Math.abs(stats.trend) }}% vs last month
        </span>
      </div>
      <div class="summary-card">
        <h3 class="text-sm">Total Year</h3>
        <p class="amount text-xl-desktop text-lg-tablet text-base">{{ formatCurrency(stats.thisYear) }}</p>
      </div>
      <div class="summary-card">
        <h3 class="text-sm">Largest Category</h3>
        <p class="amount category text-lg-desktop text-base-tablet">{{ stats.topCategory }}</p>
        <p class="sub-text text-xs text-gray-600">{{ formatCurrency(stats.topCategoryAmount) }}</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="filters-bar flex flex-col gap-3 gap-2-tablet flex-row-tablet margin-y-4">
      <div class="search-box flex-1">
        <i class="fas fa-search"></i>
        <input v-model="filters.search" type="text" placeholder="Search expenses..." />
      </div>
      <div class="filter-group flex gap-2 flex-wrap">
        <select v-model="filters.category_id" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <select v-model="filters.period" class="filter-select">
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="table-container margin-y-4">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Fetching expenses...</p>
      </div>

      <div v-else-if="expenses.length === 0" class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>No expenses recorded for this period.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="expense-table">
          <thead>
            <tr>
              <th class="text-sm">Date</th>
              <th class="text-sm hide-mobile">Description</th>
              <th class="text-sm hide-tablet">Category</th>
              <th class="text-sm">Amount</th>
              <th class="text-sm show-mobile hide-desktop">Actions</th>
              <th v-if="userIsAdmin" class="text-sm hide-mobile">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filteredExpenses" :key="expense.id">
              <td class="text-sm">{{ formatDate(expense.expense_date) }}</td>
              <td class="desc-cell text-sm hide-mobile">{{ expense.description }}</td>
              <td class="text-sm hide-tablet"><span class="category-tag">{{ expense.category?.name || 'Other' }}</span></td>
              <td class="amount-cell text-sm">{{ formatCurrency(expense.amount) }}</td>
              <td class="show-mobile hide-desktop text-sm">
                <button v-if="expense.receipt_path" @click="viewReceipt(expense)" class="btn-link text-xs">View</button>
              </td>
              <td v-if="userIsAdmin" class="actions-cell hide-mobile">
                <button @click="editExpense(expense)" class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
                <button @click="deleteExpense(expense)" class="btn-icon danger" title="Delete"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="text-lg-desktop text-base-tablet">{{ editingExpense ? 'Edit Expense' : 'Record New Expense' }}</h2>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveExpense">
            <div class="form-group">
              <label>Description *</label>
              <input v-model="form.description" type="text" class="form-control" placeholder="e.g., Office Supplies" required />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Amount (KES) *</label>
                <input v-model.number="form.amount" type="number" class="form-control" step="0.01" min="0" required />
              </div>
              <div class="form-group">
                <label>Date *</label>
                <input v-model="form.expense_date" type="date" class="form-control" required />
              </div>
            </div>

            <div class="form-group">
              <label>Category *</label>
              <select v-model="form.expense_category_id" class="form-control" required>
                <option value="">Select a category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Receipt (Optional)</label>
              <input type="file" @change="handleFileUpload" class="form-control" accept="image/*,application/pdf" />
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Expense' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { expensesApi } from '@/api/expenses'
import Swal from 'sweetalert2'

export default {
  name: 'ExpenseTracking',
  setup() {
    const expenses = ref([])
    const categories = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const showCreateModal = ref(false)
    const editingExpense = ref(null)
    const userIsAdmin = ref(false)
    
    const stats = ref({
      thisMonth: 0,
      thisYear: 0,
      trend: 0,
      topCategory: 'None',
      topCategoryAmount: 0
    })

    const filters = ref({
      search: '',
      category_id: '',
      period: '30'
    })

    const form = ref({
      description: '',
      amount: 0,
      expense_category_id: '',
      expense_date: new Date().toISOString().split('T')[0],
      currency_id: 1, // Default currency
      receipt: null
    })

    const currentChamaId = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.current_chama_id || 1
    })

    const filteredExpenses = computed(() => {
      return expenses.value.filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(filters.value.search.toLowerCase())
        const matchesCat = !filters.value.category_id || e.expense_category_id == filters.value.category_id
        return matchesSearch && matchesCat
      })
    })

    const loadData = async () => {
      loading.value = true
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        userIsAdmin.value = user.roles?.includes('chama-admin') || user.roles?.includes('super-admin')
        
        const [expensesRes, statsRes, categoriesRes] = await Promise.all([
          expensesApi.getAll(currentChamaId.value),
          expensesApi.getStats(currentChamaId.value),
          expensesApi.getCategories(currentChamaId.value)
        ])
        
        expenses.value = expensesRes.data.data || expensesRes.data || []
        stats.value = statsRes.data || stats.value
        categories.value = categoriesRes.data || []
      } catch (err) {
        console.error('Failed to load data', err)
      } finally {
        loading.value = false
      }
    }

    const saveExpense = async () => {
      saving.value = true
      try {
        const formData = new FormData()
        Object.keys(form.value).forEach(key => {
          if (form.value[key] !== null) formData.append(key, form.value[key])
        })

        if (editingExpense.value) {
          await expensesApi.update(currentChamaId.value, editingExpense.value.id, formData)
          Swal.fire('Success', 'Expense updated successfully', 'success')
        } else {
          await expensesApi.create(currentChamaId.value, formData)
          Swal.fire('Success', 'Expense recorded successfully', 'success')
        }
        closeModal()
        loadData()
      } catch (err) {
        console.error('Error saving expense:', err)
        Swal.fire('Error', err.response?.data?.message || 'Failed to save expense', 'error')
      } finally {
        saving.value = false
      }
    }

    const deleteExpense = async (expense) => {
      const result = await Swal.fire({
        title: 'Delete Expense?',
        text: 'Are you sure you want to delete this expense record?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it'
      })

      if (result.isConfirmed) {
        try {
          await expensesApi.delete(currentChamaId.value, expense.id)
          Swal.fire('Deleted!', 'Expense has been deleted.', 'success')
          loadData()
        } catch (err) {
          Swal.fire('Error', 'Failed to delete expense', 'error')
        }
      }
    }

    const editExpense = (expense) => {
      editingExpense.value = expense
      form.value = { 
        description: expense.description,
        amount: expense.amount,
        expense_category_id: expense.expense_category_id,
        expense_date: expense.expense_date,
        currency_id: expense.currency_id || 1,
        receipt: null 
      }
      showCreateModal.value = true
    }

    const handleFileUpload = (event) => {
      form.value.receipt = event.target.files[0]
    }

    const viewReceipt = (expense) => {
      if (expense.receipt_path) {
        window.open(expense.receipt_path, '_blank')
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingExpense.value = null
      form.value = {
        description: '',
        amount: 0,
        expense_category_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        currency_id: 1,
        receipt: null
      }
    }

    const formatCurrency = (val) => {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(val || 0)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    onMounted(loadData)

    return {
      expenses, categories, loading, saving, showCreateModal, editingExpense, userIsAdmin,
      stats, filters, form, filteredExpenses,
      saveExpense, deleteExpense, editExpense, handleFileUpload, closeModal, formatCurrency, formatDate, viewReceipt
    }
  }
}
</script>

<style scoped>
/* styles unchanged */
.expense-tracking-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header h1 { margin: 0; color: #1a202c; }

.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.summary-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.summary-card h3 { margin: 0 0 1rem; font-size: 0.875rem; text-transform: uppercase; color: #718096; letter-spacing: 0.05em; }
.summary-card .amount { font-size: 1.875rem; font-weight: 700; color: #2d3748; margin: 0; }
.summary-card .trend { font-size: 0.875rem; display: flex; align-items: center; gap: 0.25rem; margin-top: 0.5rem; }
.trend.up { color: #e53e3e; } .trend.down { color: #38a169; }

.filters-bar { background: white; padding: 1.25rem; border-radius: 12px; display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.search-box { flex: 1; position: relative; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #a0aec0; }
.search-box input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 8px; }

.filter-group { display: flex; gap: 0.75rem; }
.filter-select { padding: 0.625rem 2rem 0.625rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background-color: white; cursor: pointer; }

.table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.expense-table { width: 100%; border-collapse: collapse; text-align: left; }
.expense-table th { background: #f7fafc; padding: 1rem; font-weight: 600; color: #4a5568; border-bottom: 1px solid #edf2f7; }
.expense-table td { padding: 1rem; border-bottom: 1px solid #edf2f7; color: #2d3748; }
.category-tag { background: #ebf8ff; color: #3182ce; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.amount-cell { font-weight: 600; }

.btn { padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-primary { background: #2c5aa0; color: white; }
.btn-primary:hover { background: #1e4277; }
.btn-secondary { background: #edf2f7; color: #4a5568; }
.btn-icon { background: none; border: none; padding: 0.5rem; cursor: pointer; color: #718096; border-radius: 6px; }
.btn-icon:hover { background: #f7fafc; color: #2c5aa0; }
.btn-icon.danger:hover { color: #e53e3e; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; width: 90%; max-width: 500px; border-radius: 12px; overflow: hidden; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 1.5rem; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #4a5568; }
.form-control { width: 100%; padding: 0.625rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }

.loading { padding: 4rem; text-align: center; }
.empty-state { padding: 4rem; text-align: center; color: #a0aec0; }
.empty-state i { font-size: 3rem; margin-bottom: 1rem; }

@media (max-width: 768px) {
  .filters-bar { flex-direction: column; }
  .form-row { grid-template-columns: 1fr; }
  .expense-table th:nth-child(3), .expense-table td:nth-child(3) { display: none; }
}
</style>
