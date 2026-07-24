<template>
  <div class="dashboard-main-body">
<AgentSummaryCards :cards="summaryCards" :loading="summaryLoading" class="mb-24" />

    <div class="card radius-12 overflow-hidden">
      <div class="card-header bg-base border-bottom p-20">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h6 class="mb-4">FEETA Agents</h6>
            <p class="text-secondary-light text-sm mb-0">Search, review and manage agent accounts and verification.</p>
          </div>
          <div class="filter-actions">
            <button type="button" class="btn btn-outline-primary-600 btn-sm" :disabled="loading" @click="refresh">
              <iconify-icon icon="ri:refresh-line" class="me-6" /> Refresh
            </button>
            <button v-if="hasActiveFilters" type="button" class="btn btn-outline-secondary-600 btn-sm" @click="resetFilters">
              <iconify-icon icon="ri:filter-off-line" class="me-6" /> Clear filters
            </button>
          </div>
        </div>

        <div class="quick-filters mt-20">
          <button
            v-for="chip in quickFilters"
            :key="chip.key"
            type="button"
            :class="{ active: activeQuickFilter === chip.key }"
            @click="applyQuickFilter(chip.key)"
          >
            {{ chip.label }}
          </button>
        </div>

        <div class="agent-filters mt-16">
          <label class="search-control">
            <iconify-icon icon="ri:search-line" />
            <input v-model="filters.search" type="search" placeholder="Search name, email or phone" />
          </label>
          <select v-model="filters.status" class="form-select filter-input">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
          <select v-model="filters.verification_status" class="form-select filter-input">
            <option value="">All verification</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <input v-model="filters.city" class="form-control filter-input" placeholder="City" @keyup.enter="fetchAgents(1)" />
          <select v-model="sortOption" class="form-select filter-input">
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="firstName:asc">Name A-Z</option>
            <option value="total_properties_count:desc">Most properties</option>
          </select>
          <select v-model.number="filters.per_page" class="form-select filter-input">
            <option v-for="size in [10, 15, 25, 50]" :key="size" :value="size">{{ size }} per page</option>
          </select>
        </div>
      </div>

      <LoadingState v-if="loading" message="Loading agents..." />
      <div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="fetchAgents(page)" /></div>

      <div v-else class="card-body p-0">
        <div v-if="agents.length" class="table-responsive">
          <table class="table agent-table mb-0">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Properties</th>
                <th>Joined</th>
                <th class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="agent in agents" :key="agent.id" class="manage-row">
                <td>
                  <div class="d-flex align-items-center gap-12 agent-identity">
                    <div class="agent-avatar">{{ getInitials(agent.name) }}</div>
                    <div>
                      <router-link :to="`/agents/${agent.id}`" class="agent-name" @click.stop>{{ getSafeValue(agent.name) }}</router-link>
                      <div class="text-secondary-light text-xs mt-3">{{ [agent.city, agent.state].filter(Boolean).join(', ') || 'Location not available' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-value"><iconify-icon icon="ri:mail-line" />{{ getSafeValue(agent.email) }}</div>
                  <div class="contact-value text-secondary-light mt-6"><iconify-icon icon="ri:phone-line" />{{ getSafeValue(agent.phone) }}</div>
                </td>
                <td><StatusBadge :status="agent.status" /></td>
                <td><AgentVerificationBadge :status="agent.verification_status" /></td>
                <td>
                  <div class="property-counts">
                    <strong>{{ formatNumber(agent.total_properties) }}</strong>
                    <span>{{ formatNumber(agent.active_properties) }} active</span>
                  </div>
                </td>
                <td>{{ formatDate(agent.created_at) }}</td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(agent)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState v-else icon="ri:user-star-line" title="No agents found" message="No agent accounts match the current search and filters." />
        <div v-if="agents.length" class="px-24 pb-24">
          <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="fetchAgents" />
        </div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedAgent ? getSafeValue(selectedAgent.name) : ''" :subtitle="selectedAgent ? getSafeValue(selectedAgent.email) : ''">
      <router-link v-if="selectedAgent" :to="`/agents/${selectedAgent.id}`"><iconify-icon icon="ri:eye-line" /> View profile</router-link>
      <router-link v-if="selectedAgent && auth.hasPermission('agent.update')" :to="`/agents/${selectedAgent.id}/edit`"><iconify-icon icon="ri:edit-line" /> Edit agent</router-link>
      <router-link v-if="selectedAgent && auth.hasPermission('agent.properties.view')" :to="`/agents/${selectedAgent.id}/properties`"><iconify-icon icon="ri:home-4-line" /> View properties</router-link>
      <router-link v-if="selectedAgent && auth.hasPermission('credit.view')" :to="`/agents/${selectedAgent.id}?tab=credits`"><iconify-icon icon="ri:wallet-3-line" /> Manage credits</router-link>
      <router-link v-if="selectedAgent && auth.hasPermission('credit.history')" :to="`/agents/${selectedAgent.id}?tab=transactions`"><iconify-icon icon="ri:receipt-line" /> Transactions</router-link>
      <router-link v-if="selectedAgent && auth.hasPermission('payment.view')" :to="`/agents/${selectedAgent.id}?tab=payments`"><iconify-icon icon="ri:bank-card-line" /> Payments</router-link>
      <router-link v-if="selectedAgent && auth.hasPermission('credit.view')" :to="`/agents/${selectedAgent.id}?tab=manual`"><iconify-icon icon="ri:bank-line" /> Manual transfers</router-link>
      <button v-if="selectedAgent && auth.hasPermission('agent.status')" type="button" @click="toggleStatus(selectedAgent)"><iconify-icon icon="ri:refresh-line" /> {{ normalized(selectedAgent.status) === 'active' ? 'Suspend agent' : 'Activate agent' }}</button>
      <button v-if="selectedAgent && auth.hasPermission('agent.verify')" type="button" @click="toggleVerification(selectedAgent)"><iconify-icon icon="ri:shield-check-line" /> {{ normalized(selectedAgent.verification_status) === 'verified' ? 'Unverify agent' : 'Verify agent' }}</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AgentSummaryCards from '@/components/feeta/agents/AgentSummaryCards.vue'
import AgentVerificationBadge from '@/components/feeta/agents/AgentVerificationBadge.vue'
import Pagination from '@/components/pagination/index.vue'
import agentService from '@/services/agentService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const agents = ref([])
const loading = ref(false)
const summaryLoading = ref(false)
const error = ref('')
const actionId = ref(null)
const manageOpen = ref(false)
const selectedAgent = ref(null)
const page = ref(Number(route.query.page) || 1)
const total = ref(0)
const summary = reactive({ total: 0, active: 0, verified: 0, properties: 0 })
let searchTimer

const quickFilters = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Suspended / Inactive' },
  { key: 'verified', label: 'Verified' },
  { key: 'pending', label: 'Pending verification' },
]
const sortOption = ref(`${route.query.sort_by || 'createdAt'}:${route.query.sort_direction || 'desc'}`)
const filters = reactive({
  search: String(route.query.search || ''),
  status: String(route.query.status || ''),
  verification_status: String(route.query.verification_status || ''),
  city: String(route.query.city || ''),
  sort_by: String(route.query.sort_by || 'createdAt'),
  sort_direction: String(route.query.sort_direction || 'desc'),
  per_page: Number(route.query.per_page) || 15,
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.per_page)))
const startIndex = computed(() => total.value ? (page.value - 1) * filters.per_page : 0)
const endIndex = computed(() => Math.min(startIndex.value + agents.value.length, total.value))
const activeQuickFilter = computed(() => {
  if (filters.status === 'active' && !filters.verification_status) return 'active'
  if (filters.status === 'inactive' && !filters.verification_status) return 'inactive'
  if (filters.verification_status === 'verified' && !filters.status) return 'verified'
  if (filters.verification_status === 'pending' && !filters.status) return 'pending'
  return 'all'
})
const hasActiveFilters = computed(() => filters.search || filters.status || filters.verification_status || filters.city || sortOption.value !== 'createdAt:desc' || filters.per_page !== 15)
const summaryCards = computed(() => [
  { label: 'Total Agents', value: summary.total, icon: 'ri:user-star-line', iconClass: 'bg-primary-50 text-primary-600' },
  { label: 'Active Agents', value: summary.active, icon: 'ri:user-check-line', iconClass: 'bg-success-focus text-success-600' },
  { label: 'Verified Agents', value: summary.verified, icon: 'ri:shield-check-line', iconClass: 'bg-info-focus text-info-600' },
  { label: 'Listed Properties', value: summary.properties, icon: 'ri:home-4-line', iconClass: 'bg-warning-focus text-warning-600' },
])

function normalize(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || []
  return { items, total: payload?.meta?.total ?? payload?.total ?? items.length }
}
function normalized(value) { return String(value || '').toLowerCase() }
function getSafeValue(value) { return value === undefined || value === null || value === '' ? 'Not available' : value }
function getInitials(name) { return String(name || 'Agent').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A' }
function formatNumber(value) { const number = Number(value); return Number.isFinite(number) ? new Intl.NumberFormat('en-IN').format(number) : '0' }
function walletBalance(agent) { return agent.wallet_summary?.current_credits ?? agent.wallet_summary?.available_credits ?? agent.wallet_summary?.remaining_credits ?? 0 }
function walletStatus(agent) { return Number(walletBalance(agent)) > 0 ? 'Active' : 'Empty' }
function openManage(agent) { selectedAgent.value = agent; manageOpen.value = true }
function formatDate(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}
function syncQuery() {
  router.replace({ query: {
    page: page.value > 1 ? page.value : undefined,
    search: filters.search || undefined,
    status: filters.status || undefined,
    verification_status: filters.verification_status || undefined,
    city: filters.city || undefined,
    sort_by: filters.sort_by !== 'createdAt' ? filters.sort_by : undefined,
    sort_direction: filters.sort_direction !== 'desc' ? filters.sort_direction : undefined,
    per_page: filters.per_page !== 15 ? filters.per_page : undefined,
  } })
}
async function fetchAgents(nextPage = 1) {
  loading.value = true
  error.value = ''
  page.value = nextPage
  try {
    const payload = normalize(await agentService.getAgents({ ...filters, page: nextPage }))
    agents.value = payload.items
    total.value = payload.total
    syncQuery()
  } catch (err) {
    agents.value = []
    total.value = 0
    error.value = err.message
  } finally {
    loading.value = false
  }
}
async function loadSummary() {
  summaryLoading.value = true
  try {
    const first = normalize(await agentService.getAgents({ page: 1, per_page: 100, sort_by: 'id', sort_direction: 'asc' }))
    const allAgents = [...first.items]
    const pages = Math.ceil(first.total / 100)
    for (let current = 2; current <= pages; current += 1) {
      const payload = normalize(await agentService.getAgents({ page: current, per_page: 100, sort_by: 'id', sort_direction: 'asc' }))
      allAgents.push(...payload.items)
    }
    summary.total = first.total
    summary.active = allAgents.filter((agent) => normalized(agent.status) === 'active').length
    summary.verified = allAgents.filter((agent) => normalized(agent.verification_status) === 'verified').length
    summary.properties = allAgents.reduce((sum, agent) => sum + Number(agent.total_properties || 0), 0)
  } catch {
    summary.total = total.value
    summary.active = agents.value.filter((agent) => normalized(agent.status) === 'active').length
    summary.verified = agents.value.filter((agent) => normalized(agent.verification_status) === 'verified').length
    summary.properties = agents.value.reduce((sum, agent) => sum + Number(agent.total_properties || 0), 0)
  } finally {
    summaryLoading.value = false
  }
}
async function refresh() {
  await Promise.all([fetchAgents(page.value), loadSummary()])
}
function applyQuickFilter(key) {
  filters.status = key === 'active' ? 'active' : key === 'inactive' ? 'inactive' : ''
  filters.verification_status = key === 'verified' ? 'verified' : key === 'pending' ? 'pending' : ''
  fetchAgents(1)
}
async function toggleStatus(agent) {
  if (actionId.value) return
  const nextStatus = normalized(agent.status) === 'active' ? 'inactive' : 'active'
  const actionLabel = nextStatus === 'active' ? 'Activate' : 'Suspend'
  const result = await Swal.fire({ title: `${actionLabel} agent?`, text: nextStatus === 'active' ? getSafeValue(agent.name) : 'Suspending this agent may revoke access and can affect related listings based on backend rules.', icon: nextStatus === 'active' ? 'question' : 'warning', showCancelButton: true, confirmButtonText: actionLabel })
  if (!result.isConfirmed) return
  actionId.value = agent.id
  try {
    await agentService.updateAgentStatus(agent.id, { status: nextStatus })
    await Swal.fire({ icon: 'success', title: `Agent ${nextStatus}`, timer: 1200, showConfirmButton: false })
    await refresh()
  } catch (err) {
    await Swal.fire({ icon: 'error', title: 'Status update failed', text: err.message })
  } finally {
    actionId.value = null
  }
}
async function toggleVerification(agent) {
  if (actionId.value) return
  const isVerified = normalized(agent.verification_status) === 'verified'
  const verificationStatus = isVerified ? 'pending' : 'verified'
  const result = await Swal.fire({ title: `${isVerified ? 'Unverify' : 'Verify'} agent?`, text: getSafeValue(agent.name), icon: 'question', showCancelButton: true, confirmButtonText: isVerified ? 'Unverify' : 'Verify' })
  if (!result.isConfirmed) return
  actionId.value = agent.id
  try {
    await agentService.updateAgentVerification(agent.id, { verification_status: verificationStatus, remarks: isVerified ? 'Unverified by admin' : 'Verified by admin' })
    await Swal.fire({ icon: 'success', title: isVerified ? 'Agent unverified' : 'Agent verified', timer: 1200, showConfirmButton: false })
    await refresh()
  } catch (err) {
    await Swal.fire({ icon: 'error', title: 'Verification update failed', text: err.message })
  } finally {
    actionId.value = null
  }
}
function resetFilters() {
  filters.search = ''
  filters.status = ''
  filters.verification_status = ''
  filters.city = ''
  filters.per_page = 15
  sortOption.value = 'createdAt:desc'
  fetchAgents(1)
}

watch(sortOption, (value) => {
  const [sortBy, direction] = value.split(':')
  filters.sort_by = sortBy
  filters.sort_direction = direction
  fetchAgents(1)
})
watch(() => filters.search, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => fetchAgents(1), 450)
})
watch(() => route.query.search, (value) => {
  const nextSearch = String(value || '')
  if (nextSearch !== filters.search) filters.search = nextSearch
})
watch(() => [filters.status, filters.verification_status, filters.per_page], () => fetchAgents(1))
onMounted(async () => { await Promise.all([fetchAgents(page.value), loadSummary()]) })
onBeforeUnmount(() => window.clearTimeout(searchTimer))
</script>

<style scoped>
.quick-filters { display: flex; align-items: center; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
.quick-filters button { padding: 7px 13px; border: 1px solid #dbe3ee; border-radius: 999px; color: #475569; background: #fff; font-size: 12px; font-weight: 650; white-space: nowrap; }
.quick-filters button:hover, .quick-filters button.active { color: #315ed1; border-color: #a9c2ff; background: #edf3ff; }
.agent-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; width: 100%; }
.search-control { min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 14px; border: 1px solid #d9e0ea; border-radius: 10px; }
.search-control input { width: 100%; border: 0; outline: 0; background: transparent; }
.filter-input { min-height: 44px; border-radius: 10px; }
.agent-table th { padding: 14px 18px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; background: #f8fafc; white-space: nowrap; }
.agent-table td { padding: 16px 18px; vertical-align: middle; border-color: #eef2f7; }
.agent-table tbody tr:hover { background: #fbfdff; }
.agent-identity { min-width: 220px; }
.agent-avatar { width: 46px; height: 46px; display: grid; place-items: center; flex: 0 0 46px; border-radius: 13px; color: #fff; background: linear-gradient(135deg, #487fff, #315ed1); font-weight: 750; }
.agent-name { color: #172033; font-weight: 700; }
.agent-name:hover { color: #487fff; }
.contact-value { display: flex; align-items: center; gap: 7px; white-space: nowrap; }
.property-counts { display: flex; align-items: baseline; gap: 7px; }
.property-counts strong { font-size: 18px; color: #172033; }
.property-counts span { color: #64748b; font-size: 11px; white-space: nowrap; }
.action-menu { width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 10px; color: #475569; background: #f1f5f9; font-size: 20px; }
.agent-action-menu { min-width: 205px; padding: 7px; border: 1px solid #e5eaf2; border-radius: 12px; box-shadow: 0 14px 32px rgba(15,23,42,.12); }
.agent-action-menu .dropdown-item { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 8px; font-size: 13px; }
.agent-action-menu .dropdown-item:hover { color: #315ed1; background: #edf3ff; }
@media (max-width: 767px) { .filter-actions { width: 100%; } .filter-actions .btn { flex: 1 1 100%; } }
</style>
