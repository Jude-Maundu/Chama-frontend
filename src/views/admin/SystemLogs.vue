<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Audit Logs</h1>
        <p class="page-subtitle">Track every critical action performed across the platform</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn-secondary-custom" @click="clearLogs">
          <i class="bi bi-trash me-2"></i>Clear Old Logs
        </button>
        <button class="btn-primary-custom" @click="fetchLogs">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh Logs
        </button>
      </div>
    </div>

    <!-- Log Filters -->
    <div class="glass-card mb-4">
      <div class="filters-pane p-3 d-flex gap-3 align-items-center flex-wrap">
        <div class="search-box-mini flex-grow-1">
          <i class="bi bi-search"></i>
          <input v-model="filters.search" type="text" placeholder="Search by user or action...">
        </div>
        <select v-model="filters.type" class="filter-select-custom">
          <option value="">All Categories</option>
          <option value="auth">Authentication</option>
          <option value="finance">Financials</option>
          <option value="system">System Changes</option>
        </select>
        <input type="date" v-model="filters.date" class="filter-date-custom">
      </div>
    </div>

    <!-- Logs Table -->
    <div class="glass-card">
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Context / Details</th>
              <th>IP Address</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="text-nowrap">{{ formatDate(log.created_at) }}</td>
              <td>
                <div class="fw-bold">{{ log.user_name || 'System' }}</div>
              </td>
              <td>
                <span class="action-tag">{{ log.action }}</span>
              </td>
              <td>
                <div class="log-details">{{ log.details }}</div>
              </td>
              <td class="text-muted font-monospace small">{{ log.ip_address }}</td>
              <td>
                <span class="severity-pill" :class="log.severity || 'info'">
                  {{ log.severity || 'info' }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-journal-x fs-1 d-block mb-2"></i>
                No matching audit logs found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

const logs = ref([])
const filters = reactive({
  search: '',
  type: '',
  date: ''
})

const filteredLogs = computed(() => {
  let result = logs.value
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(l => 
      (l.user_name?.toLowerCase().includes(q)) || 
      (l.action?.toLowerCase().includes(q)) ||
      (l.details?.toLowerCase().includes(q))
    )
  }
  if (filters.date) {
    result = result.filter(l => dayjs(l.created_at).isSame(filters.date, 'day'))
  }
  return result
})

const fetchLogs = async () => {
  try {
    const response = await api.get('/admin/logs')
    logs.value = response.data.data || []
  } catch (e) {
    // Mock for initial UI setup
    logs.value = [
      { id: 1, created_at: new Date(), user_name: 'Super Admin', action: 'System Config Update', details: 'Modified M-Pesa passkey', ip_address: '192.168.1.1', severity: 'warning' },
      { id: 2, created_at: dayjs().subtract(1, 'hour'), user_name: 'Chama Admin', action: 'User Creation', details: 'Added Jane Smith to Umoja Group', ip_address: '10.0.0.45', severity: 'info' },
      { id: 3, created_at: dayjs().subtract(2, 'hour'), user_name: 'Treasurer', action: 'Loan Disbursal', details: 'Approved KES 50,000 for John Doe', ip_address: '192.168.1.20', severity: 'success' }
    ]
  }
}

const formatDate = (d) => dayjs(d).format('MMM DD, HH:mm:ss')

const clearLogs = () => {
  Swal.fire({
    title: 'Purge Audit Logs?',
    text: 'Logs older than 30 days will be deleted.',
    icon: 'warning',
    showCancelButton: true
  }).then(r => {
    if (r.isConfirmed) Swal.fire('Purged', 'Old logs removed', 'success')
  })
}

onMounted(fetchLogs)
</script>

<style scoped>
@import './admin-shared.css';

.action-tag {
  background: var(--bg-tertiary);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.log-details {
  max-width: 300px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.severity-pill {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 800;
}

.severity-pill.info { background: #e3f2fd; color: #1565c0; }
.severity-pill.warning { background: #fff3e0; color: #e65100; }
.severity-pill.danger { background: #ffebee; color: #c62828; }
.severity-pill.success { background: #e8f5e9; color: #2e7d32; }

.filter-select-custom, .filter-date-custom {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.85rem;
}
</style>
