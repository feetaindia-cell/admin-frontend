<template>
  <div class="dashboard-main-body location-management-page">
    <div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>

    <div class="location-topbar">
      <div>
        <div class="location-crumbs">
          <button type="button" class="crumb-link" @click="goStates">States</button>
          <template v-if="selectedState">
            <span>/</span>
            <button type="button" class="crumb-link" @click="goCities(selectedState)">{{ selectedState.name }}</button>
          </template>
          <template v-if="selectedCity">
            <span>/</span>
            <span>{{ selectedCity.name }}</span>
          </template>
        </div>
        <h5 class="mb-0">{{ pageTitle }}</h5>
      </div>
      <button v-if="canCreate" type="button" class="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2" @click="openCreate">
        <iconify-icon icon="ri:add-line" class="text-xl"></iconify-icon>
        Add {{ activeConfig.label }}
      </button>
    </div>

    <LoadingState v-if="loading" :message="`Loading ${activeConfig.labelPlural.toLowerCase()}...`" />

    <div v-else class="card h-100 p-0 radius-12">
      <div class="card-header bg-base border-bottom p-20">
        <div class="location-toolbar">
          <form class="navbar-search" @submit.prevent="loadRows(1)">
            <input v-model="search" type="text" class="bg-base h-40-px w-auto" :placeholder="`Search ${activeConfig.labelPlural.toLowerCase()}`" />
            <iconify-icon icon="ri:search-line" class="icon"></iconify-icon>
          </form>
          <select v-model="statusFilter" class="form-select location-status-filter" @change="loadRows(1)">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="button" class="btn btn-outline-primary-600 btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2" @click="loadRows(page)">
            <iconify-icon icon="ri:refresh-line" class="text-lg"></iconify-icon>
            Refresh
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="rows.length" class="table-responsive scroll-sm">
          <table class="table bordered-table sm-table mb-0 location-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>{{ activeConfig.nameColumn }}</th>
                <th v-if="view === 'states'">Country</th>
                <th v-if="view === 'states'">Cities</th>
                <th v-if="view === 'cities'">Localities</th>
                <th v-if="view === 'localities'">Pincode</th>
                <th>Status</th>
                <th>Created At</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in rows" :key="row.id" class="location-row" :class="{ 'is-inactive': isInactive(row) }" @click="openChild(row)">
                <td>{{ rowNumber(index) }}</td>
                <td>
                  <div class="fw-medium text-primary-light">{{ row.name }}</div>
                  <div v-if="view === 'localities'" class="text-secondary-light text-xs">{{ selectedCity?.name }}</div>
                </td>
                <td v-if="view === 'states'">{{ row.country || '-' }}</td>
                <td v-if="view === 'states'">{{ row.cities_count ?? '-' }}</td>
                <td v-if="view === 'cities'">{{ row.localities_count ?? '-' }}</td>
                <td v-if="view === 'localities'">{{ row.pincode || '-' }}</td>
                <td>
                  <span class="status-badge" :class="isInactive(row) ? 'inactive' : 'active'">{{ isInactive(row) ? 'Inactive' : 'Active' }}</span>
                </td>
                <td>{{ formatDate(row.created_at) }}</td>
                <td class="text-center" @click.stop>
                  <div class="d-flex align-items-center gap-8 justify-content-center flex-wrap">
                    <button v-if="canEdit" type="button" class="bg-success-focus text-success-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" title="Edit" @click="openEdit(row)">
                      <iconify-icon icon="ri:edit-line" class="text-xl"></iconify-icon>
                    </button>
                    <button v-if="canDelete && !isInactive(row)" type="button" class="bg-danger-focus text-danger-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" title="Make inactive" @click="updateRowStatus(row, 'inactive')">
                      <iconify-icon icon="ri:pause-circle-line" class="text-xl"></iconify-icon>
                    </button>
                    <button v-if="canDelete && isInactive(row)" type="button" class="bg-success-focus text-success-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" title="Make active" @click="updateRowStatus(row, 'active')">
                      <iconify-icon icon="ri:play-circle-line" class="text-xl"></iconify-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-24">
          <EmptyState :icon="activeConfig.icon" :title="`No ${activeConfig.labelPlural.toLowerCase()} found`" message="No records match the current view." />
        </div>

        <div v-if="view !== 'states' && rows.length" class="px-24 pb-24">
          <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="loadRows" />
        </div>
      </div>
    </div>

    <MasterPropertyModal :open="modalOpen" :title="`${editingId ? 'Edit' : 'Add'} ${activeConfig.label}`" :saving="saving" :error="modalError" @close="closeModal" @submit="save">
      <div class="mb-20">
        <label class="form-label fw-semibold">{{ activeConfig.nameColumn }} <span class="text-danger-600">*</span></label>
        <input v-model="form.name" type="text" class="form-control radius-8" :maxlength="activeConfig.maxName" :placeholder="`Enter ${activeConfig.label.toLowerCase()} name`" />
        <div v-if="fieldError('name')" class="text-danger-600 text-sm mt-1">{{ fieldError('name') }}</div>
      </div>

      <div v-if="view === 'states'" class="mb-20">
        <label class="form-label fw-semibold">Country</label>
        <input v-model="form.country" type="text" class="form-control radius-8" maxlength="100" placeholder="India" />
        <div v-if="fieldError('country')" class="text-danger-600 text-sm mt-1">{{ fieldError('country') }}</div>
      </div>

      <div v-if="view === 'localities'">
        <label class="form-label fw-semibold">Pincode <span class="text-danger-600">*</span></label>
        <input v-model="form.pincode" type="text" class="form-control radius-8" maxlength="20" placeholder="Enter pincode" />
        <div v-if="fieldError('pincode')" class="text-danger-600 text-sm mt-1">{{ fieldError('pincode') }}</div>
      </div>
    </MasterPropertyModal>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import MasterPropertyModal from '@/components/MasterProperty/MasterPropertyModal.vue'
import Pagination from '@/components/pagination/index.vue'
import service from '@/services/locationService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const perPage = 30
const toast = Swal.mixin({ toast: true, position: 'top-end', timer: 1800, showConfirmButton: false, timerProgressBar: true })

const configs = {
  states: {
    label: 'State',
    labelPlural: 'States',
    nameColumn: 'State Name',
    icon: 'ri:map-line',
    list: 'getStates',
    create: 'createState',
    update: 'updateState',
    remove: 'deleteState',
    restore: 'restoreState',
    updateStatus: 'updateStateStatus',
    createPermission: 'state.create',
    editPermission: 'state.edit',
    deletePermission: 'state.delete',
    maxName: 100,
  },
  cities: {
    label: 'City',
    labelPlural: 'Cities',
    nameColumn: 'City Name',
    icon: 'ri:building-line',
    list: 'getCities',
    create: 'createCity',
    update: 'updateCity',
    remove: 'deleteCity',
    restore: 'restoreCity',
    updateStatus: 'updateCityStatus',
    createPermission: 'city.create',
    editPermission: 'city.edit',
    deletePermission: 'city.delete',
    maxName: 150,
  },
  localities: {
    label: 'Locality',
    labelPlural: 'Localities',
    nameColumn: 'Locality',
    icon: 'ri:map-pin-line',
    list: 'getLocalities',
    create: 'createLocality',
    update: 'updateLocality',
    remove: 'deleteLocality',
    restore: 'restoreLocality',
    updateStatus: 'updateLocalityStatus',
    createPermission: 'locality.create',
    editPermission: 'locality.edit',
    deletePermission: 'locality.delete',
    maxName: 200,
  },
}

const rows = ref([])
const selectedState = ref(null)
const selectedCity = ref(null)
const loading = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const total = ref(0)
const modalOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)
const modalError = ref('')
const errors = ref({})
const form = reactive({ name: '', country: 'India', pincode: '' })

const view = computed(() => route.params.cityId ? 'localities' : route.params.stateId ? 'cities' : 'states')
const activeConfig = computed(() => configs[view.value])
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))
const startIndex = computed(() => total.value ? (page.value - 1) * perPage : 0)
const endIndex = computed(() => Math.min(startIndex.value + rows.value.length, total.value))
const canCreate = computed(() => auth.hasPermission(activeConfig.value.createPermission))
const canEdit = computed(() => auth.hasPermission(activeConfig.value.editPermission))
const canDelete = computed(() => auth.hasPermission(activeConfig.value.deletePermission))
const pageTitle = computed(() => {
  if (view.value === 'cities') return `${selectedState.value?.name || 'State'} Cities`
  if (view.value === 'localities') return `${selectedCity.value?.name || 'City'} Localities`
  return 'Location Management'
})

const normalize = (payload) => {
  const data = Array.isArray(payload) ? payload : payload?.data || []
  return { data, total: payload?.meta?.total ?? payload?.total ?? data.length }
}
const fieldError = (key) => errors.value?.[key]?.[0] || ''
const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
const rowNumber = (index) => view.value === 'states' ? index + 1 : startIndex.value + index + 1
const isInactive = (row) => String(row?.status || 'active').toLowerCase() === 'inactive'

function routeId(key) {
  return route.params[key] ? Number(route.params[key]) : null
}

async function loadContext() {
  selectedState.value = null
  selectedCity.value = null
  const stateId = routeId('stateId')
  const cityId = routeId('cityId')
  if (stateId) selectedState.value = await service.getState(stateId)
  if (cityId) selectedCity.value = await service.getCity(cityId)
}

async function loadRows(nextPage = 1) {
  loading.value = true
  error.value = ''
  try {
    page.value = nextPage
    await loadContext()
    const params = { search: search.value, status: statusFilter.value, sort_by: 'name', sort_direction: 'asc' }
    if (view.value === 'states') {
      const allStates = await service.getAllStates({ ...params })
      rows.value = allStates
      total.value = allStates.length
      return
    }
    const result = normalize(await service[activeConfig.value.list]({
      ...params,
      page: nextPage,
      per_page: perPage,
      state_id: routeId('stateId'),
      city_id: routeId('cityId'),
    }))
    rows.value = result.data
    total.value = result.total
  } catch (err) {
    rows.value = []
    total.value = 0
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function goStates() {
  router.push('/master/locations')
}

function goCities(state) {
  router.push(`/master/locations/states/${state.id}/cities`)
}

function openChild(row) {
  if (view.value === 'states' && auth.hasPermission('city.view')) {
    goCities(row)
  } else if (view.value === 'cities' && auth.hasPermission('locality.view')) {
    router.push(`/master/locations/states/${routeId('stateId')}/cities/${row.id}/localities`)
  }
}

function resetForm() {
  Object.assign(form, { name: '', country: 'India', pincode: '' })
  errors.value = {}
  modalError.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  modalOpen.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, { name: row.name || '', country: row.country || 'India', pincode: row.pincode || '' })
  errors.value = {}
  modalError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function payloadForView() {
  if (view.value === 'states') return { name: form.name, country: form.country || 'India' }
  if (view.value === 'cities') return { name: form.name, state_id: routeId('stateId') }
  return { name: form.name, city_id: routeId('cityId'), pincode: form.pincode }
}

async function save() {
  saving.value = true
  errors.value = {}
  modalError.value = ''
  try {
    const payload = payloadForView()
    if (editingId.value) await service[activeConfig.value.update](editingId.value, payload)
    else await service[activeConfig.value.create](payload)
    closeModal()
    await loadRows(view.value === 'states' ? 1 : page.value)
    await toast.fire({ icon: 'success', title: `${activeConfig.value.label} saved successfully.` })
  } catch (err) {
    errors.value = err.errors || {}
    modalError.value = err.message
  } finally {
    saving.value = false
  }
}

async function updateRowStatus(row, status) {
  const active = status === 'active'
  const text = view.value === 'states'
    ? `${row.name} and its cities/localities will be marked ${status}.`
    : view.value === 'cities'
      ? `${row.name} and its localities will be marked ${status}.`
      : row.name
  const result = await Swal.fire({
    title: `Make ${activeConfig.value.label.toLowerCase()} ${status}?`,
    text,
    icon: active ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonText: active ? 'Make Active' : 'Make Inactive',
    confirmButtonColor: active ? '#16a34a' : '#dc2626',
  })
  if (!result.isConfirmed) return

  try {
    await service[activeConfig.value.updateStatus](row.id, status)
    await loadRows(page.value)
    await toast.fire({ icon: 'success', title: `${activeConfig.value.label} marked ${status}.` })
  } catch (err) {
    await Swal.fire('Unable to update status', err.message, 'error')
  }
}

let searchTimer
watch(search, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => loadRows(1), 250)
})

watch(() => route.fullPath, () => {
  search.value = ''
  statusFilter.value = ''
  loadRows(1)
})

onMounted(() => loadRows())
</script>

<style scoped>
.location-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.location-topbar,
.location-toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
}

.location-crumbs {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  gap: 6px;
  margin-bottom: 4px;
}

.crumb-link {
  background: transparent;
  border: 0;
  color: #2563eb;
  font: inherit;
  padding: 0;
}

.location-row {
  cursor: pointer;
}

.location-row:hover {
  background: rgba(37, 99, 235, .04);
}

.location-row.is-inactive {
  background: #fff7f7;
}

.location-row.is-inactive .text-primary-light {
  color: #7f1d1d !important;
}

.status-badge {
  border-radius: 999px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  padding: 6px 10px;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.location-status-filter {
  min-height: 40px;
  max-width: 160px;
}

@media (max-width: 768px) {
  .location-topbar > .btn,
  .location-toolbar .navbar-search,
  .location-toolbar .btn {
    width: 100%;
  }
}
</style>
