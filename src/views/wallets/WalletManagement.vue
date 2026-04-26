<template>
  <div class="wallet-container container">
    <div class="header flex-between gap-4 flex-col-mobile">
      <h1 class="text-2xl-desktop text-xl-tablet text-lg-mobile">Wallet Management</h1>
      <button @click="showCreateWalletModal = true" class="btn btn-primary">
        <i class="fas fa-wallet"></i> <span class="hide-mobile">New Wallet</span><span class="show-mobile">Add</span>
      </button>
    </div>

    <!-- Wallets Overview -->
    <div class="wallets-overview grid grid-cols-1 grid-cols-3-tablet grid-cols-3-desktop gap-4 margin-y-4">
      <div class="overview-card total">
        <h3 class="text-sm">Total Balance</h3>
        <p class="amount text-xl-desktop text-lg-tablet text-base">{{ formatCurrency(totalBalance) }}</p>
      </div>

      <div class="overview-card">
        <h3 class="text-sm">Active Wallets</h3>
        <p class="amount text-xl-desktop text-lg-tablet text-base">{{ wallets.length }}</p>
      </div>

      <div class="overview-card">
        <h3 class="text-sm">Recent Transfers</h3>
        <p class="amount text-xl-desktop text-lg-tablet text-base">{{ recentTransfers.length }}</p>
      </div>
    </div>

    <!-- Wallets Grid -->
    <div class="wallets-grid grid grid-auto-fit gap-4 margin-y-6">
      <div v-if="wallets.length === 0" class="empty-state col-span-full">
        <i class="fas fa-wallet"></i>
        <p>No wallets yet. Create your first wallet to get started!</p>
      </div>

      <div v-for="wallet in wallets" :key="wallet.id" class="wallet-card">
        <div class="wallet-header flex-between">
          <div>
            <h3 class="text-base-mobile text-lg-tablet text-lg-desktop">{{ wallet.wallet_name }}</h3>
            <p class="wallet-type text-sm text-gray-600">{{ formatWalletType(wallet.wallet_type) }}</p>
          </div>
          <div class="wallet-actions flex gap-2">
            <button @click="editWallet(wallet)" class="btn-icon" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteWallet(wallet.id)" class="btn-icon danger" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="wallet-balance">
          <span class="label">Current Balance</span>
          <span class="amount">{{ formatCurrency(wallet.balance) }}</span>
        </div>

        <p class="wallet-description">{{ wallet.description }}</p>

        <div class="wallet-meta">
          <span class="meta-item">
            <i class="fas fa-calendar"></i>
            Created {{ formatDate(wallet.created_at) }}
          </span>
          <span :class="['status-badge', wallet.status]">
            {{ formatStatus(wallet.status) }}
          </span>
        </div>

        <div class="wallet-actions-buttons">
          <button @click="openTransferModal(wallet)" class="btn btn-sm btn-primary">
            <i class="fas fa-exchange-alt"></i> Transfer
          </button>
          <button @click="openViewTransfersModal(wallet)" class="btn btn-sm btn-secondary">
            <i class="fas fa-history"></i> History
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Transfers -->
    <div class="transfers-section">
      <h2>Recent Transfers</h2>

      <div v-if="recentTransfers.length === 0" class="empty-state">
        <p>No transfers yet</p>
      </div>

      <div v-for="transfer in recentTransfers.slice(0, 10)" :key="transfer.id" class="transfer-item">
        <div class="transfer-info">
          <div class="transfer-header">
            <span class="transfer-type" :class="transfer.transfer_type">
              {{ transfer.transfer_type === 'incoming' ? 'Received' : 'Sent' }}
            </span>
            <span class="transfer-date">{{ formatDate(transfer.created_at) }}</span>
          </div>
          <p class="transfer-description">
            {{ transfer.description }}
          </p>
        </div>

        <div class="transfer-amount" :class="transfer.transfer_type">
          {{ transfer.transfer_type === 'incoming' ? '+' : '-' }}{{ formatCurrency(transfer.amount) }}
        </div>
      </div>
    </div>

    <!-- Create/Edit Wallet Modal -->
    <div v-if="showCreateWalletModal" class="modal-overlay" @click="closeCreateWalletModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingWallet ? 'Edit Wallet' : 'Create New Wallet' }}</h2>
          <button @click="closeCreateWalletModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveWallet">
            <div class="form-group">
              <label>Wallet Name *</label>
              <input
                v-model="walletForm.wallet_name"
                type="text"
                class="form-control"
                placeholder="e.g., Group Savings"
                required
              />
            </div>

            <div class="form-group">
              <label>Wallet Type *</label>
              <select v-model="walletForm.wallet_type" class="form-control" required>
                <option value="">Select Type</option>
                <option value="savings">Savings</option>
                <option value="investment">Investment</option>
                <option value="emergency">Emergency Fund</option>
                <option value="project">Project Fund</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="walletForm.description"
                class="form-control"
                placeholder="What is this wallet for?"
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeCreateWalletModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingWallet ? 'Update' : 'Create' }} Wallet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div v-if="showTransferModal" class="modal-overlay" @click="closeTransferModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Transfer from {{ selectedWallet?.wallet_name }}</h2>
          <button @click="closeTransferModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitTransfer">
            <div class="form-group">
              <label>Recipient Wallet *</label>
              <select v-model="transferForm.recipient_wallet_id" class="form-control" required>
                <option value="">Select Recipient</option>
                <option
                  v-for="wallet in availableRecipients"
                  :key="wallet.id"
                  :value="wallet.id"
                >
                  {{ wallet.wallet_name }} ({{ formatCurrency(wallet.balance) }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Transfer Amount *</label>
              <input
                v-model.number="transferForm.amount"
                type="number"
                class="form-control"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
              <small>Available: {{ formatCurrency(selectedWallet?.balance) }}</small>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="transferForm.description"
                class="form-control"
                placeholder="Purpose of transfer"
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeTransferModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Transfer Funds
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Transfers Modal -->
    <div v-if="showTransfersModal" class="modal-overlay" @click="closeTransfersModal">
      <div class="modal large" @click.stop>
        <div class="modal-header">
          <h2>Transfer History - {{ selectedWallet?.wallet_name }}</h2>
          <button @click="closeTransfersModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div v-if="selectedWalletTransfers.length === 0" class="empty-state">
            <p>No transfers for this wallet</p>
          </div>

          <div v-for="transfer in selectedWalletTransfers" :key="transfer.id" class="transfer-item-large">
            <div class="transfer-info">
              <span class="transfer-type" :class="transfer.transfer_type">
                {{ transfer.transfer_type === 'incoming' ? 'Received' : 'Sent' }}
              </span>
              <span class="transfer-date">{{ formatDate(transfer.created_at) }}</span>
            </div>
            <p class="transfer-description">{{ transfer.description }}</p>
            <div class="transfer-amount" :class="transfer.transfer_type">
              {{ transfer.transfer_type === 'incoming' ? '+' : '-' }}{{ formatCurrency(transfer.amount) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading/Error States -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading wallets...</p>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { walletsApi } from '@/api/wallets'

export default {
  name: 'WalletManagement',
  setup() {
    const wallets = ref([])
    const recentTransfers = ref([])
    const loading = ref(false)
    const error = ref('')
    const successMessage = ref('')
    const showCreateWalletModal = ref(false)
    const showTransferModal = ref(false)
    const showTransfersModal = ref(false)
    const editingWallet = ref(null)
    const selectedWallet = ref(null)
    const selectedWalletTransfers = ref([])

    const currentChamaId = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || "{}")
      return user.current_chama_id || 1
    })

    const walletForm = ref({
      wallet_name: '',
      wallet_type: '',
      description: ''
    })

    const transferForm = ref({
      recipient_wallet_id: '',
      amount: 0,
      description: ''
    })

    const totalBalance = computed(() => {
      return wallets.value.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0)
    })

    const availableRecipients = computed(() => {
      return wallets.value.filter(w => w.id !== selectedWallet.value?.id)
    })

    const loadWallets = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await walletsApi.getAll(currentChamaId.value)
        wallets.value = response.data
        loadRecentTransfers()
      } catch (err) {
        error.value = 'Failed to load wallets'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const loadRecentTransfers = async () => {
      try {
        // Get transfers from first wallet if available
        if (wallets.value.length > 0) {
          const response = await walletsApi.getTransfers(currentChamaId.value, wallets.value[0].id)
          recentTransfers.value = response.data || []
        }
      } catch (err) {
        console.error('Failed to load transfers', err)
      }
    }

    const saveWallet = async () => {
      error.value = ''
      try {
        if (editingWallet.value) {
          await walletsApi.update(currentChamaId.value, editingWallet.value.id, walletForm.value)
          successMessage.value = 'Wallet updated successfully!'
        } else {
          await walletsApi.create(currentChamaId.value, walletForm.value)
          successMessage.value = 'Wallet created successfully!'
        }
        setTimeout(() => successMessage.value = '', 3000)
        closeCreateWalletModal()
        loadWallets()
      } catch (err) {
        error.value = 'Failed to save wallet'
        console.error(err)
      }
    }

    const editWallet = (wallet) => {
      editingWallet.value = wallet
      walletForm.value = { ...wallet }
      showCreateWalletModal.value = true
    }

    const deleteWallet = async (id) => {
      if (confirm('Are you sure you want to delete this wallet?')) {
        try {
          await walletsApi.delete(currentChamaId.value, id)
          successMessage.value = 'Wallet deleted successfully!'
          setTimeout(() => successMessage.value = '', 3000)
          loadWallets()
        } catch (err) {
          error.value = 'Failed to delete wallet'
          console.error(err)
        }
      }
    }

    const openTransferModal = (wallet) => {
      selectedWallet.value = wallet
      transferForm.value = {
        recipient_wallet_id: '',
        amount: 0,
        description: ''
      }
      showTransferModal.value = true
    }

    const submitTransfer = async () => {
      error.value = ''
      try {
        await walletsApi.transfer(currentChamaId.value, {
          from_wallet_id: selectedWallet.value.id,
          ...transferForm.value
        })
        successMessage.value = 'Transfer completed successfully!'
        setTimeout(() => successMessage.value = '', 3000)
        closeTransferModal()
        loadWallets()
      } catch (err) {
        error.value = 'Failed to complete transfer'
        console.error(err)
      }
    }

    const openViewTransfersModal = async (wallet) => {
      selectedWallet.value = wallet
      try {
        const response = await walletsApi.getTransfers(currentChamaId.value, wallet.id)
        selectedWalletTransfers.value = response.data || []
      } catch (err) {
        error.value = 'Failed to load transfer history'
        console.error(err)
      }
      showTransfersModal.value = true
    }

    const closeCreateWalletModal = () => {
      showCreateWalletModal.value = false
      editingWallet.value = null
      walletForm.value = {
        wallet_name: '',
        wallet_type: '',
        description: ''
      }
    }

    const closeTransferModal = () => {
      showTransferModal.value = false
      selectedWallet.value = null
      transferForm.value = {
        recipient_wallet_id: '',
        amount: 0,
        description: ''
      }
    }

    const closeTransfersModal = () => {
      showTransfersModal.value = false
      selectedWallet.value = null
      selectedWalletTransfers.value = []
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatWalletType = (type) => {
      const types = {
        savings: 'Savings Wallet',
        investment: 'Investment Wallet',
        emergency: 'Emergency Fund',
        project: 'Project Fund',
        other: 'Other'
      }
      return types[type] || type
    }

    const formatStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }

    onMounted(() => {
      loadWallets()
    })

    return {
      wallets,
      recentTransfers,
      loading,
      error,
      successMessage,
      showCreateWalletModal,
      showTransferModal,
      showTransfersModal,
      editingWallet,
      selectedWallet,
      selectedWalletTransfers,
      walletForm,
      transferForm,
      totalBalance,
      availableRecipients,
      saveWallet,
      editWallet,
      deleteWallet,
      openTransferModal,
      submitTransfer,
      openViewTransfersModal,
      closeCreateWalletModal,
      closeTransferModal,
      closeTransfersModal,
      formatCurrency,
      formatDate,
      formatWalletType,
      formatStatus
    }
  }
}
</script>

<style scoped>
.wallet-container {
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

/* Overview */
.wallets-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e0e0e0;
}

.overview-card.total {
  border-left-color: #2c5aa0;
  background: linear-gradient(135deg, #f8fbff 0%, #e8f2ff 100%);
}

.overview-card h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.overview-card .amount {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c5aa0;
}

/* Wallets Grid */
.wallets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.empty-state {
  grid-column: 1 / -1;
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

.wallet-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.wallet-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.wallet-header h3 {
  margin: 0;
  color: #333;
}

.wallet-type {
  margin: 0.25rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

.wallet-actions {
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

.wallet-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.wallet-balance .label {
  color: #666;
  font-size: 0.9rem;
}

.wallet-balance .amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #27ae60;
}

.wallet-description {
  margin: 0.75rem 0;
  color: #666;
  font-size: 0.95rem;
}

.wallet-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.active {
  background: #c8e6c9;
  color: #1b5e20;
}

.status-badge.inactive {
  background: #f3e5f5;
  color: #4a148c;
}

.wallet-actions-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Transfers Section */
.transfers-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transfers-section h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.75rem;
}

.transfer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.transfer-item:last-child {
  border-bottom: none;
}

.transfer-info {
  flex: 1;
}

.transfer-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.35rem;
}

.transfer-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #e3f2fd;
  color: #1976d2;
}

.transfer-type.incoming {
  background: #c8e6c9;
  color: #1b5e20;
}

.transfer-type.outgoing {
  background: #ffccbc;
  color: #bf360c;
}

.transfer-date {
  color: #999;
  font-size: 0.85rem;
}

.transfer-description {
  margin: 0.35rem 0 0 0;
  color: #666;
  font-size: 0.95rem;
}

.transfer-amount {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c5aa0;
}

.transfer-amount.incoming {
  color: #27ae60;
}

.transfer-amount.outgoing {
  color: #e74c3c;
}

.transfer-item-large {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transfer-item-large:last-child {
  border-bottom: none;
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

.modal.large {
  max-width: 700px;
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

.form-group small {
  display: block;
  margin-top: 0.35rem;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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

@media (max-width: 768px) {
  .wallet-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .wallets-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
  }
}
</style>
