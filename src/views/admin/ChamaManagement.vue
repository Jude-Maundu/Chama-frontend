<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Chama Management</h1>
        <p class="page-subtitle">Oversee all Chama groups and their administrative settings</p>
      </div>
      <button class="btn-primary-custom" @click="openAddChamaModal">
        <i class="bi bi-plus-circle-fill me-2"></i>Create New Chama
      </button>
    </div>

    <!-- Chama Stats -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-diagram-3"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.totalChamas }}</h3>
          <p>Total Chamas</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon bg-info">
          <i class="bi bi-people"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.totalMembers }}</h3>
          <p>Total Members</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon bg-warning">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-info">
          <h3>KES {{ formatCurrency(stats.totalCapital) }}</h3>
          <p>Global Capital</p>
        </div>
      </div>
    </div>

    <!-- Chama List -->
    <div class="glass-card mt-4">
      <div class="card-header-custom">
        <div class="header-icon">
          <i class="bi bi-grid-3x3-gap"></i>
        </div>
        <h5 class="mb-0">Registered Chamas</h5>
        <div class="ms-auto search-box-mini">
          <i class="bi bi-search"></i>
          <input v-model="searchQuery" type="text" placeholder="Search chamas...">
        </div>
      </div>

      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Chama Name</th>
              <th>Administrator</th>
              <th>Members</th>
              <th>Contributions</th>
              <th>Founded</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="chama in filteredChamas" :key="chama.id">
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div class="chama-logo-sm">
                    {{ chama.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="fw-bold">{{ chama.name }}</div>
                    <small class="text-muted">ID: {{ chama.id }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="admin-chip">
                  <i class="bi bi-person-badge"></i>
                  {{ chama.admin_name || 'No Admin' }}
                </div>
              </td>
              <td>
                <span class="member-count">
                  <i class="bi bi-people-fill me-1"></i>
                  {{ chama.members_count || 0 }}
                </span>
              </td>
              <td class="fw-bold text-success">
                KES {{ formatCurrency(chama.total_contributions || 0) }}
              </td>
              <td>{{ formatDate(chama.created_at) }}</td>
              <td>
                <span class="status-badge-custom" :class="chama.status || 'active'">
                  {{ chama.status || 'active' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn-custom edit" @click="editChama(chama)" title="Edit Settings">
                    <i class="bi bi-gear-fill"></i>
                  </button>
                  <button class="action-btn-custom delete" @click="deleteChama(chama.id)" title="Delete Chama">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredChamas.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">No Chama groups found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showEditModal" class="modal-backdrop-custom" @click.self="closeModal">
      <div class="modal-content-custom glass-card">
        <div class="modal-header-custom">
          <h5>{{ editingChama?.id ? 'Edit Chama Settings' : 'Create New Chama Group' }}</h5>
          <button @click="closeModal" class="btn-close-custom">✕</button>
        </div>
        <div class="modal-body-custom">
          <div class="form-grid-custom single-col">
            <div class="form-group-custom">
              <label>Chama Name</label>
              <input v-model="editingChama.name" type="text" placeholder="e.g. Umoja Success Group">
            </div>
            <div class="form-group-custom">
              <label>Description</label>
              <textarea v-model="editingChama.description" rows="3" placeholder="Brief purpose of the group"></textarea>
            </div>
            <div class="form-group-custom" v-if="!editingChama.id">
              <label>Assign Primary Administrator</label>
              <select v-model="editingChama.admin_id">
                <option value="">Select an administrator</option>
                <option v-for="user in adminUsers" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
            </div>
            <div class="form-group-custom" v-else>
              <label>Chama Status</label>
              <select v-model="editingChama.status">
                <option value="active">Active / Operational</option>
                <option value="suspended">Suspended / Frozen</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button class="btn-secondary-custom" @click="closeModal">Cancel</button>
          <button class="btn-primary-custom" @click="saveChama">
            {{ editingChama.id ? 'Save Changes' : 'Launch Chama' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import api from '@/api/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

const chamas = ref([])
const adminUsers = ref([])
const searchQuery = ref('')
const showEditModal = ref(false)
const loading = ref(false)

const stats = reactive({
  totalChamas: 0,
  totalMembers: 0,
  totalCapital: 0
})

const editingChama = ref({
  name: '',
  description: '',
  admin_id: '',
  status: 'active'
})

const filteredChamas = computed(() => {
  if (!searchQuery.value) return chamas.value
  const q = searchQuery.value.toLowerCase()
  return chamas.value.filter(c => c.name.toLowerCase().includes(q))
})

const formatCurrency = (val) => Number(val || 0).toLocaleString()
const formatDate = (date) => dayjs(date).format('MMM DD, YYYY')

const fetchChamas = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/chamas')
    chamas.value = response.data.data || []
    
    // Update stats
    stats.totalChamas = chamas.value.length
    stats.totalMembers = chamas.value.reduce((s, c) => s + (c.members_count || 0), 0)
    stats.totalCapital = chamas.value.reduce((s, c) => s + (c.total_contributions || 0), 0)
  } catch (error) {
    Swal.fire('Error', 'Failed to load chamas', 'error')
  } finally {
    loading.value = false
  }
}

const fetchPotentialAdmins = async () => {
  try {
    const response = await api.get('/admin/users')
    adminUsers.value = response.data.data || []
  } catch (e) {}
}

const openAddChamaModal = () => {
  editingChama.value = { name: '', description: '', admin_id: '', status: 'active' }
  showEditModal.value = true
}

const editChama = (chama) => {
  editingChama.value = { ...chama }
  showEditModal.value = true
}

const saveChama = async () => {
  try {
    if (editingChama.value.id) {
      await api.put(`/admin/chamas/${editingChama.value.id}`, editingChama.value)
      Swal.fire('Updated', 'Chama settings saved', 'success')
    } else {
      if (!editingChama.value.admin_id) return Swal.fire('Error', 'Administrator is required', 'error')
      await api.post('/admin/chamas', editingChama.value)
      Swal.fire('Success', 'Chama successfully established', 'success')
    }
    showEditModal.value = false
    fetchChamas()
  } catch (error) {
    Swal.fire('Error', 'Action failed', 'error')
  }
}

const deleteChama = async (id) => {
  const res = await Swal.fire({
    title: 'Delete Chama?',
    text: "This will permanently remove the group and its data.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Delete Permanently'
  })
  if (res.isConfirmed) {
    await api.delete(`/admin/chamas/${id}`)
    Swal.fire('Deleted', 'Chama group removed', 'success')
    fetchChamas()
  }
}

const closeModal = () => showEditModal.value = false

onMounted(() => {
  fetchChamas()
  fetchPotentialAdmins()
})
</script>

<style scoped>
@import './admin-shared.css';

.chama-logo-sm {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.admin-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.member-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.status-badge-custom {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge-custom.active { background: rgba(46, 125, 50, 0.1); color: #2E7D32; }
.status-badge-custom.suspended { background: rgba(255, 143, 0, 0.1); color: #FF8F00; }

.form-grid-custom.single-col {
  grid-template-columns: 1fr;
}

textarea {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  width: 100%;
}
</style>
