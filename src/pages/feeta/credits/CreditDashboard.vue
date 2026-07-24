<template>
  <div class="dashboard-main-body">
<div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-24">
      <div><h5 class="mb-4">Credit dashboard</h5><p class="text-secondary-light mb-0">Wallet balances and manual transfer activity.</p></div>
      <div class="d-flex gap-8"><router-link to="/credits/wallets" class="btn btn-primary-600"><iconify-icon icon="ri:wallet-line" class="me-6" /> Wallets</router-link><router-link to="/credits/manual-transfers" class="btn btn-outline-primary-600"><iconify-icon icon="ri:bank-line" class="me-6" /> Manual Transfers</router-link><button class="btn btn-outline-primary-600" :disabled="loading" @click="load"><iconify-icon icon="ri:refresh-line" /></button></div>
    </div>
    <ErrorState v-if="error" :message="error" @retry="load" />
    <template v-else>
      <FinanceStatCards :cards="cards" :loading="loading" />
      <div class="row gy-4 mt-1">
        <div class="col-xl-7">
          <div class="card radius-12 h-100"><div class="card-header bg-base border-bottom"><h6 class="mb-0">Credit utilization</h6></div><div class="card-body"><apexchart height="320" type="bar" :options="chartOptions" :series="chartSeries" /></div></div>
        </div>
        <div class="col-xl-5">
          <div class="card radius-12 h-100"><div class="card-header bg-base border-bottom d-flex justify-content-between"><h6 class="mb-0">Recent wallets</h6><router-link to="/credits/wallets" class="text-primary-600 text-sm">View all</router-link></div>
            <div class="card-body p-0"><LoadingState v-if="loading" message="Loading credit activity..." /><div v-else-if="wallets.length" class="list-group list-group-flush"><router-link v-for="wallet in wallets" :key="wallet.id" :to="`/credits/${wallet.agent_id}/transactions`" class="list-group-item list-group-item-action p-18 d-flex justify-content-between align-items-center"><div><strong>{{ safeValue(wallet.agent?.name) }}</strong><div class="text-secondary-light text-xs mt-3">{{ safeValue(wallet.agent?.email) }}</div></div><div class="text-end"><strong class="text-primary-600">{{ wallet.available_credits }}</strong><div class="text-secondary-light text-xs">available</div></div></router-link></div><EmptyState v-else icon="ri:wallet-line" title="No wallets found" message="Agent wallets will appear here when available." /></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import FinanceStatCards from '@/components/feeta/finance/FinanceStatCards.vue'
import creditService from '@/services/creditService'
import { formatCurrency, safeValue } from '@/utils/finance'
const apexchart=VueApexCharts; const stats=ref({}); const wallets=ref([]); const loading=ref(true); const error=ref('')
const cards=computed(()=>[
{label:'Total Wallets',value:stats.value.total_wallets??stats.value.wallets??0,icon:'ri:wallet-3-line',iconClass:'bg-primary-50 text-primary-600'},
{label:'Total Credits',value:stats.value.total_credits??stats.value.available_credits??0,icon:'ri:coins-line',iconClass:'bg-success-focus text-success-600'},
{label:'Credits Added Today',value:stats.value.credits_added_today??0,icon:'ri:add-circle-line',iconClass:'bg-info-focus text-info-600'},
{label:'Credits Used Today',value:stats.value.credits_used_today??0,icon:'ri:subtract-line',iconClass:'bg-danger-focus text-danger-600'},
{label:'Pending Transfers',value:stats.value.pending_transfers??stats.value.pending_manual_transfers??0,icon:'ri:bank-line',iconClass:'bg-warning-focus text-warning-600',hint:formatCurrency(stats.value.pending_transfer_amount??0)},
{label:'Approved Transfers',value:stats.value.approved_transfers??0,icon:'ri:checkbox-circle-line',iconClass:'bg-success-focus text-success-600'},
{label:'Rejected Transfers',value:stats.value.rejected_transfers??0,icon:'ri:close-circle-line',iconClass:'bg-danger-focus text-danger-600'}])
const chartSeries=computed(()=>[{name:'Credits',data:[stats.value.purchased_credits??0,stats.value.available_credits??0,stats.value.used_credits??0]}])
const chartOptions={chart:{toolbar:{show:false}},colors:['#487fff'],plotOptions:{bar:{borderRadius:7,columnWidth:'38%'}},xaxis:{categories:['Purchased','Available','Used']},dataLabels:{enabled:false}}
async function load(){loading.value=true;error.value='';try{const [summary,list]=await Promise.all([creditService.getStatistics(),creditService.getWallets({per_page:5})]);stats.value=summary;wallets.value=list?.data||list||[]}catch(err){error.value=err.message}finally{loading.value=false}}
onMounted(load)
</script>
