<template>
  <div class="dashboard-main-body">
<div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-24">
      <div>
        <h5 class="mb-4">{{ pageTitle }}</h5>
        <p class="text-secondary-light mb-0">Search, filter, review and take action on agent KYC submissions.</p>
      </div>
      <div class="d-flex gap-8 flex-wrap">
        <button class="btn btn-outline-primary-600" :disabled="loading" @click="load"><iconify-icon icon="ri:refresh-line" /> Refresh</button>
        <button class="btn btn-outline-success" :disabled="!rows.length" @click="exportRows"><iconify-icon icon="ri:download-2-line" /> Export</button>
      </div>
    </div>

    <div class="card radius-12 mb-24">
      <div class="card-body">
        <div class="filter-toolbar">
          <label class="search-box">
            <iconify-icon icon="ri:search-line" />
            <input v-model="filters.search" type="search" placeholder="Search agent, email, phone, agency, RERA..." @keyup.enter="applyFilters" />
          </label>
          <select v-model="filters.status" class="form-select">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <input v-model="filters.city" class="form-control" placeholder="City" />
          <input v-model="filters.state" class="form-control" placeholder="State" />
          <input v-model="filters.submitted_from" type="date" class="form-control" />
          <input v-model="filters.submitted_to" type="date" class="form-control" />
          <div class="filter-actions">
            <button class="btn btn-primary-600" type="button" @click="applyFilters">Apply</button>
            <button class="btn btn-outline-secondary-600" type="button" @click="clearFilters">Clear Filters</button>
          </div>
        </div>
      </div>
    </div>

    <ErrorState v-if="error" :message="error" @retry="load" />
    <div v-else class="card radius-12">
      <div class="card-body p-0">
        <LoadingState v-if="loading" message="Loading KYC submissions..." />
        <template v-else>
          <div v-if="rows.length" class="table-responsive">
            <table class="table kyc-table mb-0">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th><button class="sort-btn" @click="sort('firstName')">Agent Name</button></th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th><button class="sort-btn" @click="sort('createdAt')">Submitted Date</button></th>
                  <th>Status</th>
                  <th class="manage-cell">Manage</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in rows" :key="item.id || item.agent_id" class="manage-row">
                  <td>
                    <div class="avatar-sm">
                      <img v-if="item.agent?.profile_pic" :src="mediaUrl(item.agent.profile_pic)" :alt="agentName(item)" />
                      <span v-else>{{ initials(agentName(item)) }}</span>
                    </div>
                  </td>
                  <td>
                    <strong>{{ agentName(item) }}</strong>
                    <div class="text-secondary-light text-xs">#{{ item.agent_id }}</div>
                  </td>
                  <td>{{ safe(item.agent?.email) }}</td>
                  <td>{{ safe(item.agent?.phone) }}</td>
                  <td>{{ formatDate(item.submitted_at || item.created_at, true) }}</td>
                  <td><span :class="['kyc-badge', statusClass(item.status)]">{{ statusLabel(item.status) }}</span></td>
                  <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-32">
            <EmptyState icon="ri:shield-check-line" title="No KYC submissions found." message="Try adjusting filters or refresh the list." />
            <div class="text-center mt-16"><button class="btn btn-outline-primary-600" @click="load">Refresh</button></div>
          </div>
        </template>
      </div>
      <div v-if="rows.length" class="card-footer bg-base">
        <Pagination :current-page="page" :total-pages="totalPages" :start-index="startIndex" :end-index="endIndex" :total-items="total" @page-changed="goPage" />
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedKyc ? agentName(selectedKyc) : ''" :subtitle="selectedKyc ? `#${selectedKyc.agent_id || selectedKyc.id}` : ''">
      <router-link v-if="selectedKyc" :to="`/kyc/${selectedKyc.agent_id || selectedKyc.id}`"><iconify-icon icon="ri:eye-line" /> View KYC</router-link>
      <button v-if="selectedKyc && auth.hasPermission('kyc.approve') && !isVerified(selectedKyc)" type="button" class="text-success" @click="verify(selectedKyc)"><iconify-icon icon="ri:verified-badge-line" /> Verify</button>
      <button v-if="selectedKyc && auth.hasPermission('kyc.reject') && !isRejected(selectedKyc)" type="button" class="text-danger" @click="reject(selectedKyc)"><iconify-icon icon="ri:close-line" /> Reject</button>
      <router-link v-if="selectedKyc && auth.hasPermission('agent.view')" :to="`/agents/${selectedKyc.agent_id || selectedKyc.id}`"><iconify-icon icon="ri:user-star-line" /> Agent</router-link>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import Pagination from '@/components/pagination/index.vue'
import kycService from '@/services/kycService'
import { useAuthStore } from '@/stores/auth'
import { formatDate, safeValue } from '@/utils/finance'
import { mediaUrl } from '@/utils/mediaUrl'
import { agentName, kycStatusParam, normalizeList, statusClass, statusLabel } from './kycUtils'

const props = defineProps({ status: { type: String, default: '' }, title: { type: String, default: 'KYC Submissions' } })
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const rows = ref([])
const meta = ref({})
const manageOpen = ref(false)
const selectedKyc = ref(null)
const page = ref(Number(route.query.page || 1))
const perPage = 15
const filters = reactive({
  search: route.query.search || '',
  status: props.status ? (kycStatusParam[props.status] || props.status) : (route.query.status || ''),
  city: route.query.city || '',
  state: route.query.state || '',
  submitted_from: route.query.submitted_from || '',
  submitted_to: route.query.submitted_to || '',
  sort_by: route.query.sort_by || 'updatedAt',
  sort_direction: route.query.sort_direction || 'desc',
})
const pageTitle = computed(() => props.title)
const total = computed(() => Number(meta.value.total ?? rows.value.length))
const totalPages = computed(() => Math.max(1, Number(meta.value.last_page ?? Math.ceil(total.value / perPage))))
const startIndex = computed(() => total.value ? (page.value - 1) * perPage : 0)
const endIndex = computed(() => Math.min(startIndex.value + rows.value.length, total.value))

function safe(value) { return safeValue(value) }
function initials(name) { return String(name || 'A').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A' }
function isVerified(item) { return String(item.status || item.verification_status).toLowerCase() === 'verified' }
function isRejected(item) { return String(item.status || item.verification_status).toLowerCase() === 'rejected' }
function openManage(item) { selectedKyc.value = item; manageOpen.value = true }
function params() {
  return { ...filters, page: page.value, per_page: perPage }
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    const payload = await kycService.getSubmissions(params())
    const normalized = normalizeList(payload)
    rows.value = normalized.rows
    meta.value = normalized.meta
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
function syncQuery() {
  router.replace({ query: Object.fromEntries(Object.entries({ ...filters, page: page.value }).filter(([, value]) => value !== '' && value !== null && value !== undefined)) })
}
function applyFilters() { page.value = 1; syncQuery(); load() }
function clearFilters() {
  Object.assign(filters, { search: '', status: props.status ? (kycStatusParam[props.status] || props.status) : '', city: '', state: '', submitted_from: '', submitted_to: '', sort_by: 'updatedAt', sort_direction: 'desc' })
  applyFilters()
}
function sort(field) {
  filters.sort_direction = filters.sort_by === field && filters.sort_direction === 'asc' ? 'desc' : 'asc'
  filters.sort_by = field
  applyFilters()
}
function goPage(next) { page.value = next; syncQuery(); load() }
function exportRows() {
  const csv = [
    ['Agent ID', 'Name', 'Email', 'Phone', 'Status', 'Submitted'].join(','),
    ...rows.value.map((item) => [item.agent_id, agentName(item), item.agent?.email, item.agent?.phone, statusLabel(item.status), item.submitted_at || item.created_at].map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')),
  ].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'kyc-submissions.csv'
  a.click()
  URL.revokeObjectURL(url)
}
async function verify(item) {
  const result = await Swal.fire({ title: 'Verify KYC?', input: 'textarea', inputLabel: 'Remarks', inputPlaceholder: 'Optional verification remarks', icon: 'question', showCancelButton: true, confirmButtonText: 'Verify' })
  if (!result.isConfirmed) return
  await kycService.approve(item.agent_id || item.id, { remarks: result.value || 'KYC verified' })
  await Swal.fire({ icon: 'success', title: 'KYC verified', timer: 1200, showConfirmButton: false })
  load()
}
async function reject(item) {
  const result = await Swal.fire({ title: 'Reject KYC', html: '<input id="reason" class="swal2-input" placeholder="Reason"><textarea id="remarks" class="swal2-textarea" placeholder="Remarks"></textarea>', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Reject', preConfirm: () => { const reason = document.getElementById('reason').value.trim(); const remarks = document.getElementById('remarks').value.trim(); if (!reason) return Swal.showValidationMessage('Reason is required'); return { reason, remarks } } })
  if (!result.isConfirmed) return
  await kycService.reject(item.agent_id || item.id, result.value)
  await Swal.fire({ icon: 'success', title: 'KYC rejected', timer: 1200, showConfirmButton: false })
  load()
}
watch(() => props.status, () => { filters.status = props.status ? (kycStatusParam[props.status] || props.status) : ''; applyFilters() })
onMounted(load)
</script>

<style scoped>
.filter-toolbar{display:flex;flex-wrap:wrap;gap:12px;width:100%}.filter-toolbar>*{min-width:180px;flex:1 1 180px}.search-box{min-height:42px;display:flex;align-items:center;gap:9px;padding:0 13px;border:1px solid #d9e0ea;border-radius:9px;background:#fff;flex:2 1 280px}.search-box input{width:100%;border:0;outline:0;background:transparent}.filter-actions{display:flex;gap:8px;flex:0 0 auto;flex-wrap:wrap}.kyc-table th{padding:13px 15px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.04em;background:#f8fafc;white-space:nowrap}.kyc-table td{padding:14px 15px;vertical-align:middle;border-color:#eef2f7}.sort-btn{border:0;background:transparent;color:inherit;font:inherit;text-transform:inherit;letter-spacing:inherit}.avatar-sm{width:42px;height:42px;display:grid;place-items:center;overflow:hidden;border-radius:12px;color:#fff;background:linear-gradient(135deg,#487fff,#315ed1);font-weight:800}.avatar-sm img{width:100%;height:100%;object-fit:cover}.kyc-badge,.verified-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}.verified-badge{color:#15803d;background:#ecfdf3}@media(max-width:768px){.filter-toolbar>*,.search-box,.filter-actions{width:100%;flex:1 1 100%}}
</style>
