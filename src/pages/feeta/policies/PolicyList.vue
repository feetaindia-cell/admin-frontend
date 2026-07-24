<template>
  <div class="dashboard-main-body policy-page">
<div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>

    <div class="card radius-12">
      <div class="card-header border-bottom bg-base p-20">
        <div class="policy-toolbar">
          <form class="navbar-search policy-search" @submit.prevent="load(1)">
            <input v-model="filters.search" type="search" class="bg-base h-40-px" placeholder="Search title, content, type, section or status" />
            <iconify-icon icon="ri:search-line" class="icon" />
          </form>
          <select v-model="filters.policy_type" class="form-select h-40-px" aria-label="Policy type">
            <option value="">All policy types</option>
            <option v-for="type in types" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
          <select v-model="filters.status" class="form-select h-40-px" aria-label="Status">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select v-model="filters.sort_by" class="form-select h-40-px" aria-label="Sort field">
            <option value="policy_type">Sort: Policy type</option>
            <option value="section_no">Sort: Section number</option>
            <option value="title">Sort: Title</option>
            <option value="updated_at">Sort: Last updated</option>
            <option value="id">Sort: ID</option>
          </select>
          <select v-model="filters.sort_direction" class="form-select h-40-px" aria-label="Sort direction">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <select v-model.number="filters.per_page" class="form-select h-40-px policy-per-page" aria-label="Rows per page">
            <option v-for="size in [10, 15, 25, 50]" :key="size" :value="size">{{ size }} rows</option>
          </select>
          <button type="button" class="btn btn-outline-primary-600 h-40-px" :disabled="loading" @click="load(page)"><iconify-icon icon="ri:refresh-line" class="me-6" />Refresh</button>
          <button type="button" class="btn btn-outline-secondary h-40-px" @click="clearFilters"><iconify-icon icon="ri:filter-off-line" class="me-6" />Clear</button>
          <router-link v-if="auth.hasPermission('policy.reorder')" :to="reorderPath" class="btn btn-outline-primary-600 h-40-px"><iconify-icon icon="ri:sort-asc" class="me-6" />Reorder</router-link>
          <router-link v-if="auth.hasPermission('policy.create')" to="/policies/create" class="btn btn-primary-600 h-40-px"><iconify-icon icon="ri:add-line" class="me-6" />Create Section</router-link>
        </div>
      </div>

      <LoadingState v-if="loading" message="Loading policy sections..." />
      <div v-else class="card-body p-0">
        <div v-if="policies.length" class="table-responsive policy-table-wrap">
          <table class="table bordered-table sm-table mb-0 policy-table">
            <thead>
              <tr>
                <th>ID</th><th>Policy Type</th><th>Section No</th><th>Title</th><th>Status</th><th>Updated At</th><th class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="policy in policies" :key="policy.id" class="manage-row">
                <td>#{{ policy.id }}</td>
                <td><router-link :to="`/policies/type/${policy.policy_type}`" class="badge bg-primary-focus text-primary-600 text-capitalize" @click.stop>{{ displayType(policy.policy_type) }}</router-link></td>
                <td>{{ policy.section_no }}</td>
                <td><div class="policy-title fw-semibold" :title="policy.title">{{ policy.title || 'Untitled section' }}</div></td>
                <td><StatusBadge :status="policy.is_active ? 'Active' : 'Inactive'" /></td>
                <td>{{ formatDate(policy.updated_at) }}</td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(policy)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else icon="ri:file-shield-2-line" title="No policy sections found" message="No policy sections match the current filters." />
        <div v-if="policies.length" class="px-24 pb-24">
          <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="load" />
        </div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedPolicy?.title || 'Untitled section'" :subtitle="selectedPolicy ? displayType(selectedPolicy.policy_type) : ''">
      <router-link v-if="selectedPolicy" :to="`/policies/${selectedPolicy.id}`"><iconify-icon icon="ri:eye-line" /> View section</router-link>
      <router-link v-if="selectedPolicy && auth.hasPermission('policy.update')" :to="`/policies/${selectedPolicy.id}/edit`"><iconify-icon icon="ri:edit-line" /> Edit section</router-link>
      <button v-if="selectedPolicy && auth.hasPermission('policy.status')" type="button" :disabled="actionId === selectedPolicy.id" @click="toggleStatus(selectedPolicy)"><iconify-icon :icon="selectedPolicy.is_active ? 'ri:pause-circle-line' : 'ri:play-circle-line'" /> {{ selectedPolicy.is_active ? 'Deactivate' : 'Activate' }}</button>
      <button v-if="selectedPolicy && auth.hasPermission('policy.delete') && selectedPolicy.is_active" type="button" class="text-danger" :disabled="actionId === selectedPolicy.id" @click="deactivate(selectedPolicy)"><iconify-icon icon="ri:archive-line" /> Move to inactive</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import Pagination from '@/components/pagination/index.vue'
import policyService from '@/services/policyService'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const policies = ref([])
const types = ref([])
const loading = ref(false)
const error = ref('')
const actionId = ref(null)
const manageOpen = ref(false)
const selectedPolicy = ref(null)
const page = ref(1)
const total = ref(0)
const filters = reactive({ search: String(route.query.search || ''), policy_type: '', status: '', sort_by: 'policy_type', sort_direction: 'asc', per_page: 15 })
let searchTimer

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / Number(filters.per_page))))
const startIndex = computed(() => total.value ? (page.value - 1) * Number(filters.per_page) : 0)
const endIndex = computed(() => Math.min(startIndex.value + policies.value.length, total.value))
const reorderPath = computed(() => filters.policy_type ? `/policies/type/${filters.policy_type}?reorder=1` : '/policies/types')

const displayType = (value) => String(value || '').replaceAll('_', ' ')
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-'
function openManage(policy) { selectedPolicy.value = policy; manageOpen.value = true }

function normalize(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || []
  return { items, total: payload?.meta?.total ?? payload?.total ?? items.length }
}

async function load(nextPage = 1) {
  loading.value = true
  error.value = ''
  page.value = nextPage
  try {
    const payload = normalize(await policyService.getPolicies({ ...filters, page: nextPage }))
    policies.value = payload.items
    total.value = payload.total
  } catch (err) {
    policies.value = []
    total.value = 0
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  Object.assign(filters, { search: '', policy_type: '', status: '', sort_by: 'policy_type', sort_direction: 'asc', per_page: 15 })
  load(1)
}

async function toggleStatus(policy) {
  const next = !policy.is_active
  const result = await Swal.fire({ title: next ? 'Activate section?' : 'Deactivate section?', text: policy.title, icon: next ? 'question' : 'warning', showCancelButton: true, confirmButtonText: next ? 'Activate' : 'Deactivate' })
  if (!result.isConfirmed) return
  actionId.value = policy.id
  try {
    await policyService.updatePolicyStatus(policy.id, { is_active: next })
    await Swal.fire({ icon: 'success', title: `Section ${next ? 'activated' : 'deactivated'}`, timer: 1200, showConfirmButton: false })
    await load(page.value)
  } catch (err) {
    await Swal.fire('Status update failed', err.message, 'error')
  } finally {
    actionId.value = null
  }
}

async function deactivate(policy) {
  const result = await Swal.fire({ title: 'Move section to inactive?', text: 'The section remains stored and can be activated again later.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Move to Inactive' })
  if (!result.isConfirmed) return
  actionId.value = policy.id
  try {
    await policyService.deletePolicy(policy.id)
    await Swal.fire({ icon: 'success', title: 'Section moved to inactive', timer: 1200, showConfirmButton: false })
    await load(page.value)
  } catch (err) {
    await Swal.fire('Deactivate failed', err.message, 'error')
  } finally {
    actionId.value = null
  }
}

watch(() => filters.search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => load(1), 400) })
watch(() => [filters.policy_type, filters.status, filters.sort_by, filters.sort_direction, filters.per_page], () => load(1))
watch(() => route.query.search, (value) => { filters.search = String(value || '') })

onMounted(async () => {
  try { types.value = (await policyService.getPolicyTypes()) || [] } catch { types.value = [] }
  await load()
})
</script>

<style scoped>
.policy-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:10px}.policy-toolbar .form-select{width:auto;min-width:150px}.policy-search{flex:1 1 280px;min-width:220px}.policy-search input{width:100%}.policy-per-page{min-width:110px!important}.policy-table{table-layout:fixed;width:100%}.policy-table th:nth-child(1){width:70px}.policy-table th:nth-child(2){width:140px}.policy-table th:nth-child(3){width:105px}.policy-table th:nth-child(5){width:110px}.policy-table th:nth-child(6){width:170px}.policy-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.action-btn{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;font-size:18px}.is-view{color:#0284c7;background:#e0f2fe}.is-edit{color:#15803d;background:#dcfce7}.is-status{color:#7c3aed;background:#ede9fe}.is-delete{color:#b45309;background:#fef3c7}@media(max-width:767px){.policy-toolbar>*{width:100%!important}.policy-search{min-width:100%}.policy-table{table-layout:auto}.policy-table-wrap{overflow-x:auto}}
</style>
