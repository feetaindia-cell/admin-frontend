<template>
  <div class="dashboard-main-body payment-page">
<div class="payment-page-head mb-24">
      <div><h5 class="mb-4">Payments</h5><p class="text-secondary-light mb-0">Razorpay payments and Zoho invoice status.</p></div>
      <div class="filter-actions">
        <router-link to="/payments/statistics" class="btn btn-outline-primary-600"><iconify-icon icon="ri:bar-chart-line" class="me-6" /> Statistics</router-link>
        <button class="btn btn-outline-primary-600" :disabled="loading" @click="fetchPayments(page)"><iconify-icon icon="ri:refresh-line" class="me-6" /> Refresh</button>
        <button v-if="auth.hasPermission('payment.export')" class="btn btn-primary-600" :disabled="!payments.length" @click="exportRows"><iconify-icon icon="ri:download-line" class="me-6" /> Export</button>
      </div>
    </div>

    <FinanceStatCards :cards="summaryCards" :loading="statsLoading" class="mb-24" />

    <div class="card payment-card overflow-hidden">
      <div class="card-header bg-base p-20 border-bottom">
        <div class="payment-filters">
          <label class="search-control"><iconify-icon icon="ri:search-line" /><input v-model="filters.search" type="search" placeholder="Search payment, order, agent or customer" /></label>
          <select v-model="filters.status" class="form-select"><option value="">All payment statuses</option><option v-for="item in paymentStatuses" :key="item" :value="item">{{ titleCase(item) }}</option></select>
          <select v-model="filters.invoice_status" class="form-select"><option value="">All invoice statuses</option><option v-for="item in invoiceStatuses" :key="item" :value="item">{{ titleCase(item) }}</option></select>
          <select v-model="filters.method" class="form-select"><option value="">All payment methods</option><option v-for="item in paymentMethods" :key="item" :value="item">{{ titleCase(item) }}</option></select>
          <input v-model="filters.date_from" type="date" class="form-control" title="From date" />
          <input v-model="filters.date_to" type="date" class="form-control" title="To date" />
          <input v-model.number="filters.amount_min" type="number" min="0" class="form-control" placeholder="Min amount" />
          <input v-model.number="filters.amount_max" type="number" min="0" class="form-control" placeholder="Max amount" />
          <select v-model="sortOption" class="form-select"><option value="created_at:desc">Newest first</option><option value="created_at:asc">Oldest first</option><option value="amount:desc">Amount high to low</option><option value="amount:asc">Amount low to high</option></select>
          <div class="dropdown">
            <button class="btn btn-outline-secondary-600 w-100" data-bs-toggle="dropdown"><iconify-icon icon="ri:layout-column-line" class="me-6" /> Columns</button>
            <div class="dropdown-menu p-12 column-menu">
              <label v-for="column in optionalColumns" :key="column.key" class="dropdown-item d-flex gap-8"><input v-model="visibleColumns" type="checkbox" :value="column.key" /> {{ column.label }}</label>
            </div>
          </div>
          <button v-if="hasFilters" class="btn btn-outline-secondary-600" @click="resetFilters"><iconify-icon icon="ri:filter-off-line" class="me-6" /> Reset</button>
        </div>
      </div>

      <LoadingState v-if="loading" message="Loading payments..." />
      <div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="fetchPayments(page)" /></div>
      <div v-else class="card-body p-0">
        <div v-if="payments.length" class="table-responsive">
          <table class="table finance-table mb-0">
            <thead><tr><th>Payment</th><th v-if="isVisible('invoice')">Invoice</th><th>Agent / Customer</th><th v-if="isVisible('listing')">Listing</th><th>Amount</th><th>Status</th><th class="manage-cell">Manage</th></tr></thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id" class="manage-row">
                <td><router-link :to="`/payments/${payment.id}`" class="payment-link" @click.stop>#{{ payment.id }}</router-link><div class="payment-subtext mt-3">{{ safeValue(payment.razorpay_payment_id) }}</div></td>
                <td v-if="isVisible('invoice')">{{ safeValue(payment.invoice?.invoice_number) }}</td>
                <td><div class="fw-semibold text-primary-light">{{ safeValue(payment.agent?.name) }}</div><div class="payment-subtext">{{ safeValue(payment.agent?.email || payment.customer?.email) }}</div></td>
                <td v-if="isVisible('listing')">{{ payment.listing_id ? `#${payment.listing_id}` : 'Not linked' }}</td>
                <td class="payment-amount">{{ formatCurrency(payment.amount) }}</td>
                <td><StatusBadge :status="payment.status" /></td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(payment)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else icon="ri:bank-card-line" title="No payments found" message="No payments match the current filters." />
        <div v-if="payments.length" class="px-24 pb-24"><Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="fetchPayments" /></div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedPayment ? `Payment #${selectedPayment.id}` : ''" :subtitle="selectedPayment ? safeValue(selectedPayment.razorpay_payment_id) : ''">
      <router-link v-if="selectedPayment" :to="`/payments/${selectedPayment.id}`"><iconify-icon icon="ri:eye-line" /> View payment</router-link>
      <router-link v-if="selectedPayment && auth.hasPermission('payment.invoice.view') && selectedPayment.invoice" :to="`/payments/${selectedPayment.id}/invoice`"><iconify-icon icon="ri:file-list-3-line" /> View invoice</router-link>
      <button v-if="selectedPayment && auth.hasPermission('payment.sync')" type="button" :disabled="Boolean(syncingId)" @click="syncPayment(selectedPayment)"><iconify-icon icon="ri:refresh-line" /> Sync payment</button>
      <button v-if="selectedPayment && auth.hasPermission('payment.sync')" type="button" :disabled="Boolean(syncingId)" @click="syncInvoice(selectedPayment)"><iconify-icon icon="ri:file-sync-line" /> Sync invoice</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import FinanceStatCards from '@/components/feeta/finance/FinanceStatCards.vue'
import Pagination from '@/components/pagination/index.vue'
import paymentService from '@/services/paymentService'
import { useAuthStore } from '@/stores/auth'
import { downloadCsv, formatCurrency, formatDate, safeValue, titleCase } from '@/utils/finance'

const auth = useAuthStore()
const route = useRoute()
const payments = ref([])
const loading = ref(false)
const statsLoading = ref(false)
const error = ref('')
const syncingId = ref(null)
const manageOpen = ref(false)
const selectedPayment = ref(null)
const total = ref(0)
const page = ref(Number(route.query.page) || 1)
const stats = ref({})
const visibleColumns = ref(['invoice', 'listing'])
const sortOption = ref('created_at:desc')
const filters = reactive({ search: String(route.query.search || ''), status: '', invoice_status: '', method: '', date_from: '', date_to: '', amount_min: '', amount_max: '', agent_id: route.query.agent_id || '', listing_id: route.query.listing_id || '', sort_by: 'created_at', sort_direction: 'desc', per_page: 15 })
let timer
const paymentStatuses = ['pending', 'processing', 'success', 'failed', 'refunded']
const invoiceStatuses = ['not_started', 'invoice_pending', 'invoice_created', 'payment_recording_pending', 'payment_recording_failed', 'invoice_failed', 'paid']
const paymentMethods = ['upi', 'card', 'netbanking', 'wallet', 'bank_transfer']
const optionalColumns = [{ key: 'invoice', label: 'Invoice number' }, { key: 'listing', label: 'Listing' }]
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.per_page)))
const startIndex = computed(() => total.value ? (page.value - 1) * filters.per_page : 0)
const endIndex = computed(() => Math.min(startIndex.value + payments.value.length, total.value))
const hasFilters = computed(() => Object.entries(filters).some(([key, value]) => !['sort_by', 'sort_direction', 'per_page'].includes(key) && value !== ''))
const summaryCards = computed(() => [
  { label: 'Total Payments', value: stats.value.total_payments ?? 0, icon: 'ri:bank-card-line', iconClass: 'bg-primary-50 text-primary-600' },
  { label: 'Successful', value: stats.value.successful_payments ?? 0, icon: 'ri:secure-payment-line', iconClass: 'bg-success-focus text-success-600' },
  { label: 'Pending', value: stats.value.pending_payments ?? 0, icon: 'ri:time-line', iconClass: 'bg-warning-focus text-warning-600' },
  { label: 'Revenue', value: formatCurrency(stats.value.successful_amount ?? 0), icon: 'ri:money-dollar-circle-line', iconClass: 'bg-info-focus text-info-600' },
])

function normalize(payload) { const data = Array.isArray(payload) ? payload : payload?.data || []; return { data, total: payload?.meta?.total ?? data.length } }
function isVisible(key) { return visibleColumns.value.includes(key) }
function openManage(payment) { selectedPayment.value = payment; manageOpen.value = true }
async function fetchPayments(nextPage = 1) {
  loading.value = true; error.value = ''; page.value = nextPage
  try { const result = normalize(await paymentService.getPayments({ ...filters, page: nextPage })); payments.value = result.data; total.value = result.total } catch (err) { error.value = err.message; payments.value = [] } finally { loading.value = false }
}
async function loadStats() { statsLoading.value = true; try { stats.value = await paymentService.getStatistics() } finally { statsLoading.value = false } }
async function syncPayment(payment) {
  if (syncingId.value) return
  const result = await Swal.fire({ title: 'Sync payment now?', text: `Payment #${payment.id}`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sync payment', showLoaderOnConfirm: true })
  if (!result.isConfirmed) return
  syncingId.value = payment.id
  try { const response = await paymentService.retrySync(payment.id); await Swal.fire({ icon: 'success', title: response?.message || 'Payment synced', timer: 1200, showConfirmButton: false }); await Promise.all([fetchPayments(page.value), loadStats()]) } catch (err) { await Swal.fire('Sync failed', err.message, 'error') } finally { syncingId.value = null }
}
async function syncInvoice(payment) {
  if (syncingId.value) return
  const result = await Swal.fire({ title: 'Sync invoice now?', text: `Payment #${payment.id}`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sync invoice', showLoaderOnConfirm: true })
  if (!result.isConfirmed) return
  syncingId.value = payment.id
  try { const response = await paymentService.retryInvoiceSync(payment.id); await Swal.fire({ icon: 'success', title: response?.message || 'Invoice synced', timer: 1200, showConfirmButton: false }); await Promise.all([fetchPayments(page.value), loadStats()]) } catch (err) { await Swal.fire('Invoice sync failed', err.message, 'error') } finally { syncingId.value = null }
}
function exportRows() { downloadCsv('feeta-payments.csv', [{ label: 'ID', value: (p) => p.id }, { label: 'Razorpay Payment', value: (p) => p.razorpay_payment_id }, { label: 'Agent', value: (p) => p.agent?.name }, { label: 'Amount', value: (p) => p.amount }, { label: 'Status', value: (p) => p.status }, { label: 'Invoice Status', value: (p) => p.invoice_status }, { label: 'Created', value: (p) => p.created_at }], payments.value) }
function resetFilters() { Object.assign(filters, { search: '', status: '', invoice_status: '', method: '', date_from: '', date_to: '', amount_min: '', amount_max: '', listing_id: '', sort_by: 'created_at', sort_direction: 'desc' }); sortOption.value = 'created_at:desc'; fetchPayments(1) }
watch(sortOption, (value) => { [filters.sort_by, filters.sort_direction] = value.split(':'); fetchPayments(1) })
watch(() => filters.search, () => { clearTimeout(timer); timer = setTimeout(() => fetchPayments(1), 450) })
watch(() => [filters.status, filters.invoice_status, filters.method, filters.date_from, filters.date_to, filters.amount_min, filters.amount_max], () => fetchPayments(1))
watch(() => route.query.search, (value) => {
  const nextSearch = String(value || '')
  if (nextSearch !== filters.search) filters.search = nextSearch
})
onMounted(() => Promise.all([fetchPayments(), loadStats()]))
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.payment-page {
  color: #172033;
}

.payment-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}

.payment-page-head h5 {
  color: #0f172a;
  font-weight: 800;
  letter-spacing: 0;
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-actions .btn {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  border-radius: 8px;
  font-weight: 700;
}

.payment-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.payment-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.payment-filters > * {
  min-width: 180px;
  flex: 1 1 180px;
}

.payment-filters .search-control {
  min-width: 280px;
  flex: 2 1 320px;
}

.payment-filters .dropdown,
.payment-filters button {
  flex: 0 0 auto;
}

.payment-filters .form-select,
.payment-filters .form-control,
.payment-filters .btn {
  min-height: 42px;
  border-color: #d9e0ea;
  border-radius: 8px;
  font-size: 13px;
}

.search-control {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 42px;
  padding: 0 13px;
  border: 1px solid #d9e0ea;
  border-radius: 8px;
  background: #fff;
}

.search-control iconify-icon {
  color: #315ed1;
  font-size: 17px;
}

.search-control input {
  width: 100%;
  min-height: 40px;
  border: 0;
  outline: 0;
  background: transparent;
}

.finance-table {
  min-width: 980px;
}

.finance-table th {
  padding: 14px 16px;
  border-bottom: 1px solid #e5edf6;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
  background: #f8fafc;
}

.finance-table td {
  padding: 16px;
  vertical-align: middle;
  border-color: #edf1f5;
  color: #334155;
}

.finance-table tbody tr:hover {
  background: #f8fbff;
}

.payment-link {
  color: #315ed1;
  font-weight: 800;
}

.payment-subtext {
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
  word-break: break-word;
}

.payment-amount {
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-menu {
  min-width: 190px;
  border-color: #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
}

@media (max-width: 767px) {
  .filter-actions {
    width: 100%;
  }

  .filter-actions .btn,
  .payment-filters > *,
  .payment-filters .search-control,
  .payment-filters .dropdown,
  .payment-filters button {
    width: 100%;
    flex: 1 1 100%;
  }
}
</style>
