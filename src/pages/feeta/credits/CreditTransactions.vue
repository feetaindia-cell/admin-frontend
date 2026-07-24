<template>
  <div class="dashboard-main-body">
<div class="wallet-banner mb-24"><div><h5 class="mb-4">{{ safeValue(wallet.agent?.name, `Agent #${route.params.agentId}`) }}</h5><p class="text-secondary-light mb-0">{{ safeValue(wallet.agent?.email) }}</p></div><div class="balance"><span>Available credits</span><strong>{{ wallet.available_credits ?? 0 }}</strong></div></div>
    <div class="card radius-12 overflow-hidden">
      <div class="card-header bg-base p-20 border-bottom"><div class="transaction-filters"><select v-model="filters.type" class="form-select"><option value="">All transaction types</option><option v-for="type in types" :key="type" :value="type">{{ titleCase(type) }}</option></select><select v-model="filters.manual_transfer" class="form-select"><option value="">All sources</option><option value="1">Manual transfers</option><option value="0">Admin/system</option></select><input v-model="filters.date_from" type="date" class="form-control" /><input v-model="filters.date_to" type="date" class="form-control" /><button class="btn btn-outline-primary-600" :disabled="loading" @click="load(page)">Refresh</button><button v-if="auth.hasPermission('credit.export')" class="btn btn-primary-600" :disabled="!transactions.length" @click="exportRows">Export</button></div></div>
      <LoadingState v-if="loading" message="Loading credit transactions..." /><div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="load(page)" /></div>
      <div v-else class="card-body p-0"><div v-if="transactions.length" class="table-responsive"><table class="table transaction-table mb-0"><thead><tr><th>ID</th><th>Type</th><th>Credits</th><th>Remarks</th><th>Admin</th><th>Date</th></tr></thead><tbody><tr v-for="item in transactions" :key="item.id"><td>#{{ item.id }}</td><td><StatusBadge :status="item.type" /></td><td :class="Number(item.credits)>=0?'text-success-600':'text-danger-600'" class="fw-bold">{{ Number(item.credits)>=0?'+':'' }}{{ item.credits }}</td><td>{{ safeValue(item.description) }}</td><td>{{ item.created_by ? `#${item.created_by}` : 'System' }}</td><td>{{ formatDate(item.created_at, true) }}</td></tr></tbody></table></div><EmptyState v-else icon="ri:history-line" title="No transactions found" message="No credit transactions match the filters." /><div v-if="transactions.length" class="px-24 pb-24"><Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="load" /></div></div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import Pagination from '@/components/pagination/index.vue'
import creditService from '@/services/creditService'
import { useAuthStore } from '@/stores/auth'
import { downloadCsv, formatDate, safeValue, titleCase } from '@/utils/finance'
const route=useRoute();const auth=useAuthStore();const wallet=ref({});const transactions=ref([]);const loading=ref(false);const error=ref('');const total=ref(0);const page=ref(1);const filters=reactive({type:'',manual_transfer:'',date_from:'',date_to:'',per_page:15});const types=['purchase','deduction','refund','adjustment']
const totalPages=computed(()=>Math.max(1,Math.ceil(total.value/filters.per_page)));const startIndex=computed(()=>total.value?(page.value-1)*filters.per_page:0);const endIndex=computed(()=>Math.min(startIndex.value+transactions.value.length,total.value))
async function load(next=1){loading.value=true;error.value='';page.value=next;try{const [walletData,result]=await Promise.all([creditService.getWallet(route.params.agentId),creditService.getTransactions(route.params.agentId,{...filters,page:next})]);wallet.value=walletData;transactions.value=result?.data||result||[];total.value=result?.meta?.total??transactions.value.length}catch(err){error.value=err.message}finally{loading.value=false}}
function exportRows(){downloadCsv(`agent-${route.params.agentId}-credit-transactions.csv`,[{label:'ID',value:t=>t.id},{label:'Type',value:t=>t.type},{label:'Credits',value:t=>t.credits},{label:'Before',value:t=>t.balance_before},{label:'After',value:t=>t.balance_after},{label:'Remarks',value:t=>t.description},{label:'Date',value:t=>t.created_at}],transactions.value)}
watch(()=>[filters.type,filters.manual_transfer,filters.date_from,filters.date_to],()=>load(1));onMounted(load)
</script>
<style scoped>
.wallet-banner{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:22px;border:1px solid #dce6fa;border-radius:14px;background:linear-gradient(135deg,#fff,#edf4ff)}.balance{text-align:right}.balance span{display:block;color:#64748b;font-size:12px}.balance strong{color:#315ed1;font-size:30px}.transaction-filters{display:flex;flex-wrap:wrap;align-items:center;gap:12px;width:100%}.transaction-table th{padding:14px 17px;color:#64748b;font-size:11px;text-transform:uppercase;background:#f8fafc;white-space:nowrap}.transaction-table td{padding:15px 17px;vertical-align:middle}@media(max-width:575px){.wallet-banner{align-items:flex-start;flex-direction:column}.balance{text-align:left}}
</style>
