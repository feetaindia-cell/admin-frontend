<template>
  <div class="dashboard-main-body payment-detail-page">
<LoadingState v-if="loading" message="Loading payment details..." />
    <ErrorState v-else-if="error" :message="error" @retry="loadData" />
    <template v-else>
      <div class="payment-hero mb-24">
        <div class="hero-icon"><iconify-icon icon="ri:secure-payment-line" /></div>
        <div class="flex-grow-1">
          <div class="payment-title-row"><h4 class="mb-0">{{ formatCurrency(payment.amount) }}</h4><StatusBadge :status="payment.status" /><StatusBadge :status="payment.invoice_status" /></div>
          <p class="payment-reference mb-0 mt-8">Payment #{{ payment.id }} | {{ safeValue(payment.razorpay_payment_id) }}</p>
        </div>
        <div class="payment-actions">
          <router-link to="/payments" class="btn btn-outline-primary-600"><iconify-icon icon="ri:arrow-left-line" class="me-6" /> Back</router-link>
          <router-link v-if="auth.hasPermission('payment.invoice.view') && payment.invoice" :to="`/payments/${payment.id}/invoice`" class="btn btn-outline-primary-600"><iconify-icon icon="ri:file-list-3-line" class="me-6" /> View Invoice</router-link>
          <button class="btn btn-outline-primary-600" :disabled="loading" @click="loadData"><iconify-icon icon="ri:refresh-line" class="me-6" /> Refresh</button>
          <button v-if="auth.hasPermission('payment.sync')" class="btn btn-outline-primary-600" :disabled="Boolean(syncing)" @click="retry">
            <span v-if="syncing === 'payment'" class="spinner-border spinner-border-sm me-6"></span><iconify-icon v-else icon="ri:loop-right-line" class="me-6" /> Sync Payment
          </button>
          <button v-if="auth.hasPermission('payment.sync')" class="btn btn-primary-600" :disabled="Boolean(syncing)" @click="retryInvoice">
            <span v-if="syncing === 'invoice'" class="spinner-border spinner-border-sm me-6"></span><iconify-icon v-else icon="ri:file-sync-line" class="me-6" /> Sync Invoice
          </button>
        </div>
      </div>

      <div class="row gy-4">
        <div class="col-xl-7">
          <section class="detail-card">
            <div class="detail-card-head"><span><iconify-icon icon="ri:bank-card-line" /></span><h6>Payment information</h6></div>
            <div class="detail-grid">
              <Info label="Transaction ID" :value="payment.razorpay_payment_id" copy />
              <Info label="Razorpay Order" :value="payment.razorpay_order_id" copy />
              <Info label="Order Number" :value="payment.order_number" />
              <Info label="Payment Method" :value="titleCase(payment.method)" />
              <Info label="Purpose" :value="titleCase(payment.purpose)" />
              <Info label="Listing" :value="payment.listing_id ? `#${payment.listing_id}` : null" />
              <Info label="Paid At" :value="formatDate(payment.paid_at, true)" />
              <Info label="Created At" :value="formatDate(payment.created_at, true)" />
            </div>
          </section>
          <section class="detail-card mt-24">
            <div class="detail-card-head"><span><iconify-icon icon="ri:history-line" /></span><h6>Payment timeline</h6></div>
            <div v-if="timeline.length" class="timeline">
              <div v-for="event in timeline" :key="`${event.type}-${event.occurred_at}`" class="timeline-item">
                <span class="timeline-dot"></span><div><div class="d-flex gap-8 align-items-center flex-wrap"><strong>{{ titleCase(event.type) }}</strong><StatusBadge :status="event.status" /></div><p class="text-secondary-light text-sm mb-0 mt-4">{{ safeValue(event.description) }} | {{ formatDate(event.occurred_at, true) }}</p></div>
              </div>
            </div>
            <EmptyState v-else icon="ri:history-line" title="No timeline events" message="No transaction timeline is available." />
          </section>
        </div>
        <div class="col-xl-5">
          <section class="detail-card">
            <div class="detail-card-head"><span><iconify-icon icon="ri:user-star-line" /></span><h6>Customer and agent</h6></div>
            <div class="side-list">
              <div><span>Agent</span><strong>{{ safeValue(payment.agent?.name) }}</strong></div>
              <div><span>Agent email</span><strong>{{ safeValue(payment.agent?.email) }}</strong></div>
              <div><span>Customer email</span><strong>{{ safeValue(payment.customer?.email) }}</strong></div>
              <div><span>Customer phone</span><strong>{{ safeValue(payment.customer?.phone) }}</strong></div>
            </div>
          </section>
          <section class="detail-card mt-24">
            <div class="detail-card-head"><span><iconify-icon icon="ri:file-list-3-line" /></span><h6>Invoice information</h6></div>
            <div class="side-list">
              <div><span>Invoice Number</span><strong>{{ safeValue(payment.invoice?.invoice_number) }}</strong></div>
              <div><span>Zoho Invoice ID</span><strong>{{ safeValue(payment.invoice?.zoho_invoice_id) }}</strong></div>
              <div><span>Zoho Payment ID</span><strong>{{ safeValue(payment.invoice?.zoho_payment_id) }}</strong></div>
              <div><span>Status</span><StatusBadge :status="payment.invoice?.status || payment.invoice_status" /></div>
            </div>
          </section>
          <section v-if="payment.description || payment.metadata" class="detail-card mt-24">
            <div class="detail-card-head"><span><iconify-icon icon="ri:sticky-note-line" /></span><h6>Notes</h6></div><p class="text-secondary-light mb-0">{{ safeValue(payment.description || payment.metadata?.notes) }}</p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { defineComponent, h, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CopyButton from '@/components/common/CopyButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import paymentService from '@/services/paymentService'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate, safeValue, titleCase } from '@/utils/finance'

const Info = defineComponent({ props: { label: String, value: [String, Number], copy: Boolean }, setup(props) { return () => h('div', { class: 'info-row' }, [h('span', props.label), h('div', { class: 'd-flex align-items-center gap-6 justify-content-end' }, [h('strong', safeValue(props.value)), props.copy && props.value ? h(CopyButton, { value: props.value, label: props.label }) : null])]) } })
const route = useRoute()
const auth = useAuthStore()
const payment = ref({})
const timeline = ref([])
const loading = ref(true)
const syncing = ref('')
const error = ref('')
async function loadData() { loading.value = true; error.value = ''; try { [payment.value, timeline.value] = await Promise.all([paymentService.getPayment(route.params.id), paymentService.getTimeline(route.params.id)]) } catch (err) { error.value = err.message } finally { loading.value = false } }
async function retry() { if (syncing.value) return; const result = await Swal.fire({ title: 'Sync payment now?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sync payment', showLoaderOnConfirm: true }); if (!result.isConfirmed) return; syncing.value = 'payment'; try { await paymentService.retrySync(route.params.id); await Swal.fire({ icon: 'success', title: 'Payment synced', timer: 1200, showConfirmButton: false }); await loadData() } catch (err) { await Swal.fire('Sync failed', err.message, 'error') } finally { syncing.value = '' } }
async function retryInvoice() { if (syncing.value) return; const result = await Swal.fire({ title: 'Sync invoice now?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sync invoice', showLoaderOnConfirm: true }); if (!result.isConfirmed) return; syncing.value = 'invoice'; try { await paymentService.retryInvoiceSync(route.params.id); await Swal.fire({ icon: 'success', title: 'Invoice synced', timer: 1200, showConfirmButton: false }); await loadData() } catch (err) { await Swal.fire('Invoice sync failed', err.message, 'error') } finally { syncing.value = '' } }
onMounted(loadData)
</script>

<style scoped>
.payment-detail-page {
  color: #172033;
}

.payment-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 26px;
  border: 1px solid #d9e2ef;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.hero-icon {
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  flex: 0 0 66px;
  border: 1px solid #c7d7fe;
  border-radius: 8px;
  color: #315ed1;
  background: #f4f7ff;
  font-size: 30px;
}

.payment-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.payment-title-row h4 {
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0;
}

.payment-reference {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  word-break: break-word;
}

.payment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 620px;
}

.payment-actions .btn {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  border-radius: 8px;
  font-weight: 700;
}

.detail-card {
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.035);
}

.detail-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 10px;
  border-bottom: 1px solid #edf1f6;
}

.detail-card-head span {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex: 0 0 38px;
  border: 1px solid #dbe7ff;
  border-radius: 8px;
  color: #315ed1;
  background: #f4f7ff;
  font-size: 19px;
}

.detail-card h6 {
  margin: 0;
  color: #0f172a;
  font-weight: 800;
  letter-spacing: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 26px;
}

:deep(.info-row),
.side-list > div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  min-height: 52px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f3f7;
}

:deep(.info-row span),
.side-list span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

:deep(.info-row strong),
.side-list strong {
  color: #172033;
  text-align: right;
  font-weight: 800;
  word-break: break-word;
}

.timeline {
  padding: 14px 0 0 8px;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 15px;
  padding-bottom: 24px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  top: 14px;
  bottom: -3px;
  left: 5px;
  width: 2px;
  background: #dbeafe;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  margin-top: 5px;
  border: 3px solid #bfdbfe;
  border-radius: 50%;
  background: #2563eb;
}

@media(max-width: 991px) {
  .payment-hero {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .payment-actions {
    justify-content: flex-start;
    max-width: none;
    width: 100%;
  }
}

@media(max-width: 767px) {
  .payment-hero {
    flex-direction: column;
  }

  .payment-actions,
  .payment-actions .btn {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
