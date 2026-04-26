<template>
  <div class="analytics-dashboard">
    <div class="header-section mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Predictive Analytics</h1>
        <p class="text-gray-600">AI-powered insights and financial projections for your Chama.</p>
      </div>
      <div class="flex gap-2">
        <button @click="fetchData" class="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">Default Risk Assessment</h3>
        <div class="flex items-end gap-2">
          <div class="text-3xl font-black" :class="riskColor">{{ riskData.risk_percentage }}%</div>
          <div class="text-sm font-medium mb-1 capitalize" :class="riskColor">{{ riskData.risk_level }} Risk</div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Based on current repayment trends and credit scores.</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">Churn Prediction</h3>
        <div class="text-3xl font-black text-orange-600">{{ churnData.at_risk_count }}</div>
        <div class="text-sm font-medium text-orange-500">Members at risk</div>
        <p class="text-xs text-gray-500 mt-2">{{ churnData.recommendation }}</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">Community Benchmark</h3>
        <div class="text-3xl font-black text-indigo-600">{{ benchmarkData.percentile }}th</div>
        <div class="text-sm font-medium text-indigo-500">Percentile</div>
        <p class="text-xs text-gray-500 mt-2">Performing better than {{ benchmarkData.percentile }}% of similar Chamas.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Savings Projections -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Savings Projection</h2>
          <select v-model="growthRate" class="text-xs bg-gray-50 border-gray-200 rounded-lg px-2 py-1">
            <option :value="0">0% growth</option>
            <option :value="5">5% growth</option>
            <option :value="10">10% growth</option>
          </select>
        </div>
        <div class="h-48 flex items-end justify-between gap-2 px-2">
          <div v-for="month in projectionData" :key="month.month" class="flex-grow flex flex-col items-center group relative">
            <div 
              class="w-full bg-indigo-500 rounded-t-md transition-all duration-500 group-hover:bg-indigo-600"
              :style="{ height: (month.projected_total / maxProjection * 100) + '%' }"
            >
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {{ formatAmount(month.projected_total) }}
              </div>
            </div>
            <span class="text-[8px] text-gray-400 mt-2">{{ month.month }}</span>
          </div>
        </div>
      </div>

      <!-- Tax & Regulatory Summary -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Tax & Regulatory</h2>
          <button class="text-xs text-indigo-600 font-bold hover:underline">Download Report</button>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-xs text-gray-500 font-bold uppercase">Estimated Tax Liability</p>
              <p class="text-lg font-black text-gray-900">{{ formatCurrency(taxData.total_tax) }}</p>
            </div>
            <div class="text-right">
              <span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">DUE IN 12 DAYS</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 border border-gray-100 rounded-xl">
              <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Withholding Tax</p>
              <p class="font-bold text-gray-700">{{ formatCurrency(taxData.withholding) }}</p>
            </div>
            <div class="p-3 border border-gray-100 rounded-xl">
              <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Corporate Tax</p>
              <p class="font-bold text-gray-700">{{ formatCurrency(taxData.corporate) }}</p>
            </div>
          </div>
          <div class="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
            <i class="fas fa-check-circle text-green-500"></i>
            <p class="text-xs text-green-800 font-medium">Compliance score is 100%. All filings are up to date.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { analyticsApi } from '@/api/adminExtra';

const riskData = ref({ risk_percentage: 0, risk_level: 'low' });
const churnData = ref({ at_risk_count: 0, recommendation: '' });
const benchmarkData = ref({ percentile: 75 });
const projectionData = ref([]);
const taxData = ref({ total_tax: 0, withholding: 0, corporate: 0 });
const growthRate = ref(5);

const currentChamaId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.current_chama_id || 1;
});

const riskColor = computed(() => {
  if (riskData.value.risk_level === 'high') return 'text-red-600';
  if (riskData.value.risk_level === 'medium') return 'text-orange-600';
  return 'text-green-600';
});

const maxProjection = computed(() => {
  if (projectionData.value.length === 0) return 1;
  return Math.max(...projectionData.value.map(m => m.projected_total));
});

const fetchData = async () => {
  try {
    const chamaId = currentChamaId.value;
    const [pRes, sRes, tRes, bRes] = await Promise.all([
      analyticsApi.getPredictive(chamaId),
      analyticsApi.getSavingsProjection(chamaId),
      analyticsApi.getTaxSummary(chamaId),
      analyticsApi.getBenchmarking(chamaId)
    ]);

    riskData.value = pRes.data.data.default_risk || riskData.value;
    churnData.value = pRes.data.data.churn_prediction || churnData.value;
    projectionData.value = sRes.data.data.projections || [];
    taxData.value = tRes.data.data || taxData.value;
    benchmarkData.value = bRes.data.data || benchmarkData.value;
  } catch (err) {
    console.error('Failed to fetch analytics', err);
  }
};

const formatAmount = (val) => {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
  return val;
};

const formatCurrency = (val) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(val || 0);

watch(growthRate, fetchData);
onMounted(fetchData);
</script>
