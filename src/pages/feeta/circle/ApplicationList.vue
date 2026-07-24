<template>
  <div class="dashboard-main-body">
<section class="circle-hero mb-24">
      <div class="circle-hero__content">
        <span class="section-kicker"><iconify-icon icon="ri:group-2-line" /> FEETA Circle</span>
        <h5>Agent applications</h5>
        <p>Review partner intent, service areas and business readiness before admitting agents into the FEETA Circle network.</p>
      </div>
      <div class="circle-hero__actions">
        <button class="btn btn-outline-light" :disabled="loading" @click="load(page)">
          <iconify-icon icon="ri:refresh-line" />Refresh
        </button>
      </div>
    </section>

    <section class="summary-grid mb-24" aria-label="Application summary">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card">
        <span :class="['summary-icon', card.tone]"><iconify-icon :icon="card.icon" /></span>
        <div>
          <strong>{{ card.value }}</strong>
          <span>{{ card.label }}</span>
        </div>
      </article>
    </section>

    <section class="filter-band mb-24">
      <div class="filter-band__main">
        <label class="search-control">
          <iconify-icon icon="ri:search-line" />
          <input v-model="filters.search" type="search" placeholder="Search name, email, phone, company or location" @keyup.enter="load(1)" />
        </label>
        <select v-model="filters.status" class="form-select" aria-label="Application status">
          <option value="">All statuses</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
      <div class="status-tabs" aria-label="Quick status filters">
        <button
          v-for="option in statusTabOptions"
          :key="option.value || 'all'"
          type="button"
          :class="['status-tab', { active: filters.status === option.value }]"
          @click="setStatus(option.value)"
        >
          {{ option.label }}
          <span>{{ option.count }}</span>
        </button>
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary-600" @click="load(1)">Apply</button>
        <button class="btn btn-outline-secondary-600" :disabled="!activeFilterCount" @click="clearFilters">Clear</button>
      </div>
    </section>

    <ErrorState v-if="error" :message="error" @retry="load(page)" />
    <section v-else class="application-panel">
      <LoadingState v-if="loading" message="Loading FEETA Circle applications..." />
      <template v-else-if="rows.length">
        <div class="table-responsive">
          <table class="table application-table mb-0">
            <thead>
              <tr>
                <th>Application</th>
                <th>Agent</th>
                <th>Contact</th>
                <th>Company</th>
                <th>Submitted</th>
                <th>Status</th>
                <th class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody v-for="item in rows" :key="item.application_id">
              <tr class="manage-row" :class="{ expanded: expandedId === item.application_id }">
                <td>
                  <button class="expand-button" :aria-expanded="expandedId === item.application_id" @click.stop="toggleDetails(item.application_id)">
                    <span><iconify-icon :icon="expandedId === item.application_id ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" /></span>
                    <strong>#{{ item.application_id }}</strong>
                  </button>
                </td>
                <td><div class="agent-cell"><span class="avatar">{{ initials(item.full_name) }}</span><div><strong>{{ safeValue(item.full_name) }}</strong><small>Agent #{{ item.agent_id }}</small></div></div></td>
                <td><div class="stack-cell"><strong class="cell-primary">{{ safeValue(item.mobile_number) }}</strong><small>{{ safeValue(item.email) }}</small></div></td>
                <td><div class="stack-cell"><strong class="cell-primary">{{ safeValue(item.company_name) }}</strong><span :class="['rera-badge', reraClass(item.rera_approved)]">{{ reraLabel(item.rera_approved) }}</span></div></td>
                <td><div class="stack-cell submitted-cell"><strong>{{ formatDate(item.created_at, true) }}</strong><small>{{ submittedRelative(item.created_at) }}</small></div></td>
                <td><span :class="['status-badge', `is-${statusKey(item.status)}`]"><iconify-icon :icon="statusIcon(item.status)" />{{ statusLabel(item.status) }}</span></td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
              <tr v-if="expandedId === item.application_id" class="detail-row"><td colspan="7">
                <div class="application-details">
                  <div class="detail-intro">
                    <span class="avatar avatar-lg">{{ initials(item.full_name) }}</span>
                    <div>
                      <strong>{{ safeValue(item.full_name) }}</strong>
                      <span>{{ safeValue(item.company_name) }} - {{ safeValue(item.city) }}</span>
                    </div>
                    <span :class="['status-badge', `is-${statusKey(item.status)}`]"><iconify-icon :icon="statusIcon(item.status)" />{{ statusLabel(item.status) }}</span>
                  </div>
                  <DetailGroup title="Contact" icon="ri:contacts-line" :items="[['Full name', item.full_name], ['Mobile', item.mobile_number], ['WhatsApp', item.whatsapp_number], ['Email', item.email]]" />
                  <DetailGroup title="Business" icon="ri:building-line" :items="[['Company', item.company_name], ['RERA approved', reraLabel(item.rera_approved)], ['Transactions / month', item.transactions_per_month], ['Address', item.address]]" />
                  <DetailGroup title="Preferences" icon="ri:list-check-3" :items="[['Categories', joinValues(item.categories)], ['Purposes', joinValues(item.purposes)], ['City', item.city], ['Area', item.area]]" />
                  <DetailGroup title="Review" icon="ri:file-check-line" :items="[['Reason', item.reason], ['Reviewed by', item.reviewed_by_admin?.name || (item.reviewed_by ? `Admin #${item.reviewed_by}` : null)], ['Reviewed at', formatDate(item.reviewed_at, true)], ['Updated', formatDate(item.updated_at, true)]]" />
                </div>
              </td></tr>
            </tbody>
          </table>
        </div>
        <div class="panel-footer"><Pagination :current-page="page" :total-pages="totalPages" :start-index="startIndex" :end-index="endIndex" :total-items="total" @page-changed="load" /></div>
      </template>
      <div v-else class="empty-wrap"><EmptyState icon="ri:file-user-line" title="No applications found" message="No FEETA Circle applications match the current filters." /></div>
    </section>
    <RowManageDialog v-model="manageOpen" :title="selectedApplication ? safeValue(selectedApplication.full_name) : ''" :subtitle="selectedApplication ? `Application #${selectedApplication.application_id}` : ''">
      <button v-if="selectedApplication" type="button" @click="viewDetails(selectedApplication)"><iconify-icon icon="ri:eye-line" /> View details</button>
      <button v-if="selectedApplication" type="button" @click="manageApplication(selectedApplication)"><iconify-icon icon="ri:settings-3-line" /> Edit / manage</button>
      <span v-if="selectedApplication" class="disabled"><iconify-icon icon="ri:file-list-3-line" /> View documents</span>
      <button v-if="selectedApplication && canSetStatus(selectedApplication, 'approved')" type="button" class="text-success" :disabled="reviewingId === selectedApplication.application_id" @click="confirmReview(selectedApplication, 'approved')"><iconify-icon icon="ri:check-line" /> Approve</button>
      <button v-if="selectedApplication && canSetStatus(selectedApplication, 'rejected')" type="button" class="text-danger" :disabled="reviewingId === selectedApplication.application_id" @click="confirmReview(selectedApplication, 'rejected')"><iconify-icon icon="ri:close-line" /> Reject</button>
      <span v-if="!hasReviewPermission" class="disabled"><iconify-icon icon="ri:lock-line" /> Review unavailable</span>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import Pagination from '@/components/pagination/index.vue'
import circleService from '@/services/feetaCircleApplicationService'
import { useAuthStore } from '@/stores/auth'
import { formatDate, safeValue, titleCase } from '@/utils/finance'

const DetailGroup = defineComponent({
  props: { title: String, icon: String, items: Array },
  setup: (props) => () => h('section', { class: 'detail-group' }, [
    h('h6', [h('iconify-icon', { icon: props.icon }), props.title]),
    ...props.items.map(([label, value]) => h('div', { class: 'detail-item' }, [h('span', label), h('strong', safeValue(value))])),
  ]),
})

const auth = useAuthStore()
const rows = ref([])
const loading = ref(true)
const error = ref('')
const reviewingId = ref(null)
const expandedId = ref(null)
const manageOpen = ref(false)
const selectedApplication = ref(null)
const page = ref(1)
const total = ref(0)
const perPage = 15
const filters = reactive({ search: '', status: '' })
let searchTimer

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))
const startIndex = computed(() => total.value ? (page.value - 1) * perPage : 0)
const endIndex = computed(() => Math.min(startIndex.value + rows.value.length, total.value))
const hasReviewPermission = computed(() => auth.hasPermission('feeta_circle.application.review'))
const activeFilterCount = computed(() => [filters.search, filters.status].filter(Boolean).length)
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]
const statusCounts = computed(() => rows.value.reduce((counts, item) => {
  const status = statusKey(item.status)
  counts[status] = (counts[status] || 0) + 1
  return counts
}, { pending: 0, approved: 0, rejected: 0 }))
const statusTabOptions = computed(() => [
  { value: '', label: 'All', count: total.value },
  ...statusOptions.map((option) => ({ ...option, count: statusCounts.value[option.value] || 0 })),
])
const summaryCards = computed(() => [
  { label: 'Total applications', value: total.value, icon: 'ri:file-list-3-line', tone: 'tone-primary' },
  { label: 'Pending review', value: statusCounts.value.pending || 0, icon: 'ri:time-line', tone: 'tone-warning' },
  { label: 'Approved on page', value: statusCounts.value.approved || 0, icon: 'ri:checkbox-circle-line', tone: 'tone-success' },
  { label: 'Rejected on page', value: statusCounts.value.rejected || 0, icon: 'ri:close-circle-line', tone: 'tone-danger' },
])
const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NA'
const joinValues = (values) => Array.isArray(values) && values.length ? values.join(', ') : null
const reraKey = (value) => String(value || '').toLowerCase()
const reraLabel = (value) => {
  const key = reraKey(value)
  if (['1', 'true', 'yes', 'approved'].includes(key)) return 'RERA approved'
  if (key === 'applied') return 'RERA applied'
  return 'Not RERA approved'
}
const reraClass = (value) => {
  const key = reraKey(value)
  if (['1', 'true', 'yes', 'approved'].includes(key)) return 'is-rera-approved'
  if (key === 'applied') return 'is-rera-applied'
  return 'is-rera-missing'
}
const statusKey = (status) => String(status || 'pending').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
const statusLabel = (status) => titleCase(statusKey(status).replace(/_/g, ' '))
const statusIcon = (status) => {
  const key = statusKey(status)
  if (key === 'approved') return 'ri:checkbox-circle-line'
  if (key === 'rejected') return 'ri:close-circle-line'
  return 'ri:time-line'
}
const isPending = (status) => statusKey(status) === 'pending'
const canSetStatus = (item, status) => hasReviewPermission.value && statusKey(item.status) !== status
const submittedRelative = (value) => {
  if (!value) return 'Submission date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Submission date'
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}
const reviewState = (item) => {
  if (statusKey(item.status) === 'pending') return { label: 'Awaiting review', class: 'is-review-pending', icon: 'ri:time-line' }
  return { label: 'Review complete', class: 'is-review-complete', icon: 'ri:file-check-line' }
}

async function load(next = 1) {
  loading.value = true; error.value = ''; page.value = next
  try {
    const result = await circleService.list({ ...filters, page: next, per_page: perPage })
    rows.value = Array.isArray(result) ? result : result?.data || []
    total.value = result?.meta?.total ?? rows.value.length
    if (!rows.value.some((item) => item.application_id === expandedId.value)) expandedId.value = null
  } catch (err) {
    error.value = err.message; rows.value = []
  } finally { loading.value = false }
}

function toggleDetails(id) { expandedId.value = expandedId.value === id ? null : id }
function openManage(item) { selectedApplication.value = item; manageOpen.value = true }
async function viewDetails(item) {
  if (expandedId.value === item.application_id) {
    expandedId.value = null
    return
  }

  try {
    const detail = await circleService.show(item.application_id)
    const updated = detail?.data || detail
    const index = rows.value.findIndex((row) => row.application_id === item.application_id)
    if (index >= 0 && updated?.application_id) rows.value[index] = updated
    expandedId.value = item.application_id
  } catch (err) {
    await Swal.fire('Unable to load details', err.message, 'error')
  }
}
function clearFilters() { filters.search = ''; filters.status = ''; load(1) }
function setStatus(status) {
  if (filters.status === status) return
  filters.status = status
}

async function manageApplication(item) {
  try {
    const detail = await circleService.show(item.application_id)
    const application = detail?.data || detail || item
    const canApprove = canSetStatus(application, 'approved')
    const canReject = canSetStatus(application, 'rejected')
    const result = await Swal.fire({
      icon: 'info',
      title: `Manage application #${application.application_id}`,
      text: `${safeValue(application.full_name)} - ${safeValue(application.company_name)} - ${statusLabel(application.status)}`,
      showCancelButton: true,
      showDenyButton: canReject,
      showConfirmButton: canApprove,
      confirmButtonText: 'Approve',
      denyButtonText: 'Reject',
      cancelButtonText: 'Close',
      confirmButtonColor: '#16a34a',
      denyButtonColor: '#dc2626',
    })

    if (result.isConfirmed) await confirmReview(application, 'approved')
    if (result.isDenied) await confirmReview(application, 'rejected')
  } catch (err) {
    await Swal.fire('Unable to manage application', err.message, 'error')
  }
}

function viewDocuments() {
  // TODO: wire this to FEETA Circle application documents when the backend returns document metadata.
}

async function confirmReview(item, status) {
  if (!canSetStatus(item, status) || reviewingId.value) return
  const verb = status === 'approved' ? 'approve' : 'reject'
  const result = await Swal.fire({
    icon: status === 'approved' ? 'question' : 'warning',
    title: `${titleCase(verb)} application?`,
    text: `${titleCase(verb)} ${safeValue(item.full_name, `application #${item.application_id}`)} for FEETA Circle?`,
    showCancelButton: true,
    confirmButtonText: titleCase(verb),
    confirmButtonColor: status === 'approved' ? '#16a34a' : '#dc2626',
  })
  if (!result.isConfirmed) return

  reviewingId.value = item.application_id
  try {
    await circleService.review(item.application_id, status)
    await Swal.fire({ icon: 'success', title: `Application ${status}`, timer: 1300, showConfirmButton: false })
    await load(page.value)
  } catch (err) {
    await Swal.fire('Review failed', err.message, 'error')
  } finally { reviewingId.value = null }
}

watch(() => filters.search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => load(1), 450) })
watch(() => filters.status, () => load(1))
onMounted(load)
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<style scoped>
.circle-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border:1px solid #dfe7f2;border-radius:8px;background:linear-gradient(135deg,#102a56,#2563eb 58%,#0f766e);color:#fff;box-shadow:0 18px 36px rgba(37,99,235,.14)}
.circle-hero__content{max-width:780px}
.section-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:10px;color:#dbeafe;font-size:12px;font-weight:700;text-transform:uppercase}
.circle-hero h5{margin:0 0 7px;color:#fff;font-size:22px}
.circle-hero p{max-width:680px;margin:0;color:#e6f0ff;font-size:13px;line-height:1.55}
.circle-hero__actions .btn,.row-actions .btn,.filter-actions .btn{display:inline-flex;align-items:center;gap:6px}
.summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.summary-card{display:flex;align-items:center;gap:12px;min-height:92px;padding:16px;border:1px solid #e5ebf3;border-radius:8px;background:#fff}
.summary-icon{width:42px;height:42px;display:grid;place-items:center;flex:0 0 42px;border-radius:8px;font-size:20px}
.summary-icon.tone-primary{color:#2563eb;background:#eef5ff}.summary-icon.tone-warning{color:#a16207;background:#fffbeb}.summary-icon.tone-success{color:#15803d;background:#f0fdf4}.summary-icon.tone-danger{color:#b91c1c;background:#fff1f2}
.summary-card strong{display:block;color:#111827;font-size:24px;line-height:1}.summary-card span:last-child{display:block;margin-top:6px;color:#64748b;font-size:12px;font-weight:600}
.filter-band{display:grid;grid-template-columns:minmax(320px,1fr) auto auto;align-items:center;gap:14px;padding:16px;border:1px solid #e6ebf2;border-radius:8px;background:#fff}
.filter-band__main{display:flex;align-items:center;gap:10px;min-width:0}
.search-control{display:flex;align-items:center;gap:9px;min-height:44px;flex:1 1 360px;min-width:220px;padding:0 13px;border:1px solid #dbe2eb;border-radius:8px;background:#f8fafc;color:#64748b}
.search-control input{width:100%;border:0;outline:0;background:transparent;color:#172033}
.filter-band .form-select{width:190px;min-height:44px;border-radius:8px}
.status-tabs{display:flex;align-items:center;gap:6px;padding:4px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc}
.status-tab{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:0 11px;border:0;border-radius:6px;color:#64748b;background:transparent;font-size:12px;font-weight:700}
.status-tab span{display:grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#e7edf5;color:#334155;font-size:11px}
.status-tab.active{color:#1d4ed8;background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.08)}
.filter-actions{display:flex;justify-content:flex-end;gap:8px;white-space:nowrap}
.application-panel{overflow:hidden;border:1px solid #e6ebf2;border-radius:8px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.04)}
.table-responsive{overflow-x:auto}
.application-table{min-width:1180px;border-collapse:separate;border-spacing:0}
.application-table th{padding:11px 14px;color:#64748b;font-size:10px;font-weight:800;text-transform:uppercase;background:#f8fafc;white-space:nowrap;border-bottom:1px solid #e6ebf2}
.application-table td{padding:11px 14px;vertical-align:middle;border-bottom:1px solid #edf1f5;border-top:0;font-size:12px;background:#fff}
.application-table tbody:hover tr:not(.detail-row) td{background:#f8fbff}
.application-table tr.expanded td{background:#fbfcfe}
.application-table th:nth-child(1),.application-table td:nth-child(1){width:120px}
.application-table th:nth-child(2),.application-table td:nth-child(2){width:210px}
.application-table th:nth-child(3),.application-table td:nth-child(3){width:210px}
.application-table th:nth-child(4),.application-table td:nth-child(4){width:210px}
.application-table th:nth-child(5),.application-table td:nth-child(5){width:170px}
.application-table th:nth-child(6),.application-table td:nth-child(6){width:165px}
.application-table th:nth-child(7),.application-table td:nth-child(7){width:125px}
.application-table th:nth-child(8),.application-table td:nth-child(8){width:155px}
.application-table th:nth-child(9),.application-table td:nth-child(9){width:92px}
.expand-button{display:inline-flex;align-items:center;gap:7px;min-width:86px;border:0;color:#2563eb;background:transparent;font-weight:800}
.expand-button span{width:24px;height:24px;display:grid;place-items:center;flex:0 0 24px;border-radius:6px;background:#eff6ff}
.agent-cell{display:flex;align-items:center;gap:10px;min-width:180px}
.avatar{width:34px;height:34px;display:grid;place-items:center;flex:0 0 34px;border-radius:8px;color:#1d4ed8;background:#eaf1ff;font-size:11px;font-weight:800}
.avatar-lg{width:48px;height:48px;flex-basis:48px}
.agent-cell div,.stack-cell{display:grid;gap:3px;min-width:0}
.agent-cell strong{color:#172033}.agent-cell small,.application-table small{color:#7c889b;font-size:11px}
.cell-primary,.submitted-cell strong{overflow:hidden;color:#172033;font-size:12px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}
.rera-badge,.review-badge{display:inline-flex;align-items:center;gap:5px;width:max-content;max-width:100%;padding:4px 8px;border:1px solid;border-radius:999px;font-size:10px;font-weight:800;white-space:nowrap}
.rera-badge.is-rera-approved{color:#15803d;border-color:#bbf7d0;background:#f0fdf4}
.rera-badge.is-rera-applied{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}
.rera-badge.is-rera-missing{color:#64748b;border-color:#e2e8f0;background:#f8fafc}
.status-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid;border-radius:999px;font-size:11px;font-weight:800;text-transform:capitalize;white-space:nowrap}
.is-pending{color:#a16207;border-color:#fde68a;background:#fffbeb}.is-in_review{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}.is-approved{color:#15803d;border-color:#bbf7d0;background:#f0fdf4}.is-rejected{color:#b91c1c;border-color:#fecaca;background:#fff1f2}
.review-badge.is-review-pending{color:#a16207;border-color:#fde68a;background:#fffbeb}.review-badge.is-review-active{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}.review-badge.is-review-complete{color:#15803d;border-color:#bbf7d0;background:#f0fdf4}
.row-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;white-space:nowrap}
.icon-action{width:34px;height:34px;display:inline-grid;place-items:center;border:1px solid #dbe3ee;border-radius:8px;color:#475569;background:#fff;font-size:18px}
.icon-action:hover{color:#2563eb;border-color:#bfdbfe;background:#eff6ff}
.application-action-menu{min-width:190px;padding:7px;border:1px solid #e5eaf2;border-radius:8px;box-shadow:0 14px 32px rgba(15,23,42,.12)}
.application-action-menu .dropdown-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;font-size:12px}
.application-action-menu .dropdown-item:hover{color:#315ed1;background:#edf3ff}
.application-action-menu .dropdown-item.disabled,.application-action-menu .dropdown-item:disabled{color:#94a3b8;background:transparent}
.detail-row td{padding:0!important;background:#f8fafc!important}
.application-details{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-block-start:1px solid #e6ebf2}
.detail-intro{grid-column:1/-1;display:flex;align-items:center;gap:12px;padding:18px 20px;border-block-end:1px solid #e6ebf2;background:#fff}
.detail-intro div{display:grid;gap:4px;min-width:0}.detail-intro strong{color:#172033;font-size:15px}.detail-intro span:not(.status-badge):not(.avatar){color:#64748b;font-size:12px}.detail-intro .status-badge{margin-left:auto}
.detail-group{padding:18px 20px;border-inline-end:1px solid #e6ebf2;background:#fbfcfe}.detail-group:last-child{border:0}
.detail-group h6{display:flex;align-items:center;gap:8px;margin:0 0 14px;color:#334155;font-size:12px;font-weight:800}
.detail-group h6 iconify-icon{color:#2563eb;font-size:17px}
.detail-item{display:grid;gap:3px;margin-top:11px}.detail-item span{color:#8490a3;font-size:9px;font-weight:800;text-transform:uppercase}.detail-item strong{color:#172033;font-size:11px;font-weight:700;word-break:break-word}
.panel-footer{padding:16px 20px;border-block-start:1px solid #edf1f5}.empty-wrap{padding:36px}
@media(max-width:1399px){.filter-band{grid-template-columns:1fr}.filter-actions{justify-content:flex-start}.status-tabs{width:max-content;max-width:100%;overflow:auto}}
@media(max-width:1199px){.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.application-details{grid-template-columns:repeat(2,minmax(0,1fr))}.detail-group:nth-child(3){border-inline-end:0}.detail-group:nth-child(2),.detail-group:nth-child(3){border-block-end:1px solid #e6ebf2}}
@media(max-width:767px){.circle-hero{flex-direction:column;padding:20px}.summary-grid{grid-template-columns:1fr}.filter-band__main,.filter-actions{align-items:stretch;flex-direction:column}.filter-band .form-select,.filter-actions .btn{width:100%}.status-tabs{width:100%}.status-tab{flex:1 0 auto;justify-content:center}.application-details{grid-template-columns:1fr}.detail-intro{align-items:flex-start;flex-wrap:wrap}.detail-intro .status-badge{margin-left:0}.detail-group{border-inline-end:0;border-block-end:1px solid #e6ebf2!important}.detail-group:last-child{border-block-end:0!important}}
</style>
