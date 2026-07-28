<template>
  <div class="dashboard-main-body offer-management-page">
    <section class="offer-page-hero">
      <div class="offer-page-title">
        <span class="offer-page-icon"><iconify-icon icon="lucide:hand-coins" /></span>
        <div>
          <span class="offer-page-kicker">Offer Management</span>
          <h5 class="mb-4">Offers Sent & Received</h5>
          <p class="mb-0">Review offer activity across users, vendors, and property listings.</p>
        </div>
      </div>
      <div class="offer-page-actions">
        <button class="offer-page-button offer-page-button--secondary" :disabled="loading" @click="refresh"><iconify-icon icon="lucide:refresh-cw" /> Refresh</button>
        <button class="offer-page-button offer-page-button--primary" :disabled="!offers.length" @click="exportRows"><iconify-icon icon="lucide:download" /> Export</button>
      </div>
    </section>

    <div class="offer-summary-grid">
      <div v-for="card in summaryCards" :key="card.label" class="offer-summary-card">
        <span :class="['offer-summary-icon', card.iconClass]"><iconify-icon :icon="card.icon" /></span>
        <div>
          <span>{{ card.label }}</span>
          <strong>{{ card.format ? card.format(card.value) : card.value }}</strong>
        </div>
      </div>
    </div>

    <div class="card radius-12 overflow-hidden offer-list-card">
      <div class="card-header bg-base border-bottom p-20 offer-list-card__header">
        <div class="offer-tabs" role="tablist" aria-label="Offer direction">
          <button type="button" :class="{ active: filters.direction === 'sent' }" @click="setDirection('sent')"><iconify-icon icon="lucide:send" /> Sent</button>
          <button type="button" :class="{ active: filters.direction === 'received' }" @click="setDirection('received')"><iconify-icon icon="lucide:inbox" /> Received</button>
        </div>
        <div class="offer-filters">
          <label class="search-control"><iconify-icon icon="lucide:search" /><input v-model="filters.search" type="search" placeholder="Search offer, property, user, email or phone" /></label>
          <select v-model="filters.status" class="form-select"><option value="">All statuses</option><option v-for="item in statuses" :key="item" :value="item">{{ titleCase(item) }}</option></select>
          <input v-model="filters.category" class="form-control" placeholder="Category" />
          <input v-model="filters.post_id" type="number" min="1" class="form-control" placeholder="Property ID" />
          <input v-model="filters.sender_id" type="number" min="1" class="form-control" placeholder="Sender ID" />
          <input v-model="filters.receiver_id" type="number" min="1" class="form-control" placeholder="Receiver ID" />
          <input v-model="filters.city" class="form-control" placeholder="City" />
          <input v-model="filters.date_from" type="date" class="form-control" title="From date" />
          <input v-model="filters.date_to" type="date" class="form-control" title="To date" />
          <select v-model="sortOption" class="form-select"><option value="created_at:desc">Newest first</option><option value="created_at:asc">Oldest first</option><option value="offer_amount:desc">Amount high to low</option><option value="offer_amount:asc">Amount low to high</option><option value="updated_at:desc">Recently updated</option></select>
          <button v-if="hasFilters" type="button" class="filter-clear-button" @click="clearFilters"><iconify-icon icon="lucide:list-filter-x" /> Clear</button>
        </div>
      </div>

      <LoadingState v-if="loading" message="Loading offers..." />
      <div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="load(page)" /></div>
      <div v-else class="card-body p-0">
        <div v-if="offers.length" class="table-responsive">
          <table class="table offer-table mb-0">
            <thead>
              <tr>
                <th>Offer</th><th>Property</th><th>{{ filters.direction === 'sent' ? 'Sent By' : 'Received By' }}</th><th>{{ filters.direction === 'sent' ? 'Received By' : 'Sent By' }}</th><th>Amount</th><th>Status</th><th>Vendor Seen</th><th>Date</th><th>Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in offers" :key="item.id">
                <td><div class="fw-bold">#{{ item.id }}</div><div class="text-secondary-light text-xs">{{ safeValue(item.category) }}</div></td>
                <td><router-link v-if="item.property_id" :to="`/properties/${item.property_id}`" class="fw-semibold text-primary-light">{{ safeValue(item.property?.title, `Property #${item.property_id}`) }}</router-link><span v-else>Not linked</span><div class="text-secondary-light text-xs">#{{ item.property_id }} - {{ safeValue(item.property?.city) }}</div></td>
                <td><PersonCell :person="primaryPerson(item)" /></td>
                <td><PersonCell :person="secondaryPerson(item)" /></td>
                <td class="fw-semibold">{{ formatCurrency(item.amount) }}</td>
                <td><PropertyStatusBadge :status="item.status" /></td>
                <td><span :class="['seen-pill', item.is_seen_by_vendor ? 'seen-pill--yes' : 'seen-pill--no']">{{ item.is_seen_by_vendor ? 'Seen' : 'Unseen' }}</span></td>
                <td>{{ formatDate(item.created_at, true) }}</td>
                <td><router-link v-if="item.property_id" :to="`/properties/${item.property_id}`" class="btn btn-sm btn-outline-primary-600"><iconify-icon icon="lucide:eye" /> View property</router-link></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-actions">
          <EmptyState icon="lucide:hand-coins" title="No Offers Found" message="No offers match the current filters." />
          <div class="d-flex justify-content-center gap-8 pb-32"><button class="btn btn-outline-primary-600 btn-sm" @click="refresh"><iconify-icon icon="lucide:refresh-cw" class="me-6" />Refresh</button><button v-if="hasFilters" class="btn btn-primary-600 btn-sm" @click="clearFilters"><iconify-icon icon="lucide:list-filter-x" class="me-6" />Clear Filters</button></div>
        </div>
        <div v-if="offers.length" class="px-24 pb-24"><Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="load" /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import Pagination from '@/components/pagination/index.vue'
import PropertyStatusBadge from '@/components/feeta/properties/PropertyStatusBadge.vue'
import offerService from '@/services/offerService'
import { downloadCsv, formatCurrency, formatDate, safeValue, titleCase } from '@/utils/finance'

const PersonCell = defineComponent({
  props: { person: { type: Object, default: null } },
  setup(props) {
    return () => props.person
      ? h('div', [h('div', { class: 'fw-medium' }, props.person.name || `User #${props.person.id}`), h('div', { class: 'text-secondary-light text-xs' }, props.person.email || props.person.phone || props.person.role || 'Not available')])
      : h('span', 'Not available')
  },
})

const route = useRoute()
const router = useRouter()
const offers = ref([])
const stats = ref({})
const loading = ref(false)
const error = ref('')
const total = ref(0)
const page = ref(Number(route.query.page) || 1)
const sortOption = ref(`${route.query.sort_by || 'created_at'}:${route.query.sort_direction || 'desc'}`)
let timer
const statuses = ['pending', 'accepted', 'rejected']
const filters = reactive({
  direction: ['sent', 'received'].includes(route.query.direction) ? String(route.query.direction) : 'sent',
  search: String(route.query.search || ''),
  status: String(route.query.status || ''),
  category: String(route.query.category || ''),
  post_id: String(route.query.post_id || ''),
  sender_id: String(route.query.sender_id || ''),
  receiver_id: String(route.query.receiver_id || ''),
  city: String(route.query.city || ''),
  date_from: String(route.query.date_from || ''),
  date_to: String(route.query.date_to || ''),
  sort_by: String(route.query.sort_by || 'created_at'),
  sort_direction: String(route.query.sort_direction || 'desc'),
  per_page: 15,
})
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.per_page)))
const startIndex = computed(() => total.value ? (page.value - 1) * filters.per_page : 0)
const endIndex = computed(() => Math.min(startIndex.value + offers.value.length, total.value))
const hasFilters = computed(() => ['search', 'status', 'category', 'post_id', 'sender_id', 'receiver_id', 'city', 'date_from', 'date_to'].some((key) => filters[key]))
const summaryCards = computed(() => [
  { label: 'Total Offers', value: stats.value.total_offers ?? 0, icon: 'lucide:hand-coins', iconClass: 'bg-primary-50 text-primary-600' },
  { label: 'Pending', value: stats.value.pending_offers ?? 0, icon: 'lucide:clock-3', iconClass: 'bg-warning-focus text-warning-600' },
  { label: 'Accepted', value: stats.value.accepted_offers ?? 0, icon: 'lucide:badge-check', iconClass: 'bg-success-focus text-success-600' },
  { label: 'Rejected', value: stats.value.rejected_offers ?? 0, icon: 'lucide:circle-x', iconClass: 'bg-danger-focus text-danger-600' },
  { label: 'Unseen', value: stats.value.unseen_by_vendor ?? 0, icon: 'lucide:eye-off', iconClass: 'bg-neutral-100 text-neutral-600' },
  { label: 'Offer Value', value: stats.value.total_amount ?? 0, icon: 'lucide:indian-rupee', iconClass: 'bg-info-focus text-info-600', format: (value) => formatCurrency(value, { maximumFractionDigits: 0 }) },
])

function normalize(value) { const data = Array.isArray(value) ? value : value?.data || []; return { data, total: value?.meta?.total ?? data.length } }
function primaryPerson(item) { return filters.direction === 'sent' ? item.sender : item.receiver }
function secondaryPerson(item) { return filters.direction === 'sent' ? item.receiver : item.sender }
function syncQuery() { router.replace({ query: { page: page.value > 1 ? page.value : undefined, ...Object.fromEntries(Object.entries(filters).filter(([key, value]) => !['per_page'].includes(key) && value !== '')) } }) }
async function load(next = 1) { loading.value = true; error.value = ''; page.value = next; try { const result = normalize(await offerService.getOffers({ ...filters, page: next })); offers.value = result.data; total.value = result.total; syncQuery() } catch (err) { error.value = err.message; offers.value = [] } finally { loading.value = false } }
async function loadStats() { stats.value = await offerService.getOfferStatistics(filters).catch(() => ({})) }
async function refresh() { await Promise.all([load(page.value), loadStats()]) }
function setDirection(direction) { if (filters.direction !== direction) { filters.direction = direction; load(1) } }
function clearFilters() { Object.assign(filters, { search: '', status: '', category: '', post_id: '', sender_id: '', receiver_id: '', city: '', date_from: '', date_to: '', sort_by: 'created_at', sort_direction: 'desc' }); sortOption.value = 'created_at:desc'; load(1); loadStats() }
function exportRows() { downloadCsv(`feeta-offers-${filters.direction}.csv`, [{ label: 'Offer ID', value: (o) => o.id }, { label: 'Property ID', value: (o) => o.property_id }, { label: 'Category', value: (o) => o.category }, { label: 'Sender', value: (o) => o.sender?.name }, { label: 'Receiver', value: (o) => o.receiver?.name }, { label: 'Amount', value: (o) => o.amount }, { label: 'Status', value: (o) => o.status }, { label: 'Vendor Seen', value: (o) => o.is_seen_by_vendor ? 'Seen' : 'Unseen' }, { label: 'Created', value: (o) => o.created_at }], offers.value) }

watch(sortOption, (value) => { [filters.sort_by, filters.sort_direction] = value.split(':'); load(1) })
watch(() => filters.search, () => { clearTimeout(timer); timer = setTimeout(() => { load(1); loadStats() }, 450) })
watch(() => [filters.status, filters.category, filters.post_id, filters.sender_id, filters.receiver_id, filters.city, filters.date_from, filters.date_to], () => { load(1); loadStats() })
watch(() => route.query.search, (value) => { const next = String(value || ''); if (next !== filters.search) filters.search = next })
onMounted(refresh)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.offer-management-page{--offer-blue:#2563eb;--offer-ink:#0f172a;--offer-muted:#64748b;--offer-line:#e2e8f0;display:grid;gap:24px}.offer-page-hero{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px;border:1px solid rgba(148,163,184,.24);border-radius:18px;background:linear-gradient(135deg,#fff 0%,#f8fbff 56%,#f0fdfa 100%);box-shadow:0 18px 48px rgba(15,23,42,.08)}.offer-page-title{display:flex;align-items:center;gap:16px;min-width:0}.offer-page-icon{width:54px;height:54px;display:grid;place-items:center;flex:0 0 54px;border-radius:16px;color:#fff;background:linear-gradient(135deg,#2563eb,#0f766e);box-shadow:0 12px 28px rgba(37,99,235,.25);font-size:26px}.offer-page-kicker{display:block;margin-bottom:4px;color:#2563eb;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.offer-page-title h5{color:var(--offer-ink);font-size:24px;font-weight:800}.offer-page-title p{color:var(--offer-muted)}.offer-page-actions{display:flex;flex-wrap:wrap;gap:10px}.offer-page-button{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 16px;border-radius:10px;border:1px solid transparent;font-weight:700;transition:.18s ease}.offer-page-button:disabled{opacity:.6}.offer-page-button--secondary{color:#1e40af;border-color:#bfdbfe;background:#eff6ff}.offer-page-button--primary{color:#fff;background:#2563eb;box-shadow:0 12px 22px rgba(37,99,235,.24)}
.offer-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}.offer-summary-card{display:flex;align-items:center;gap:12px;padding:16px;border:1px solid rgba(148,163,184,.22);border-radius:14px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.06)}.offer-summary-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;font-size:21px}.offer-summary-card span:not(.offer-summary-icon){display:block;color:#64748b;font-size:12px;font-weight:700}.offer-summary-card strong{display:block;margin-top:3px;color:#0f172a;font-size:20px}
.offer-list-card{border:1px solid rgba(148,163,184,.25);border-radius:18px!important;box-shadow:0 18px 48px rgba(15,23,42,.08)}.offer-list-card__header{display:grid;gap:16px;background:#fff!important}.offer-tabs{display:flex;flex-wrap:wrap;gap:8px}.offer-tabs button{min-height:38px;display:inline-flex;align-items:center;gap:8px;padding:0 14px;border:1px solid #dbeafe;border-radius:10px;background:#eff6ff;color:#1d4ed8;font-weight:800}.offer-tabs button.active{color:#fff;background:#2563eb;border-color:#2563eb}.offer-filters{display:grid;grid-template-columns:minmax(280px,2fr) repeat(auto-fit,minmax(145px,1fr));gap:12px;align-items:center}.search-control{min-height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid var(--offer-line);border-radius:12px;background:#fff;color:#64748b;box-shadow:0 1px 2px rgba(15,23,42,.04)}.search-control input{width:100%;min-height:42px;border:0;outline:0;background:transparent;color:#0f172a}.offer-filters .form-select,.offer-filters .form-control{min-height:44px;border-color:var(--offer-line);border-radius:12px;color:#334155;box-shadow:0 1px 2px rgba(15,23,42,.04)}.filter-clear-button{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #fecaca;border-radius:12px;color:#b91c1c;background:#fff5f5;font-weight:700}
.offer-table{min-width:1220px;border-collapse:separate;border-spacing:0}.offer-table th{padding:13px 12px;color:#64748b;font-size:11px;font-weight:800;text-transform:uppercase;background:#f8fafc;white-space:nowrap;border-bottom:1px solid var(--offer-line)}.offer-table td{padding:13px 12px;vertical-align:middle;border-color:#edf1f5;color:#334155}.offer-table tbody tr:hover{background:#f8fbff}.seen-pill{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:800}.seen-pill--yes{color:#047857;background:#d1fae5}.seen-pill--no{color:#b45309;background:#fef3c7}.empty-actions{padding-top:14px}@media (max-width:767px){.offer-page-hero{align-items:flex-start;flex-direction:column}.offer-page-actions,.offer-page-button{width:100%}.offer-filters{grid-template-columns:1fr}}
</style>
