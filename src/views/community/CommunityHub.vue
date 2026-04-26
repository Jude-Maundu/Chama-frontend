<template>
  <div class="community-hub">
    <div class="header-section mb-6">
      <h1 class="text-2xl font-bold">Community Hub</h1>
      <p class="text-gray-600">Connect, trade, and grow with fellow members.</p>
    </div>

    <div class="tabs mb-6 overflow-x-auto whitespace-nowrap pb-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['px-4 py-2 mr-2 rounded-lg font-medium transition-colors', activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200']"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Marketplace Tab -->
    <div v-if="activeTab === 'marketplace'" class="tab-content">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Marketplace</h2>
        <button @click="openAddModal('marketplace')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">List Item</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="item in marketplaceItems" :key="item.id" class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="h-48 bg-gray-100 flex items-center justify-center border-b border-gray-50">
            <i class="fas fa-shopping-bag text-gray-300 text-4xl"></i>
          </div>
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-lg">{{ item.name }}</h3>
              <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase">{{ item.type }}</span>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ item.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-indigo-600 font-bold text-xl">{{ formatCurrency(item.price) }}</span>
              <span class="text-gray-500 text-xs">Seller: {{ item.user_name || 'Member' }}</span>
            </div>
            <button class="w-full mt-4 bg-indigo-50 border border-indigo-200 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
              Contact Seller
            </button>
          </div>
        </div>
        <div v-if="marketplaceItems.length === 0" class="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p class="text-gray-500">No items listed yet. Be the first!</p>
        </div>
      </div>
    </div>

    <!-- Insurance Tab -->
    <div v-if="activeTab === 'insurance'" class="tab-content">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Insurance Products</h2>
        <button v-if="userIsAdmin" @click="openAddModal('insurance')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add Product</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="product in insuranceProducts" :key="product.id" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-600">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ product.name }}</h3>
              <p class="text-indigo-600 text-sm font-medium">{{ product.provider }}</p>
            </div>
            <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full uppercase font-bold">{{ product.category }}</span>
          </div>
          <p class="text-gray-600 mb-6">{{ product.description }}</p>
          <div class="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4">
            <div>
              <span class="text-xs text-gray-500 block">Premium</span>
              <span class="font-bold">{{ formatCurrency(product.premium_amount) }}/{{ product.premium_period }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">Cover Limit</span>
              <span class="font-bold">{{ formatCurrency(product.cover_amount) }}</span>
            </div>
          </div>
          <button class="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Apply for Cover</button>
        </div>
        <div v-if="insuranceProducts.length === 0" class="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p class="text-gray-500">No insurance products available at the moment.</p>
        </div>
      </div>
    </div>

    <!-- Jobs Tab -->
    <div v-if="activeTab === 'jobs'" class="tab-content">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Job Board</h2>
        <button @click="openAddModal('job')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Post Job</button>
      </div>
      <div class="space-y-4">
        <div v-for="job in jobPostings" :key="job.id" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ job.title }}</h3>
              <p class="text-indigo-600 font-medium">{{ job.company }} • {{ job.location }}</p>
            </div>
            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-bold">{{ job.status || 'Open' }}</span>
          </div>
          <p class="mt-4 text-gray-600 line-clamp-3">{{ job.description }}</p>
          <div class="mt-6 flex justify-between items-center border-top pt-4">
            <div class="flex gap-4 items-center">
              <span class="text-gray-500 text-sm"><i class="fas fa-money-bill-wave mr-1"></i> {{ job.salary_range || 'Contact for details' }}</span>
              <span class="text-gray-400 text-xs">{{ formatDate(job.created_at) }}</span>
            </div>
            <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Apply Now</button>
          </div>
        </div>
        <div v-if="jobPostings.length === 0" class="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p class="text-gray-500">No job openings at the moment. Hire from your community!</p>
        </div>
      </div>
    </div>

    <!-- Showcase Tab -->
    <div v-if="activeTab === 'showcase'" class="tab-content">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Business Showcase</h2>
        <button @click="openAddModal('showcase')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Register Business</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="biz in businessShowcases" :key="biz.id" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6">
          <div class="w-24 h-24 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
             <span class="text-indigo-600 font-bold text-2xl">{{ biz.business_name?.charAt(0) }}</span>
          </div>
          <div class="flex-grow">
            <h3 class="text-xl font-bold text-gray-900">{{ biz.business_name }}</h3>
            <p class="text-sm text-indigo-600 mb-2">{{ biz.industry }}</p>
            <p class="text-gray-600 text-sm mb-4">{{ biz.description }}</p>
            <div class="flex gap-4 border-top pt-3 mt-auto">
              <a :href="biz.website" v-if="biz.website" target="_blank" class="text-indigo-600 text-sm font-medium hover:underline"><i class="fas fa-external-link-alt mr-1"></i> Website</a>
              <span class="text-gray-500 text-sm font-medium"><i class="fas fa-phone-alt mr-1"></i> {{ biz.contact_info }}</span>
            </div>
          </div>
        </div>
        <div v-if="businessShowcases.length === 0" class="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p class="text-gray-500">No businesses registered yet. Support member-owned businesses!</p>
        </div>
      </div>
    </div>

    <!-- Charity Tab -->
    <div v-if="activeTab === 'charity'" class="tab-content">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Charity & CSR</h2>
        <button v-if="userIsAdmin" @click="openAddModal('charity')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">New Cause</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="cause in charityModules" :key="cause.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ cause.title }}</h3>
            <p class="text-gray-600 mb-4">{{ cause.description }}</p>
            <div class="mb-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">Raised: {{ formatCurrency(cause.raised_amount) }}</span>
                <span class="text-indigo-600 font-bold">{{ Math.round(cause.raised_amount / cause.target_amount * 100) }}%</span>
              </div>
              <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-full" :style="{ width: (cause.raised_amount / cause.target_amount * 100) + '%' }"></div>
              </div>
              <span class="text-xs text-gray-400 mt-1 block">Goal: {{ formatCurrency(cause.target_amount) }}</span>
            </div>
            <button class="w-full bg-indigo-50 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors">Donate to Cause</button>
          </div>
        </div>
        <div v-if="charityModules.length === 0" class="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p class="text-gray-500">No active charity causes. Give back to the community!</p>
        </div>
      </div>
    </div>

    <!-- Generic Modal Wrapper -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">New {{ modalTitle }}</h2>
          <button @click="showAddModal = null" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Marketplace Form -->
          <template v-if="showAddModal === 'marketplace'">
            <div class="form-group">
              <label class="block text-sm font-bold text-gray-700 mb-1">Item Name *</label>
              <input v-model="forms.marketplace.name" type="text" class="w-full px-4 py-2 border rounded-xl" required>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="block text-sm font-bold text-gray-700 mb-1">Price (KES) *</label>
                <input v-model.number="forms.marketplace.price" type="number" class="w-full px-4 py-2 border rounded-xl" required>
              </div>
              <div class="form-group">
                <label class="block text-sm font-bold text-gray-700 mb-1">Type *</label>
                <select v-model="forms.marketplace.type" class="w-full px-4 py-2 border rounded-xl">
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="block text-sm font-bold text-gray-700 mb-1">Description *</label>
              <textarea v-model="forms.marketplace.description" rows="3" class="w-full px-4 py-2 border rounded-xl" required></textarea>
            </div>
          </template>

          <!-- Job Form -->
          <template v-if="showAddModal === 'job'">
            <div class="form-group">
              <label class="block text-sm font-bold text-gray-700 mb-1">Job Title *</label>
              <input v-model="forms.job.title" type="text" class="w-full px-4 py-2 border rounded-xl" required>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="block text-sm font-bold text-gray-700 mb-1">Company/Employer *</label>
                <input v-model="forms.job.company" type="text" class="w-full px-4 py-2 border rounded-xl" required>
              </div>
              <div class="form-group">
                <label class="block text-sm font-bold text-gray-700 mb-1">Location *</label>
                <input v-model="forms.job.location" type="text" class="w-full px-4 py-2 border rounded-xl" required>
              </div>
            </div>
            <div class="form-group">
              <label class="block text-sm font-bold text-gray-700 mb-1">Salary Range</label>
              <input v-model="forms.job.salary_range" type="text" class="w-full px-4 py-2 border rounded-xl" placeholder="e.g. 50k - 80k">
            </div>
            <div class="form-group">
              <label class="block text-sm font-bold text-gray-700 mb-1">Description *</label>
              <textarea v-model="forms.job.description" rows="3" class="w-full px-4 py-2 border rounded-xl" required></textarea>
            </div>
          </template>

          <!-- Business Showcase Form -->
          <template v-if="showAddModal === 'showcase'">
            <div class="form-group">
              <label class="block text-sm font-bold text-gray-700 mb-1">Business Name *</label>
              <input v-model="forms.showcase.business_name" type="text" class="w-full px-4 py-2 border rounded-xl" required>
            </div>
            <div class="form-group">
              <label class="block text-sm font-bold text-gray-700 mb-1">Industry *</label>
              <input v-model="forms.showcase.industry" type="text" class="w-full px-4 py-2 border rounded-xl" placeholder="e.g. Retail, Tech, Agriculture" required>
            </div>
            <div class="form-group">
              <label class="block text-sm font-bold text-gray-700 mb-1">Description *</label>
              <textarea v-model="forms.showcase.description" rows="3" class="w-full px-4 py-2 border rounded-xl" required></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="block text-sm font-bold text-gray-700 mb-1">Website</label>
                <input v-model="forms.showcase.website" type="url" class="w-full px-4 py-2 border rounded-xl">
              </div>
              <div class="form-group">
                <label class="block text-sm font-bold text-gray-700 mb-1">Contact Info *</label>
                <input v-model="forms.showcase.contact_info" type="text" class="w-full px-4 py-2 border rounded-xl" required>
              </div>
            </div>
          </template>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="showAddModal = null" class="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Submit Entry' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { communityApi } from '@/api/community';

const activeTab = ref('marketplace');
const tabs = [
  { id: 'marketplace', name: 'Marketplace' },
  { id: 'insurance', name: 'Insurance' },
  { id: 'jobs', name: 'Job Board' },
  { id: 'showcase', name: 'Businesses' },
  { id: 'charity', name: 'Charity' }
];

const marketplaceItems = ref([]);
const insuranceProducts = ref([]);
const jobPostings = ref([]);
const businessShowcases = ref([]);
const charityModules = ref([]);

const showAddModal = ref(null);
const userIsAdmin = ref(false);
const submitting = ref(false);

const forms = reactive({
  marketplace: { name: '', price: 0, type: 'product', description: '' },
  job: { title: '', company: '', location: '', salary_range: '', description: '' },
  showcase: { business_name: '', industry: '', description: '', website: '', contact_info: '' }
});

const currentChamaId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.current_chama_id || 1;
});

const modalTitle = computed(() => {
  const tab = tabs.find(t => t.id === showAddModal.value);
  return tab ? tab.name : '';
});

const fetchData = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userIsAdmin.value = user.roles?.includes('chama-admin') || user.roles?.includes('super-admin');

    const [mRes, iRes, jRes, bRes, cRes] = await Promise.all([
      communityApi.getMarketplace(currentChamaId.value),
      communityApi.getInsurance(currentChamaId.value),
      communityApi.getJobs(currentChamaId.value),
      communityApi.getBusinessShowcases(currentChamaId.value),
      communityApi.getCharity(currentChamaId.value)
    ]);
    
    marketplaceItems.value = mRes.data.data || [];
    insuranceProducts.value = iRes.data.data || [];
    jobPostings.value = jRes.data.data || [];
    businessShowcases.value = bRes.data.data || [];
    charityModules.value = cRes.data.data || [];
  } catch (err) {
    console.error('Failed to fetch community data', err);
  }
};

const openAddModal = (type) => {
  showAddModal.value = type;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const chamaId = currentChamaId.value;
    if (showAddModal.value === 'marketplace') {
      await communityApi.storeMarketplaceItem(chamaId, forms.marketplace);
    } else if (showAddModal.value === 'job') {
      await communityApi.storeJobPosting(chamaId, forms.job);
    } else if (showAddModal.value === 'showcase') {
      await communityApi.storeBusinessShowcase(chamaId, forms.showcase);
    }
    
    showAddModal.value = null;
    alert('Entry saved successfully!');
    fetchData();
  } catch (err) {
    alert('Failed to save entry');
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(val || 0);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

onMounted(fetchData);
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.border-top { border-top: 1px solid #f3f4f6; }
</style>
