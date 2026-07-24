<template>
  <div class="dashboard-main-body lead-management-page">
    <section class="lead-hero mb-24">
      <div class="lead-hero-title">
        <span class="lead-hero-icon"><iconify-icon icon="lucide:contact" /></span>
        <div>
          <span class="lead-kicker">Lead workspace</span>
          <h4 class="mb-6">Property leads</h4>
          <p class="mb-0">Review buyer requests, spot overdue follow-ups, and assign verified agents without leaving the queue.</p>
        </div>
      </div>
      <button class="lead-refresh-button" :disabled="loading" @click="load(page)">
        <iconify-icon icon="lucide:refresh-cw" /> Refresh
      </button>
    </section>

    <div class="row gy-4 mb-24">
      <div v-for="card in summaryCards" :key="card.label" class="col-sm-6 col-xl-3">
        <div class="lead-summary-card">
          <span class="summary-icon" :class="card.tone"><iconify-icon :icon="card.icon" /></span>
          <div>
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="card radius-12 overflow-hidden lead-list-card">
      <div class="card-header bg-base border-bottom p-20 lead-list-card__header">
        <div class="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-18">
          <div>
            <h6 class="mb-4">Lead queue</h6>
            <p class="text-secondary-light text-sm mb-0">Showing {{ displayStart }}-{{ endIndex }} of {{ total }} leads</p>
          </div>
          <span class="result-pill">{{ filters.per_page }} per page</span>
        </div>
        <LeadFilters v-model="filters" @clear="clearFilters" />
      </div>

      <LoadingState v-if="loading" message="Loading leads..." />
      <div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="load(page)" /></div>
      <div v-else class="card-body p-0">
        <div v-if="leads.length" class="table-responsive">
          <table class="table lead-table mb-0">
            <thead>
              <tr>
                <th>Lead</th><th>Requirement</th><th>Location</th><th>Progress</th><th>Assigned Agent</th><th>Created</th><th class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in leads" :key="leadId(item)" class="manage-row" :class="{ 'is-overdue': item.overdue }">
                <td>
                  <div class="lead-cell">
                    <span class="lead-avatar">{{ initials(item.user?.name) }}</span>
                    <div class="min-w-0">
                      <router-link :to="`/leads/${leadId(item)}`" class="lead-link" @click.stop>{{ safeValue(item.user?.name) }}</router-link>
                      <div class="text-secondary-light text-xs">#{{ leadId(item) }} - {{ safeValue(item.user?.phone) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{{ safeValue(item.category_name) }}</strong>
                  <div class="text-secondary-light text-xs">{{ titleCase(item.purpose) }}</div>
                </td>
                <td>
                  <strong>{{ safeValue(item.city) }}</strong>
                  <div class="text-secondary-light text-xs">{{ safeValue(item.area) }}</div>
                </td>
                <td>
                  <div class="status-stack">
                    <LeadStatusBadge :status="item.status" :overdue="item.overdue" />
                    <LeadStatusBadge :status="item.lead_status" />
                    <LeadStatusBadge :status="item.deal_status" />
                  </div>
                </td>
                <td>
                  <div v-if="item.assigned_agent?.id" class="agent-cell">
                    <span class="agent-avatar">{{ initials(item.assigned_agent?.name) }}</span>
                    <div class="min-w-0">
                      <strong>{{ safeValue(item.assigned_agent?.name) }}</strong>
                      <div class="text-secondary-light text-xs">{{ safeValue(item.assigned_agent?.phone) }}</div>
                    </div>
                  </div>
                  <span v-else class="unassigned-pill">Unassigned</span>
                </td>
                <td>{{ formatDate(item.created_at, true) }}</td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else icon="lucide:contact" title="No leads found" message="No property leads match the current filters." refresh-label="Refresh" @refresh="load(page)" />
        <div v-if="leads.length" class="px-24 pb-24">
          <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="load" />
        </div>
      </div>
    </div>

    <AssignAgentModal :show="Boolean(assignLead)" :lead="assignLead" :mode="assignMode" @close="assignLead=null" @saved="onAssigned" />
    <RowManageDialog v-model="manageOpen" :title="selectedLead ? safeValue(selectedLead.user?.name) : ''" :subtitle="selectedLead ? `#${leadId(selectedLead)}` : ''">
      <router-link v-if="selectedLead" :to="`/leads/${leadId(selectedLead)}`"><iconify-icon icon="lucide:eye" /> View details</router-link>
      <button v-if="selectedLead" type="button" @click="openAssign(selectedLead)"><iconify-icon icon="lucide:user-plus" /> {{ selectedLead.assigned_agent?.id ? 'Reassign Agent' : 'Assign Agent' }}</button>
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
import Pagination from '@/components/pagination/index.vue'
import AssignAgentModal from '@/components/feeta/leads/AssignAgentModal.vue'
import LeadFilters from '@/components/feeta/leads/LeadFilters.vue'
import LeadStatusBadge from '@/components/feeta/leads/LeadStatusBadge.vue'
import leadService from '@/services/adminLeadService'
import { formatDate, safeValue, titleCase } from '@/utils/finance'

const route = useRoute()
const router = useRouter()
const leads = ref([])
const loading = ref(false)
const error = ref('')
const total = ref(0)
const page = ref(Number(route.query.page) || 1)
const assignLead = ref(null)
const assignMode = ref('assign')
const manageOpen = ref(false)
const selectedLead = ref(null)
let timer

const filters = reactive({
  search: String(route.query.search || ''),
  status: String(route.query.status || ''),
  category_name: String(route.query.category_name || ''),
  purpose: String(route.query.purpose || ''),
  city: String(route.query.city || ''),
  assignment: String(route.query.assignment || ''),
  date_from: String(route.query.date_from || ''),
  date_to: String(route.query.date_to || ''),
  per_page: 15,
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.per_page)))
const startIndex = computed(() => total.value ? (page.value - 1) * filters.per_page : 0)
const endIndex = computed(() => Math.min(startIndex.value + leads.value.length, total.value))
const displayStart = computed(() => total.value ? startIndex.value + 1 : 0)
const assignedOnPage = computed(() => leads.value.filter((item) => item.assigned_agent?.id).length)
const pendingOnPage = computed(() => leads.value.filter((item) => String(item.status || '').toLowerCase() === 'pending').length)
const overdueOnPage = computed(() => leads.value.filter((item) => item.overdue).length)
const summaryCards = computed(() => [
  { label: 'Leads in result', value: total.value, icon: 'lucide:contact', tone: 'tone-primary' },
  { label: 'Assigned on page', value: assignedOnPage.value, icon: 'lucide:user-check', tone: 'tone-success' },
  { label: 'Pending on page', value: pendingOnPage.value, icon: 'lucide:clock-3', tone: 'tone-warning' },
  { label: 'Overdue on page', value: overdueOnPage.value, icon: 'lucide:alarm-clock', tone: 'tone-danger' },
])

function normalize(result) {
  const data = Array.isArray(result) ? result : result?.data || []
  return { data, total: result?.meta?.total ?? data.length }
}

const leadId = (lead) => lead?.lead_id || lead?.id
const initials = (name) => String(name || 'Lead').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'LD'

function syncQuery() {
  router.replace({
    query: {
      page: page.value > 1 ? page.value : undefined,
      ...Object.fromEntries(Object.entries(filters).filter(([key, value]) => key !== 'per_page' && value !== '')),
    },
  })
}

async function load(next = 1) {
  loading.value = true
  error.value = ''
  page.value = next
  try {
    const result = normalize(await leadService.getLeads({ ...filters, page: next }))
    leads.value = result.data
    total.value = result.total
    syncQuery()
  } catch (err) {
    error.value = err.message
    leads.value = []
  } finally {
    loading.value = false
  }
}

function openAssign(item) {
  assignLead.value = item
  assignMode.value = item.assigned_agent?.id ? 'reassign' : 'assign'
}

function openManage(item) {
  selectedLead.value = item
  manageOpen.value = true
}

async function onAssigned(updated) {
  assignLead.value = null
  await Swal.fire({ icon: 'success', title: 'Lead assignment updated', timer: 1200, showConfirmButton: false })
  if (leadId(updated)) {
    const index = leads.value.findIndex((lead) => leadId(lead) === leadId(updated))
    if (index >= 0) leads.value[index] = updated
  }
  await load(page.value)
}

function clearFilters() {
  Object.assign(filters, { search: '', status: '', category_name: '', purpose: '', city: '', assignment: '', date_from: '', date_to: '' })
  load(1)
}

watch(() => filters.search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => load(1), 450)
})
watch(() => [filters.status, filters.category_name, filters.purpose, filters.city, filters.assignment, filters.date_from, filters.date_to], () => load(1))
onMounted(load)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.lead-management-page{--lead-blue:#2563eb;--lead-teal:#0f766e;--lead-ink:#0f172a;--lead-muted:#64748b;--lead-line:#e2e8f0;max-width:100%;overflow-x:hidden}.lead-hero{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:24px;border:1px solid rgba(148,163,184,.24);border-radius:18px;background:linear-gradient(135deg,#fff 0%,#f8fbff 56%,#eef8f5 100%);box-shadow:0 18px 48px rgba(15,23,42,.08)}.lead-hero-title{display:flex;align-items:center;gap:16px;min-width:0}.lead-hero-icon{width:58px;height:58px;display:grid;place-items:center;flex:0 0 58px;border-radius:17px;color:#fff;background:linear-gradient(135deg,var(--lead-blue),var(--lead-teal));box-shadow:0 12px 28px rgba(37,99,235,.25);font-size:28px}.lead-kicker{display:inline-block;margin-bottom:6px;color:var(--lead-blue);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.lead-hero h4{color:var(--lead-ink);font-weight:850}.lead-hero p{max-width:780px;color:var(--lead-muted)}.lead-refresh-button{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 16px;border:1px solid #bfdbfe;border-radius:10px;color:#1d4ed8;background:#eff6ff;font-weight:800;transition:.18s ease}.lead-refresh-button:hover:not(:disabled){background:#dbeafe}.lead-refresh-button:disabled{opacity:.62}
.lead-summary-card{height:100%;display:flex;align-items:center;gap:14px;padding:18px;border:1px solid rgba(148,163,184,.25);border-radius:16px;background:#fff;box-shadow:0 14px 34px rgba(15,23,42,.06)}.summary-icon{width:48px;height:48px;display:grid;place-items:center;flex:0 0 48px;border-radius:14px;font-size:23px}.lead-summary-card span:not(.summary-icon){display:block;color:#64748b;font-size:13px;font-weight:700}.lead-summary-card strong{display:block;margin-top:4px;color:#0f172a;font-size:24px;font-weight:850}.tone-primary{color:#2563eb;background:#eff6ff}.tone-success{color:#059669;background:#ecfdf5}.tone-warning{color:#d97706;background:#fffbeb}.tone-danger{color:#dc2626;background:#fef2f2}.lead-list-card{border:1px solid rgba(148,163,184,.25);border-radius:18px!important;box-shadow:0 18px 48px rgba(15,23,42,.08)}.lead-list-card__header{background:#fff!important}.lead-list-card h6{color:#0f172a;font-weight:850}.result-pill,.unassigned-pill{display:inline-flex;align-items:center;min-height:30px;padding:5px 11px;border:1px solid #e2e8f0;border-radius:999px;background:#f8fafc;color:#475569;font-size:12px;font-weight:800}.unassigned-pill{color:#854d0e;background:#fef3c7;border-color:#fde68a}
.lead-table{min-width:1120px;border-collapse:separate;border-spacing:0}.lead-table th{padding:15px 16px;color:#64748b;font-size:11px;font-weight:800;text-transform:uppercase;background:#f8fafc;white-space:nowrap;border-bottom:1px solid var(--lead-line)}.lead-table td{padding:16px;vertical-align:middle;border-color:#edf1f5;color:#334155}.lead-table tbody tr{transition:.16s ease}.lead-table tbody tr:hover td{background:#f8fbff}.lead-table tr.is-overdue td{background:#fff7f7}.lead-table tr.is-overdue:hover td{background:#fff1f2}.lead-cell,.agent-cell{display:flex;align-items:center;gap:12px;min-width:0}.lead-avatar,.agent-avatar{width:42px;height:42px;display:grid;place-items:center;flex:0 0 42px;border-radius:13px;color:#fff;background:linear-gradient(135deg,#2563eb,#3b82f6);font-weight:850;box-shadow:0 8px 18px rgba(37,99,235,.18)}.agent-avatar{background:linear-gradient(135deg,#0f766e,#14b8a6);box-shadow:0 8px 18px rgba(15,118,110,.18)}.lead-link{display:inline-block;color:#1d4ed8;font-weight:800;text-decoration:none}.lead-link:hover{text-decoration:underline}.status-stack{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:250px}.lead-manage-button{min-width:112px;height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #bfdbfe;border-radius:10px;color:#1d4ed8;background:#eff6ff;font-weight:800;transition:.18s ease}.lead-manage-button:hover,.lead-manage-button.show{color:#fff;background:#2563eb;border-color:#2563eb;box-shadow:0 10px 22px rgba(37,99,235,.22)}.manage-chevron{font-size:15px}.lead-action-menu{min-width:188px;padding:8px;border:1px solid rgba(148,163,184,.22);border-radius:14px;box-shadow:0 18px 45px rgba(15,23,42,.16)}.lead-action-menu .dropdown-item{min-height:38px;display:flex;align-items:center;gap:10px;border-radius:10px;font-size:13px;font-weight:750}.lead-action-menu .dropdown-item:hover{background:#f1f5f9}
@media(max-width:767px){.lead-hero{align-items:stretch;flex-direction:column}.lead-hero-title{align-items:flex-start}.lead-refresh-button{width:100%}}@media(max-width:575px){.lead-hero-title{flex-direction:column}}:global([data-theme=dark]) .lead-summary-card,:global([data-theme=dark]) .lead-list-card{background:#182233;border-color:#334155}:global([data-theme=dark]) .lead-summary-card strong{color:#e5e7eb}:global([data-theme=dark]) .lead-table th{background:#111827}:global([data-theme=dark]) .lead-table td{border-color:#263244}
</style>
