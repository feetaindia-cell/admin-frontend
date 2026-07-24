<template>
  <div class="dashboard-main-body">
<div class="owner-banner mb-24">
      <div class="owner-icon"><iconify-icon icon="ri:id-card-line" /></div>
      <div class="flex-grow-1">
        <h6 class="mb-3">{{ agentName }}</h6>
        <p class="text-secondary-light text-sm mb-0">Properties returned by the existing agent-scoped property API.</p>
      </div>
      <router-link :to="`/agents/${route.params.id}`" class="btn btn-outline-primary-600 btn-sm">
        <iconify-icon icon="ri:user-line" class="me-6" /> Agent profile
      </router-link>
    </div>

    <AgentSummaryCards :cards="summaryCards" :loading="summaryLoading" class="mb-24" />

    <div class="card radius-12 overflow-hidden">
      <div class="card-header bg-base border-bottom p-20">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h6 class="mb-4">Listings</h6>
            <p class="text-secondary-light text-sm mb-0">{{ total }} properties match the current filters.</p>
          </div>
          <div class="filter-actions">
            <button type="button" class="btn btn-outline-primary-600 btn-sm" :disabled="loading" @click="refreshProperties">
              <iconify-icon icon="ri:refresh-line" class="me-6" /> Refresh
            </button>
            <button v-if="hasActiveFilters" type="button" class="btn btn-outline-secondary-600 btn-sm" @click="resetFilters">
              <iconify-icon icon="ri:filter-off-line" class="me-6" /> Reset filters
            </button>
          </div>
        </div>

        <div class="property-filters mt-20">
          <label class="search-control">
            <iconify-icon icon="ri:search-line" />
            <input v-model="filters.search" type="search" placeholder="Search category, city, locality or description" />
          </label>
          <select v-model="filters.status" class="form-select filter-input">
            <option value="">All statuses</option>
            <option v-for="status in propertyStatuses" :key="status" :value="status">{{ titleCase(status) }}</option>
          </select>
          <select v-model="filters.property_type" class="form-select filter-input">
            <option value="">Sale and rent</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
          <input v-model="filters.city" class="form-control filter-input" placeholder="City" @keyup.enter="fetchProperties(1)" />
          <select v-model="sortOption" class="form-select filter-input">
            <option value="created_at:desc">Newest first</option>
            <option value="created_at:asc">Oldest first</option>
            <option value="updated_at:desc">Recently updated</option>
            <option value="category_name:asc">Category A–Z</option>
            <option value="city:asc">City A–Z</option>
          </select>
          <select v-model.number="filters.per_page" class="form-select filter-input">
            <option v-for="size in [10, 15, 25, 50]" :key="size" :value="size">{{ size }} per page</option>
          </select>
        </div>
      </div>

      <LoadingState v-if="loading" message="Loading properties..." />
      <div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="fetchProperties(page)" /></div>

      <div v-else class="card-body p-0">
        <div v-if="properties.length" class="table-responsive">
          <table class="table property-table mb-0">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Pricing / Area</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Created</th>
                <th class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="property in properties" :key="property.id" class="manage-row">
                <td>
                  <div class="property-identity">
                    <div class="property-thumb"><iconify-icon icon="ri:building-2-line" /></div>
                    <div>
                      <router-link :to="propertyRoute(property)" class="property-title" @click.stop>{{ value(property.name) }}</router-link>
                      <div class="d-flex align-items-center gap-2 flex-wrap mt-5">
                        <span class="property-meta"><iconify-icon :icon="propertyTypeIcon(property.category)" class="me-4" />{{ value(property.category) }}</span>
                        <span class="property-meta"><iconify-icon :icon="propertyTypeIcon(property.property_type)" class="me-4" />{{ titleCase(property.property_type) }}</span>
                        <span class="text-secondary-light text-xs">#{{ property.id }}</span>
                        <CopyButton :value="property.id" label="property ID" @click.stop />
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-start gap-8">
                    <iconify-icon icon="ri:map-pin-line" class="text-primary-600 text-lg mt-2" />
                    <div>
                      <div class="fw-medium">{{ locationPrimary(property) }}</div>
                      <div class="text-secondary-light text-xs mt-2">{{ value(property.location?.locality) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="fw-semibold text-primary-light">{{ formatCurrency(property.price) }}</div>
                  <div class="text-secondary-light text-xs mt-3">Area not available in list API</div>
                </td>
                <td><StatusBadge :status="property.status" /></td>
                <td><StatusBadge :status="property.approval_status" /></td>
                <td>{{ formatDate(property.created_at) }}</td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(property)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState
          v-else
          icon="ri:building-2-line"
          title="No properties found"
          message="No property listings match the current search and filters."
        />

        <div v-if="properties.length" class="px-24 pb-24">
          <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="fetchProperties" />
        </div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedProperty ? value(selectedProperty.name) : ''" :subtitle="selectedProperty ? `#${selectedProperty.id}` : ''">
      <router-link v-if="selectedProperty" :to="propertyRoute(selectedProperty)"><iconify-icon icon="ri:eye-line" /> View property</router-link>
      <router-link v-if="selectedProperty && auth.hasPermission('payment.view') && selectedProperty.payment_id" :to="`/payments/${selectedProperty.payment_id}`"><iconify-icon icon="ri:bank-card-line" /> View payment</router-link>
      <router-link v-if="selectedProperty && auth.hasPermission('payment.invoice.view') && selectedProperty.payment_id && selectedProperty.invoice_status" :to="`/payments/${selectedProperty.payment_id}/invoice`"><iconify-icon icon="ri:file-list-3-line" /> View invoice</router-link>
      <router-link v-if="selectedProperty" :to="`/agents/${route.params.id}`"><iconify-icon icon="ri:user-star-line" /> View agent</router-link>
      <router-link v-if="selectedProperty && auth.hasPermission('agent.properties.update')" :to="`${propertyRoute(selectedProperty)}?edit=1`"><iconify-icon icon="ri:edit-line" /> Edit property</router-link>
      <button v-if="selectedProperty && auth.hasPermission('agent.properties.status')" type="button" @click="changeStatus(selectedProperty)"><iconify-icon icon="ri:refresh-line" /> Change status</button>
      <button v-if="selectedProperty && auth.hasPermission('agent.properties.delete') && String(selectedProperty.status).toLowerCase() !== 'deleted'" type="button" class="text-danger" @click="deleteProperty(selectedProperty)"><iconify-icon icon="ri:delete-bin-line" /> Move to deleted</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CopyButton from '@/components/common/CopyButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AgentSummaryCards from '@/components/feeta/agents/AgentSummaryCards.vue'
import Pagination from '@/components/pagination/index.vue'
import agentService from '@/services/agentService'
import { useAuthStore } from '@/stores/auth'
import { propertyTypeIcon } from '@/utils/feetaIcons'
import { formatCurrency as formatInrCurrency } from '@/utils/finance'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const properties = ref([])
const loading = ref(false)
const summaryLoading = ref(false)
const error = ref('')
const actionId = ref(null)
const manageOpen = ref(false)
const selectedProperty = ref(null)
const total = ref(0)
const page = ref(Number(route.query.page) || 1)
const agentName = ref(`Agent #${route.params.id}`)
const summary = reactive({ total: 0, active: 0, pending: 0, inactiveDeleted: 0 })
let searchTimer

const propertyStatuses = ['active', 'pending', 'rejected', 'sold', 'rented', 'inactive', 'draft', 'deleted']
const initialSort = `${route.query.sort_by || 'created_at'}:${route.query.sort_direction || 'desc'}`
const sortOption = ref(initialSort)
const filters = reactive({
  search: String(route.query.search || ''),
  status: String(route.query.status || ''),
  property_type: String(route.query.property_type || ''),
  city: String(route.query.city || ''),
  sort_by: String(route.query.sort_by || 'created_at'),
  sort_direction: String(route.query.sort_direction || 'desc'),
  per_page: Number(route.query.per_page) || 15,
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.per_page)))
const startIndex = computed(() => total.value ? (page.value - 1) * filters.per_page : 0)
const endIndex = computed(() => Math.min(startIndex.value + properties.value.length, total.value))
const hasActiveFilters = computed(() => filters.search || filters.status || filters.property_type || filters.city || sortOption.value !== 'created_at:desc' || filters.per_page !== 15)
const hasPaymentData = computed(() => properties.value.some((property) => property.payment_status || property.invoice_status || property.credits_consumed !== undefined || property.purchased_using_credits))
const summaryCards = computed(() => [
  { label: 'Total Properties', value: summary.total, icon: 'ri:home-4-line', iconClass: 'bg-primary-50 text-primary-600' },
  { label: 'Active', value: summary.active, icon: 'ri:checkbox-circle-line', iconClass: 'bg-success-focus text-success-600' },
  { label: 'Pending', value: summary.pending, icon: 'ri:time-line', iconClass: 'bg-warning-focus text-warning-600' },
  { label: 'Inactive / Deleted', value: summary.inactiveDeleted, icon: 'ri:close-circle-line', iconClass: 'bg-danger-focus text-danger-600' },
])

function normalize(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || []
  return { items, total: payload?.meta?.total ?? payload?.total ?? items.length }
}
function value(input) { return input === undefined || input === null || input === '' ? 'Not available' : input }
function titleCase(input) { return value(input) === 'Not available' ? 'Not available' : String(input).replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) }
function propertyRoute(property) { return `/agents/${route.params.id}/properties/${property.id}` }
function openManage(property) { selectedProperty.value = property; manageOpen.value = true }
function locationPrimary(property) { return [property.location?.city, property.location?.state].filter(Boolean).join(', ') || 'Location not available' }
function formatCurrency(input) {
  const amount = Number(input)
  return Number.isFinite(amount) ? formatInrCurrency(amount, { maximumFractionDigits: 0 }) : 'Price not available'
}
function formatDate(input) {
  if (!input) return 'Not available'
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? String(input) : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}
function syncQuery() {
  router.replace({ query: {
    page: page.value > 1 ? page.value : undefined,
    search: filters.search || undefined,
    status: filters.status || undefined,
    property_type: filters.property_type || undefined,
    city: filters.city || undefined,
    sort_by: filters.sort_by !== 'created_at' ? filters.sort_by : undefined,
    sort_direction: filters.sort_direction !== 'desc' ? filters.sort_direction : undefined,
    per_page: filters.per_page !== 15 ? filters.per_page : undefined,
  } })
}
async function loadAgentName() {
  try {
    const agent = await agentService.getAgent(route.params.id)
    agentName.value = agent.name || agent.email || `Agent #${route.params.id}`
  } catch {
    agentName.value = `Agent #${route.params.id}`
  }
}
async function fetchProperties(nextPage = 1) {
  loading.value = true
  error.value = ''
  page.value = nextPage
  try {
    const payload = normalize(await agentService.getAgentProperties(route.params.id, { ...filters, page: nextPage }))
    properties.value = payload.items
    total.value = payload.total
    syncQuery()
  } catch (err) {
    properties.value = []
    total.value = 0
    error.value = err.message
  } finally {
    loading.value = false
  }
}
async function loadSummary() {
  summaryLoading.value = true
  try {
    const [all, active, pending, inactive, deleted] = await Promise.all([
      agentService.getAgentProperties(route.params.id, { page: 1, per_page: 1 }),
      agentService.getAgentProperties(route.params.id, { status: 'active', page: 1, per_page: 1 }),
      agentService.getAgentProperties(route.params.id, { status: 'pending', page: 1, per_page: 1 }),
      agentService.getAgentProperties(route.params.id, { status: 'inactive', page: 1, per_page: 1 }),
      agentService.getAgentProperties(route.params.id, { status: 'deleted', page: 1, per_page: 1 }),
    ])
    summary.total = normalize(all).total
    summary.active = normalize(active).total
    summary.pending = normalize(pending).total
    summary.inactiveDeleted = normalize(inactive).total + normalize(deleted).total
  } catch {
    summary.total = total.value
  } finally {
    summaryLoading.value = false
  }
}
async function refreshProperties() {
  await Promise.all([fetchProperties(page.value), loadSummary(), loadAgentName()])
}
async function changeStatus(property) {
  if (actionId.value) return
  const result = await Swal.fire({
    title: 'Change property status',
    input: 'select',
    inputOptions: Object.fromEntries(propertyStatuses.filter((status) => status !== 'deleted').map((status) => [status, titleCase(status)])),
    inputValue: String(property.status || 'inactive').toLowerCase(),
    showCancelButton: true,
    confirmButtonText: 'Update status',
    inputValidator: (status) => !status && 'Select a status',
  })
  if (!result.isConfirmed) return
  actionId.value = property.id
  try {
    await agentService.updateAgentPropertyStatus(route.params.id, property.id, { status: result.value, remarks: `Status changed to ${result.value} by admin` })
    await Swal.fire({ icon: 'success', title: 'Status updated', timer: 1200, showConfirmButton: false })
    await Promise.all([fetchProperties(page.value), loadSummary()])
  } catch (err) {
    await Swal.fire({ icon: 'error', title: 'Update failed', text: err.message })
  } finally {
    actionId.value = null
  }
}
async function deleteProperty(property) {
  if (actionId.value) return
  const result = await Swal.fire({ title: 'Move property to deleted?', text: value(property.name), icon: 'warning', showCancelButton: true, confirmButtonText: 'Move to deleted', confirmButtonColor: '#dc2626' })
  if (!result.isConfirmed) return
  actionId.value = property.id
  try {
    await agentService.deleteAgentProperty(route.params.id, property.id)
    await Swal.fire({ icon: 'success', title: 'Property deleted', timer: 1200, showConfirmButton: false })
    await Promise.all([
      fetchProperties(properties.value.length === 1 && page.value > 1 ? page.value - 1 : page.value),
      loadSummary(),
    ])
  } catch (err) {
    await Swal.fire({ icon: 'error', title: 'Delete failed', text: err.message })
  } finally {
    actionId.value = null
  }
}
function resetFilters() {
  filters.search = ''
  filters.status = ''
  filters.property_type = ''
  filters.city = ''
  filters.per_page = 15
  sortOption.value = 'created_at:desc'
  fetchProperties(1)
}

watch(sortOption, (value) => {
  const [sortBy, direction] = value.split(':')
  filters.sort_by = sortBy
  filters.sort_direction = direction
  fetchProperties(1)
})
watch(() => filters.search, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => fetchProperties(1), 450)
})
watch(() => route.query.search, (value) => {
  const nextSearch = String(value || '')
  if (nextSearch !== filters.search) filters.search = nextSearch
})
watch(() => [filters.status, filters.property_type, filters.per_page], () => fetchProperties(1))
onMounted(async () => { await Promise.all([loadAgentName(), fetchProperties(page.value), loadSummary()]) })
onBeforeUnmount(() => window.clearTimeout(searchTimer))
</script>

<style scoped>
.owner-banner { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border: 1px solid #dce6fa; border-radius: 14px; background: linear-gradient(135deg, #f8fbff, #edf4ff); }
.owner-icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 12px; color: #487fff; background: #fff; font-size: 21px; box-shadow: 0 6px 16px rgba(72,127,255,.12); }
.property-filters { display: flex; flex-wrap: wrap; gap: 12px; width: 100%; }
.search-control { min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 14px; border: 1px solid #d9e0ea; border-radius: 10px; }
.search-control input { width: 100%; border: 0; outline: 0; background: transparent; }
.filter-input { min-height: 44px; border-radius: 10px; }
.property-table th { padding: 14px 18px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; background: #f8fafc; white-space: nowrap; }
.property-table td { padding: 16px 18px; vertical-align: middle; border-color: #eef2f7; }
.property-table tbody tr:hover { background: #fbfdff; }
.property-identity { display: flex; align-items: center; gap: 12px; min-width: 280px; }
.property-thumb { width: 58px; height: 52px; display: grid; place-items: center; flex: 0 0 58px; border-radius: 10px; color: #487fff; background: linear-gradient(135deg, #edf3ff, #e4ecff); font-size: 24px; }
.property-title { color: #172033; font-weight: 700; }
.property-title:hover { color: #487fff; }
.property-meta { padding: 3px 8px; border-radius: 999px; color: #475569; background: #f1f5f9; font-size: 11px; font-weight: 600; }
.action-menu { width: 38px; height: 38px; display: inline-grid; place-items: center; border: 1px solid #dbe3ee; border-radius: 10px; color: #475569; background: #fff; font-size: 19px; }
.action-menu:hover { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
.dropdown-item { display: flex; align-items: center; gap: 9px; }
@media (max-width: 767px) { .owner-banner { align-items: flex-start; flex-wrap: wrap; } .filter-actions { width: 100%; } .filter-actions .btn { flex: 1 1 100%; } }
</style>
