import { ref, computed } from 'vue'
import { userApi } from '@/api/user'

export const useAuth = () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isSuperAdmin = computed(() => user.value?.roles?.includes('super_admin'))
  const isChamaAdmin = computed(() => user.value?.roles?.includes('admin') && !isSuperAdmin.value)
  const isTreasurer = computed(() => user.value?.roles?.includes('treasurer'))
  const isMember = computed(() => user.value?.roles?.includes('member'))

  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.some(r => user.value?.roles?.includes(r))
    }
    return user.value?.roles?.includes(role)
  }

  const hasPermission = (permission) => {
    if (!user.value) return false
    if (isSuperAdmin.value) return true // Super admin has all permissions
    return user.value?.permissions?.includes(permission)
  }

  const loadUser = async () => {
    loading.value = true
    try {
      const response = await userApi.getProfile()
      user.value = response.data
      error.value = null
    } catch (err) {
      error.value = err.message
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
  }

  return {
    user,
    loading,
    error,
    isSuperAdmin,
    isChamaAdmin,
    isTreasurer,
    isMember,
    hasRole,
    hasPermission,
    loadUser,
    logout
  }
}
