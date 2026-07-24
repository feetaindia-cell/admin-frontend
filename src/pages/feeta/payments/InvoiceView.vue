<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading invoice..." />
    <ErrorState v-else-if="error" :message="error" @retry="loadInvoice" />
    <div v-else class="invoice-sheet">
      <div class="invoice-header">
        <div><span class="invoice-brand">FEETA</span><h4 class="mt-12 mb-3">Payment Invoice</h4><p class="text-secondary-light mb-0">{{ safeValue(invoice.invoice_number) }}</p></div>
        <div class="text-end"><StatusBadge :status="invoice.status" /><h5 class="mt-12 mb-0">{{ formatCurrency(invoice.amount) }}</h5></div>
      </div>
      <div class="row gy-4 mt-4">
        <div class="col-md-6"><h6>Razorpay</h6><Info label="Order ID" :value="invoice.razorpay_order_id" /><Info label="Payment ID" :value="invoice.razorpay_payment_id" /></div>
        <div class="col-md-6"><h6>Zoho Invoice</h6><Info label="Invoice ID" :value="invoice.zoho_invoice_id" /><Info label="Payment ID" :value="invoice.zoho_payment_id" /></div>
      </div>
      <div v-if="invoice.error_message" class="alert alert-danger mt-24 mb-0">{{ invoice.error_message }}</div>
      <div class="d-flex justify-content-end gap-8 flex-wrap mt-24">
        <router-link :to="`/payments/${route.params.id}`" class="btn btn-outline-primary-600 d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:arrow-left-line"></iconify-icon>Back to Payment</router-link>
        <a v-if="invoice.invoice_url" :href="invoice.invoice_url" target="_blank" rel="noopener" class="btn btn-outline-primary-600 d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:external-link-line"></iconify-icon>Open Zoho Invoice</a>
        <button v-if="auth.hasPermission('payment.sync')" class="btn btn-primary-600 d-inline-flex align-items-center gap-6" :disabled="syncing" @click="retryInvoice"><span v-if="syncing" class="spinner-border spinner-border-sm"></span><iconify-icon v-else icon="ri:file-sync-line"></iconify-icon>Sync Invoice</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import Swal from 'sweetalert2'
import { defineComponent, h, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import paymentService from '@/services/paymentService'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, safeValue } from '@/utils/finance'
const Info = defineComponent({ props: { label: String, value: [String, Number] }, setup: (props) => () => h('div', { class: 'invoice-info' }, [h('span', props.label), h('strong', safeValue(props.value))]) })
const route = useRoute(); const auth = useAuthStore(); const invoice = ref({}); const loading = ref(true); const syncing = ref(false); const error = ref('')
async function loadInvoice(){loading.value=true;error.value='';try{invoice.value=await paymentService.getInvoice(route.params.id)}catch(err){error.value=err.message}finally{loading.value=false}}
async function retryInvoice(){if(syncing.value)return;const result=await Swal.fire({title:'Sync invoice now?',icon:'question',showCancelButton:true,confirmButtonText:'Sync invoice',showLoaderOnConfirm:true});if(!result.isConfirmed)return;syncing.value=true;try{await paymentService.retryInvoiceSync(route.params.id);await Swal.fire({icon:'success',title:'Invoice synced',timer:1200,showConfirmButton:false});await loadInvoice()}catch(err){await Swal.fire('Sync failed',err.message,'error')}finally{syncing.value=false}}
onMounted(loadInvoice)
</script>
<style scoped>
.invoice-sheet{max-width:960px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:16px;background:#fff}.invoice-header{display:flex;justify-content:space-between;gap:20px;padding-bottom:24px;border-bottom:2px solid #eaf0fa}.invoice-brand{display:inline-block;padding:7px 12px;border-radius:8px;color:#fff;background:#487fff;font-weight:800;letter-spacing:.08em}.invoice-info{display:flex;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #edf1f6}.invoice-info span{color:#64748b}.invoice-info strong{text-align:right;word-break:break-word}
</style>
