<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Admin Management</h1>
        <p class="page-subtitle">Manage system-wide and chama-level administrators</p>
      </div>
      <button class="btn-primary-custom" @click="openAddUserModal">
        <i class="bi bi-person-plus-fill me-2"></i>Add New Admin
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-shield-lock"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.superAdmins }}</h3>
          <p>Super Admins</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-building-gear"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.chamaAdmins }}</h3>
          <p>Chama Admins</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon bg-info">
          <i class="bi bi-person-check"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.activeUsers }}</h3>
          <p>Active Accounts</p>
        </div>
      </div>
    </div>

    <!-- Filters & Table -->
    <div class="glass-card mt-4">
      <div class="card-header-custom">
        <div class="header-icon">
          <i class="bi bi-people"></i>
        </div>
        <h5 class="mb-0">Administrator Directory</h5>
        <div class="ms-auto d-flex gap-2">
          <div class="search-box-mini">
            <i class="bi bi-search"></i>
            <input v-model="searchQuery" type="text" placeholder="Search admins...">
          </div>
          <button class="btn-icon-custom" @click="fetchUsers">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Admin Name</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Access Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div class="avatar-sm" :style="{ background: getAvatarColor(user.name) }">
                    {{ user.name.charAt(0) }}
                  </div>
                  <span class="fw-bold">{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone_number || user.phone || 'N/A' }}</td>
              <td>
                <span class="role-pill" :class="user.roles?.[0] === 'super-admin' ? 'super' : 'chama'">
                  {{ user.roles?.[0] || 'chama-admin' }}
                </span>
              </td>
              <td>
                <span class="status-indicator" :class="user.is_active ? 'online' : 'offline'">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn-custom edit" @click="editUser(user)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="action-btn-custom delete" @click="deleteUser(user.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">No administrators found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showEditModal" class="modal-backdrop-custom" @click.self="closeModal">
      <div class="modal-content-custom glass-card">
        <div class="modal-header-custom">
          <h5>{{ editingUser?.id ? 'Modify Administrator' : 'Register New Admin' }}</h5>
          <button @click="closeModal" class="btn-close-custom">✕</button>
        </div>
        <div class="modal-body-custom">
          <div class="form-grid-custom">
            <div class="form-group-custom">
              <label>Full Name</label>
              <input v-model="editingUser.name" type="text" placeholder="e.g. John Doe">
            </div>
            <div class="form-group-custom">
              <label>Email Address</label>
              <input v-model="editingUser.email" type="email" placeholder="email@example.com">
            </div>
            <div class="form-group-custom">
              <label>Phone Number</label>
              <input v-model="editingUser.phone_number" type="tel" placeholder="254...">
            </div>
            <div class="form-group-custom">
              <label>Role / Access Level</label>
              <select v-model="editingUser.role">
                <option value="chama-admin">Chama Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>
            <div class="form-group-custom" v-if="!editingUser.id">
              <label>Temporary Password</label>
              <input v-model="editingUser.password" type="password" placeholder="Min 8 characters">
            </div>
            <div class="form-group-custom">
              <label>Account Status</label>
              <select v-model="editingUser.is_active">
                <option :value="true">Active</option>
                <option :value="false">Disabled</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button class="btn-secondary-custom" @click="closeModal">Cancel</button>
          <button class="btn-primary-custom" @click="saveUser">
            {{ editingUser.id ? 'Update Admin' : 'Create Admin' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const users = ref([])
const searchQuery = ref('')
const showEditModal = ref(false)
const loading = ref(false)

const stats = reactive({
  superAdmins: 0,
  chamaAdmins: 0,
  activeUsers: 0
})

const editingUser = ref({
  name: '',
  email: '',
  phone_number: '',
  role: 'chama-admin',
  is_active: true,
  password: ''
})

const filteredUsers = computed(() => {
  const admins = users.value.filter(u => 
    u.roles?.includes('chama-admin') || u.roles?.includes('super-admin')
  )
  if (!searchQuery.value) return admins
  const q = searchQuery.value.toLowerCase()
  return admins.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/users')
    users.value = response.data.data || []
    
    // Update stats
    stats.superAdmins = users.value.filter(u => u.roles?.includes('super-admin')).length
    stats.chamaAdmins = users.value.filter(u => u.roles?.includes('chama-admin')).length
    stats.activeUsers = users.value.filter(u => u.is_active).length
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch user list', 'error')
  } finally {
    loading.value = false
  }
}

const openAddUserModal = () => {
  editingUser.value = { name: '', email: '', phone_number: '', role: 'chama-admin', is_active: true, password: '' }
  showEditModal.value = true
}

const editUser = (user) => {
  editingUser.value = { ...user, role: user.roles?.[0] || 'chama-admin' }
  showEditModal.value = true
}

const saveUser = async () => {
  try {
    if (editingUser.value.id) {
      await api.put(`/admin/users/${editingUser.value.id}`, editingUser.value)
      Swal.fire('Success', 'Admin profile updated', 'success')
    } else {
      await api.post('/admin/users', editingUser.value)
      Swal.fire('Success', 'Admin created successfully', 'success')
    }
    showEditModal.value = false
    fetchUsers()
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Failed to save admin', 'error')
  }
}

const deleteUser = async (id) => {
  const res = await Swal.fire({
    title: 'Are you sure?',
    text: "This will revoke all access for this administrator.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#E53935',
    confirmButtonText: 'Yes, remove them'
  })
  if (res.isConfirmed) {
    try {
      await api.delete(`/admin/users/${id}`)
      Swal.fire('Removed', 'Administrator access revoked', 'success')
      fetchUsers()
    } catch (error) {
      Swal.fire('Error', 'Failed to remove admin', 'error')
    }
  }
}

const getAvatarColor = (name) => {
  const colors = ['#2E7D32', '#1565C0', '#FF8F00', '#D32F2F', '#7B1FA2']
  return colors[name.charCodeAt(0) % colors.length]
}

const closeModal = () => showEditModal.value = false

onMounted(fetchUsers)
</script>

<style scoped>
@import './admin-shared.css';
</style>
