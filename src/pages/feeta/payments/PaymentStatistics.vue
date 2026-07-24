<template>
  <div class="dashboard-main-body">
<div class="d-flex justify-content-between align-items-center mb-24"><div><h5 class="mb-4">Payment performance</h5><p class="text-secondary-light mb-0">Current payment and invoice totals.</p></div><button class="btn btn-outline-primary-600" :disabled="loading" @click="load"><iconify-icon icon="ri:refresh-line" class="me-6" /> Refresh</button></div>
    <ErrorState v-if="error" :message="error" @retry="load" />
    <template v-else>
      <FinanceStatCards :cards="cards" :loading="loading" />
      <div class="row gy-4 mt-1">
        <div class="col-xl-8"><div class="card radius-12 h-100"><div class="card-header bg-base border-bottom"><h6 class="mb-0">Payment status distribution</h6></div><div class="card-body"><apexchart height="330" type="bar" :options="barOptions" :series="barSeries" /></div></div></div>
        <div class="col-xl-4"><div class="card radius-12 h-100"><div class="card-header bg-base border-bottom"><h6 class="mb-0">Invoice readiness</h6></div><div class="card-body d-flex align-items-center"><apexchart width="100%" height="300" type="donut" :options="donutOptions" :series="donutSeries" /></div></div></div>
      </div>
      <div class="alert alert-info mt-24 mb-0"><iconify-icon icon="ri:information-line" class="me-6" /> Monthly revenue requires a monthly-series backend field. The current chart uses only statistics returned by the existing API.</div>
    </template>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import ErrorState from '@/components/common/ErrorState.vue'
import FinanceStatCards from '@/components/feeta/finance/FinanceStatCards.vue'
import paymentService from '@/services/paymentService'
import { formatCurrency } from '@/utils/finance'
const apexchart=VueApexCharts; const stats=ref({}); const loading=ref(true); const error=ref('')
const cards=computed(()=>[
{label:'Total Payments',value:stats.value.total_payments??0,icon:'ri:bank-card-line',iconClass:'bg-primary-50 text-primary-600'},
{label:'Successful',value:stats.value.successful_payments??0,icon:'ri:secure-payment-line',iconClass:'bg-success-focus text-success-600'},
{label:'Failed',value:stats.value.failed_payments??0,icon:'ri:close-circle-line',iconClass:'bg-danger-focus text-danger-600'},
{label:'Total Revenue',value:formatCurrency(stats.value.successful_amount??0),icon:'ri:money-dollar-circle-line',iconClass:'bg-info-focus text-info-600'},
{label:'Pending Payments',value:stats.value.pending_payments??0,icon:'ri:time-line',iconClass:'bg-warning-focus text-warning-600'},
{label:'Refunded',value:stats.value.refunded_payments??0,icon:'ri:refund-2-line',iconClass:'bg-neutral-100 text-neutral-600'},
{label:'Invoices Pending',value:stats.value.invoice_pending??0,icon:'ri:file-warning-line',iconClass:'bg-warning-focus text-warning-600'},
{label:'Invoices Generated',value:Math.max(0,(stats.value.successful_payments??0)-(stats.value.invoice_pending??0)),icon:'ri:file-list-3-line',iconClass:'bg-success-focus text-success-600'}])
const barSeries=computed(()=>[{name:'Payments',data:[stats.value.successful_payments??0,stats.value.pending_payments??0,stats.value.failed_payments??0,stats.value.refunded_payments??0]}])
const barOptions={chart:{toolbar:{show:false}},colors:['#487fff'],plotOptions:{bar:{borderRadius:7,columnWidth:'42%'}},xaxis:{categories:['Successful','Pending','Failed','Refunded']},dataLabels:{enabled:false}}
const donutSeries=computed(()=>[Math.max(0,(stats.value.successful_payments??0)-(stats.value.invoice_pending??0)),stats.value.invoice_pending??0])
const donutOptions={labels:['Generated / Complete','Pending'],colors:['#45b369','#ff9f29'],legend:{position:'bottom'},dataLabels:{enabled:false}}
async function load(){loading.value=true;error.value='';try{stats.value=await paymentService.getStatistics()}catch(err){error.value=err.message}finally{loading.value=false}}
onMounted(load)
</script>
