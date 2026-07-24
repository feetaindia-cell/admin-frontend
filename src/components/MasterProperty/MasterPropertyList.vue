<template>
  <div class="dashboard-main-body">
<div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <LoadingState v-if="loading" :message="`Loading ${config.labelPlural.toLowerCase()}...`" />

    <template v-else>
      <div v-if="config.level > 1" class="card radius-12 mb-20">
        <div class="card-body p-16">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-12">
            <div>
              <h6 class="mb-2">Choose Category</h6>
              <p class="text-secondary-light text-sm mb-0">Show only records belonging to one category.</p>
            </div>
            <button v-if="filters.category_id" type="button" class="btn btn-outline-secondary btn-sm radius-8" @click="selectCategory('')">
              Clear selection
            </button>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button
              type="button"
              :class="['category-filter-btn', !filters.category_id ? 'is-selected' : '']"
              @click="selectCategory('')"
            >
              All Categories
              <span>{{ parentCount }}</span>
            </button>
            <button
              v-for="category in categories"
              :key="category.id"
              type="button"
              :class="['category-filter-btn', Number(filters.category_id) === Number(category.id) ? 'is-selected' : '']"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
              <span>{{ categoryRecordCount(category) }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card h-100 p-0 radius-12">
      <div class="card-header border-bottom bg-base py-16 px-24">
        <div class="master-property-toolbar">
          <select v-model="filters.per_page" class="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px" @change="fetchItems(1)">
            <option v-for="n in [10, 15, 25, 50]" :key="n" :value="n">Show {{ n }}</option>
          </select>
          <form class="navbar-search" @submit.prevent="fetchItems(1)">
            <input v-model="filters.search" type="text" class="bg-base h-40-px w-auto" :placeholder="`Search ${config.labelPlural.toLowerCase()}`" />
            <iconify-icon icon="ri:search-line" class="icon"></iconify-icon>
          </form>
          <select v-model="filters.status" class="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px" @change="fetchItems(1)">
            <option value="">All statuses</option>
            <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
          </select>
          <select v-if="config.level > 2" v-model="filters.child_id" class="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px" @change="childChanged">
            <option value="">All child groups</option>
            <option v-for="item in filterChildren" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <select v-if="config.level > 3" v-model="filters.component_id" class="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px" @change="fetchItems(1)">
            <option value="">All components</option>
            <option v-for="item in filterComponents" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        <button v-if="auth.hasPermission('master_property.create')" type="button" class="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center justify-content-center gap-2 filter-action" @click="openCreate">
          <iconify-icon icon="ri:add-line" class="icon text-xl"></iconify-icon>
          Add {{ config.label }}
        </button>
        </div>
      </div>

      <div class="card-body p-24">
        <div class="table-responsive scroll-sm">
          <table class="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th>S.L</th>
                <th>Name</th>
                <th v-if="isComponentType" class="text-center">Icon</th>
                <th v-if="config.level > 1 && !filters.category_id">Category</th>
                <th v-if="config.level > 2">Child Group</th>
                <th v-if="config.level > 3">Component</th>
                <th v-if="config.countKey" class="text-center">{{ config.countLabel }}</th>
                <th class="text-center">Status</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="item.id">
                <td>{{ startIndex + index + 1 }}</td>
                <td class="fw-medium text-primary-light">{{ item.name }}</td>
                <td v-if="isComponentType" class="text-center">
                  <img
                    v-if="item.icon_url && !item.iconLoadFailed"
                    :src="item.icon_url"
                    :alt="`${item.name || item.componentName || 'Component'} icon`"
                    class="component-list-icon"
                    @error="item.iconLoadFailed = true"
                  />
                  <span v-else class="text-secondary-light text-sm">No icon</span>
                </td>
                <td v-if="config.level > 1 && !filters.category_id">{{ item.category_name || categoryName(item.category_id) }}</td>
                <td v-if="config.level > 2">{{ item.child_name || childName(item.child_id) }}</td>
                <td v-if="config.level > 3">{{ item.component_name || componentName(item.component_id) }}</td>
                <td v-if="config.countKey" class="text-center">{{ item[config.countKey] ?? 0 }}</td>
                <td class="text-center"><MasterPropertyStatusBadge :status="item.status" /></td>
                <td class="text-center">
                  <div class="d-flex align-items-center gap-8 justify-content-center flex-wrap">
                    <router-link v-if="config.childRoute" :to="{ path: config.childRoute, query: { [config.childFilter]: item.id } }" class="bg-info-focus text-info-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" :title="config.childTitle">
                      <iconify-icon icon="ri:node-tree" class="text-xl"></iconify-icon>
                    </router-link>
                    <button v-if="auth.hasPermission('master_property.update')" type="button" class="bg-success-focus text-success-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" title="Edit" @click="openEdit(item)">
                      <iconify-icon icon="ri:edit-line" class="text-xl"></iconify-icon>
                    </button>
                    <button v-if="auth.hasPermission('master_property.status') && item.status !== 'Deleted'" type="button" class="bg-warning-focus text-warning-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" title="Change status" @click="changeStatus(item)">
                      <iconify-icon icon="ri:refresh-line" class="text-xl"></iconify-icon>
                    </button>
                    <button v-if="auth.hasPermission('master_property.delete') && item.status !== 'Deleted'" type="button" class="bg-danger-focus text-danger-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" title="Move to Deleted status" @click="deleteItem(item)">
                      <iconify-icon icon="ri:delete-bin-line" class="text-xl"></iconify-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!items.length" :icon="config.titleIcon" :title="`No ${config.labelPlural.toLowerCase()} found`" message="No records match the current filters." />
        <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="fetchItems" />
      </div>
      </div>
    </template>

    <MasterPropertyModal :open="modalOpen" :title="`${editingId ? 'Edit' : 'Add'} ${config.label}`" :saving="saving" :error="modalError" @close="closeModal" @submit="save">
      <div v-if="config.level > 1" class="mb-20">
        <label class="form-label fw-semibold">Category <span class="text-danger-600">*</span></label>
        <select v-model="form.category_id" class="form-control form-select radius-8" @change="formCategoryChanged">
          <option value="">Select category</option>
          <option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
        <div v-if="fieldError('category_id')" class="text-danger-600 text-sm mt-1">{{ fieldError('category_id') }}</div>
      </div>
      <div v-if="config.level > 2" class="mb-20">
        <label class="form-label fw-semibold">Child Group <span class="text-danger-600">*</span></label>
        <select v-model="form.child_id" class="form-control form-select radius-8" @change="formChildChanged">
          <option value="">Select child group</option>
          <option v-for="item in formChildren" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
        <div v-if="fieldError('child_id')" class="text-danger-600 text-sm mt-1">{{ fieldError('child_id') }}</div>
      </div>
      <div v-if="config.level > 3" class="mb-20">
        <label class="form-label fw-semibold">Component <span class="text-danger-600">*</span></label>
        <select v-model="form.component_id" class="form-control form-select radius-8">
          <option value="">Select component</option>
          <option v-for="item in formComponents" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
        <div v-if="fieldError('component_id')" class="text-danger-600 text-sm mt-1">{{ fieldError('component_id') }}</div>
      </div>
      <div class="mb-20">
        <label class="form-label fw-semibold">Name <span class="text-danger-600">*</span></label>
        <input v-model="form.name" type="text" class="form-control radius-8" :placeholder="`Enter ${config.label.toLowerCase()} name`" />
        <div v-if="fieldError('name')" class="text-danger-600 text-sm mt-1">{{ fieldError('name') }}</div>
      </div>
      <div>
        <label class="form-label fw-semibold">Status</label>
        <select v-model="form.status" class="form-control form-select radius-8">
          <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
      <div v-if="isComponentType" class="mt-20">
        <label class="form-label fw-semibold" for="component-icon-input">Component Icon</label>
        <p id="component-icon-help" class="text-secondary-light text-sm mb-12">SVG only, maximum 512 KB.</p>

        <div class="component-icon-uploader">
          <div v-if="selectedIconPreviewUrl" class="component-icon-section">
            <span class="text-secondary-light text-sm fw-semibold">Selected Icon Preview</span>
            <div class="component-icon-preview">
              <img :src="selectedIconPreviewUrl" :alt="`${form.name || 'Selected component'} icon preview`" />
            </div>
            <p class="text-secondary-light text-sm mb-0 selected-icon-name">{{ form.selectedIconFile?.name }}</p>
            <button
              v-if="canManageIcon"
              type="button"
              class="btn btn-outline-secondary btn-sm radius-8"
              @click="clearSelectedIcon"
            >
              Clear Selection
            </button>
          </div>

          <div v-else-if="form.existingIconUrl && !form.removeIcon" class="component-icon-section">
            <span class="text-secondary-light text-sm fw-semibold">Current Icon</span>
            <div class="component-icon-preview">
              <img
                v-if="!existingIconLoadFailed"
                :src="form.existingIconUrl"
                :alt="`${form.name || 'Component'} current icon`"
                @error="existingIconLoadFailed = true"
              />
              <span v-else class="text-secondary-light text-sm">No icon</span>
            </div>
          </div>

          <div v-else-if="form.removeIcon" class="component-icon-section">
            <span class="text-warning-600 text-sm fw-semibold">Current icon will be removed after saving.</span>
            <button
              v-if="canManageIcon"
              type="button"
              class="btn btn-outline-secondary btn-sm radius-8"
              @click="undoRemoveIcon"
            >
              Undo Remove
            </button>
          </div>

          <div v-else class="component-icon-section">
            <div class="component-icon-preview component-icon-empty">
              <span class="text-secondary-light text-sm">No icon</span>
            </div>
          </div>

          <div v-if="canManageIcon" class="component-icon-actions">
            <label class="btn btn-outline-primary-600 btn-sm radius-8 mb-0" for="component-icon-input">
              {{ form.existingIconUrl ? 'Replace Icon' : 'Select Icon' }}
            </label>
            <input
              id="component-icon-input"
              ref="iconInputRef"
              type="file"
              class="visually-hidden"
              accept=".svg,image/svg+xml"
              aria-describedby="component-icon-help component-icon-error"
              @change="selectIcon"
            />
            <button
              v-if="editingId && form.existingIconUrl && !form.removeIcon"
              type="button"
              class="btn btn-outline-danger btn-sm radius-8"
              @click="markIconForRemoval"
            >
              Remove Icon
            </button>
          </div>
        </div>

        <div v-if="iconError" id="component-icon-error" class="text-danger-600 text-sm mt-2">{{ iconError }}</div>
        <div v-else-if="fieldError('icon')" id="component-icon-error" class="text-danger-600 text-sm mt-2">{{ fieldError('icon') }}</div>
        <div v-else-if="fieldError('remove_icon')" id="component-icon-error" class="text-danger-600 text-sm mt-2">{{ fieldError('remove_icon') }}</div>
      </div>
    </MasterPropertyModal>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import MasterPropertyStatusBadge from '@/components/common/MasterPropertyStatusBadge.vue'
import MasterPropertyModal from '@/components/MasterProperty/MasterPropertyModal.vue'
import Pagination from '@/components/pagination/index.vue'
import service from '@/services/masterPropertyService'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ type: { type: String, required: true } })
const route = useRoute()
const auth = useAuthStore()
const statuses = ['Active', 'Inactive', 'Deleted']
const MAX_ICON_SIZE = 512 * 1024
const configs = {
  categories: { title: 'Categories', titleIcon: 'ri:layers-line', label: 'Category', labelPlural: 'Categories', level: 1, list: 'getCategories', create: 'createCategory', update: 'updateCategory', status: 'updateCategoryStatus', remove: 'deleteCategory', countKey: 'children_count', countLabel: 'Child Groups', childRoute: '/master-properties/children', childFilter: 'category_id', childTitle: 'View child groups' },
  children: { title: 'Child Groups', titleIcon: 'ri:node-tree', label: 'Child Group', labelPlural: 'Child Groups', level: 2, list: 'getChildren', create: 'createChild', update: 'updateChild', status: 'updateChildStatus', remove: 'deleteChild', countKey: 'components_count', countLabel: 'Components', childRoute: '/master-properties/components', childFilter: 'child_id', childTitle: 'View components' },
  components: { title: 'Components', titleIcon: 'ri:puzzle-line', label: 'Component', labelPlural: 'Components', level: 3, list: 'getComponents', create: 'createComponent', update: 'updateComponent', status: 'updateComponentStatus', remove: 'deleteComponent', countKey: 'options_count', countLabel: 'Options', childRoute: '/master-properties/options', childFilter: 'component_id', childTitle: 'View options' },
  options: { title: 'Option Values', titleIcon: 'ri:checkbox-multiple-line', label: 'Option', labelPlural: 'Options', level: 4, list: 'getOptions', create: 'createOption', update: 'updateOption', status: 'updateOptionStatus', remove: 'deleteOption' },
}
const config = computed(() => configs[props.type])
const isComponentType = computed(() => props.type === 'components')
const items = ref([])
const categories = ref([])
const children = ref([])
const components = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const total = ref(0)
const modalOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)
const modalError = ref('')
const errors = ref({})
const iconError = ref('')
const iconInputRef = ref(null)
const selectedIconPreviewUrl = ref('')
const existingIconLoadFailed = ref(false)
const filters = reactive({ search: String(route.query.search || ''), status: '', category_id: '', child_id: '', component_id: '', per_page: 10, sort_direction: 'desc' })
const form = reactive({ name: '', status: 'Active', category_id: '', child_id: '', component_id: '', existingIconUrl: null, selectedIconFile: null, removeIcon: false })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / Number(filters.per_page))))
const startIndex = computed(() => total.value ? (page.value - 1) * Number(filters.per_page) : 0)
const endIndex = computed(() => Math.min(startIndex.value + items.value.length, total.value))
const filterChildren = computed(() => children.value.filter((item) => !filters.category_id || Number(item.category_id) === Number(filters.category_id)))
const filterComponents = computed(() => components.value.filter((item) => !filters.child_id || Number(item.child_id) === Number(filters.child_id)))
const formChildren = computed(() => children.value.filter((item) => !form.category_id || Number(item.category_id) === Number(form.category_id)))
const formComponents = computed(() => components.value.filter((item) => !form.child_id || Number(item.child_id) === Number(form.child_id)))
const canManageIcon = computed(() => {
  if (!isComponentType.value) return false
  return editingId.value ? auth.hasPermission('master_property.update') : auth.hasPermission('master_property.create')
})
const parentCount = computed(() => {
  if (config.value.level === 2) return categories.value.reduce((total, category) => total + (category.children?.length || 0), 0)
  if (config.value.level === 3) return categories.value.reduce((total, category) => total + (category.children || []).reduce((sum, child) => sum + (child.components?.length || 0), 0), 0)
  return categories.value.reduce((total, category) => total + (category.children || []).reduce((sum, child) => sum + (child.components || []).reduce((count, component) => count + (component.options?.length || 0), 0), 0), 0)
})

const normalize = (payload) => {
  const data = Array.isArray(payload) ? payload : payload?.data || []
  return { data, total: payload?.meta?.total ?? payload?.total ?? data.length }
}
const categoryName = (id) => categories.value.find((item) => Number(item.id) === Number(id))?.name || '-'
const childName = (id) => children.value.find((item) => Number(item.id) === Number(id))?.name || '-'
const componentName = (id) => components.value.find((item) => Number(item.id) === Number(id))?.name || '-'
const fieldError = (key) => errors.value?.[key]?.[0] || ''
const isSvgFile = (file) => {
  const extensionValid = file?.name?.toLowerCase().endsWith('.svg')
  const mimeValid = !file?.type || ['image/svg+xml', 'text/xml', 'application/xml'].includes(file.type)
  return Boolean(extensionValid && mimeValid)
}

async function loadParents() {
  const tree = await service.getTree()
  categories.value = tree || []
  children.value = categories.value.flatMap((category) => (category.children || []).map((child) => ({ ...child, category_id: category.id, category_name: category.name })))
  components.value = children.value.flatMap((child) => (child.components || []).map((component) => ({ ...component, child_id: child.id, child_name: child.name, category_id: child.category_id, category_name: child.category_name })))
}

async function fetchItems(nextPage = 1) {
  loading.value = true
  error.value = ''
  try {
    page.value = nextPage
    const result = normalize(await service[config.value.list]({ ...filters, page: nextPage }))
    items.value = result.data.map((item) => ({ ...item, iconLoadFailed: false }))
    total.value = result.total
  } catch (err) {
    items.value = []
    total.value = 0
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function resetForm() {
  resetIconState()
  Object.assign(form, { name: '', status: 'Active', category_id: '', child_id: '', component_id: '', existingIconUrl: null, selectedIconFile: null, removeIcon: false })
  errors.value = {}
  modalError.value = ''
}
function openCreate() {
  editingId.value = null
  resetForm()
  if (filters.category_id) form.category_id = filters.category_id
  if (filters.child_id) form.child_id = filters.child_id
  if (filters.component_id) form.component_id = filters.component_id
  modalOpen.value = true
}
function openEdit(item) {
  editingId.value = item.id
  Object.assign(form, {
    name: item.name || '',
    status: item.status || 'Active',
    category_id: item.category_id || '',
    child_id: item.child_id || '',
    component_id: item.component_id || '',
    existingIconUrl: isComponentType.value ? (item.icon_url || null) : null,
    selectedIconFile: null,
    removeIcon: false,
  })
  resetIconState({ preserveExistingUrl: true })
  errors.value = {}
  modalError.value = ''
  modalOpen.value = true
}
function closeModal() {
  modalOpen.value = false
  resetIconState()
}
function formCategoryChanged() {
  form.child_id = ''
  form.component_id = ''
}
function formChildChanged() {
  form.component_id = ''
}
function categoryChanged() {
  filters.child_id = ''
  filters.component_id = ''
  fetchItems(1)
}
function selectCategory(categoryId) {
  filters.category_id = categoryId
  categoryChanged()
}
function categoryRecordCount(category) {
  if (config.value.level === 2) return category.children?.length || 0
  if (config.value.level === 3) {
    return (category.children || []).reduce((total, child) => total + (child.components?.length || 0), 0)
  }
  return (category.children || []).reduce(
    (total, child) => total + (child.components || []).reduce((count, component) => count + (component.options?.length || 0), 0),
    0,
  )
}
function childChanged() {
  filters.component_id = ''
  fetchItems(1)
}

async function save() {
  if (iconError.value) return
  saving.value = true
  errors.value = {}
  modalError.value = ''
  try {
    const payload = { name: form.name, status: form.status }
    if (config.value.level === 2) payload.category_id = form.category_id
    if (config.value.level === 3) payload.child_id = form.child_id
    if (config.value.level === 4) payload.component_id = form.component_id
    if (isComponentType.value && form.selectedIconFile) payload.icon = form.selectedIconFile
    if (isComponentType.value && editingId.value && form.removeIcon && !form.selectedIconFile) payload.remove_icon = true
    if (editingId.value) await service[config.value.update](editingId.value, payload)
    else await service[config.value.create](payload)
    closeModal()
    await Promise.all([loadParents(), fetchItems(page.value)])
    await Swal.fire({ title: 'Saved', text: `${config.value.label} saved successfully.`, icon: 'success', timer: 1300, showConfirmButton: false })
  } catch (err) {
    errors.value = err.errors || {}
    modalError.value = err.message
  } finally {
    saving.value = false
  }
}

function selectIcon(event) {
  iconError.value = ''
  const file = event.target.files?.[0]
  if (!file) return

  if (!isSvgFile(file)) {
    iconError.value = 'Please select an SVG file.'
    clearSelectedIcon()
    return
  }

  if (file.size > MAX_ICON_SIZE) {
    iconError.value = 'The SVG icon must not exceed 512 KB.'
    clearSelectedIcon()
    return
  }

  revokePreviewUrl()
  form.selectedIconFile = file
  form.removeIcon = false
  selectedIconPreviewUrl.value = URL.createObjectURL(file)
  if (iconInputRef.value) iconInputRef.value.value = ''
}

function clearSelectedIcon() {
  revokePreviewUrl()
  form.selectedIconFile = null
  if (iconInputRef.value) iconInputRef.value.value = ''
}

function markIconForRemoval() {
  clearSelectedIcon()
  form.removeIcon = true
  iconError.value = ''
}

function undoRemoveIcon() {
  form.removeIcon = false
  existingIconLoadFailed.value = false
}

function resetIconState(options = {}) {
  revokePreviewUrl()
  form.selectedIconFile = null
  form.removeIcon = false
  if (!options.preserveExistingUrl) form.existingIconUrl = null
  iconError.value = ''
  existingIconLoadFailed.value = false
  if (iconInputRef.value) iconInputRef.value.value = ''
}

function revokePreviewUrl() {
  if (selectedIconPreviewUrl.value) {
    URL.revokeObjectURL(selectedIconPreviewUrl.value)
    selectedIconPreviewUrl.value = ''
  }
}

async function changeStatus(item) {
  const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active'
  const result = await Swal.fire({ title: `Set ${nextStatus}?`, text: item.name, icon: 'question', showCancelButton: true, confirmButtonText: `Set ${nextStatus}` })
  if (!result.isConfirmed) return
  try {
    await service[config.value.status](item.id, nextStatus)
    await Promise.all([loadParents(), fetchItems(page.value)])
  } catch (err) {
    await Swal.fire('Unable to update status', err.message, 'error')
  }
}

async function deleteItem(item) {
  const result = await Swal.fire({ title: 'Move to Deleted status?', text: `${item.name} and dependent values may also be marked Deleted.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Move to Deleted' })
  if (!result.isConfirmed) return
  try {
    await service[config.value.remove](item.id)
    await Promise.all([loadParents(), fetchItems(page.value)])
  } catch (err) {
    await Swal.fire('Unable to delete', err.message, 'error')
  }
}

watch(() => filters.search, () => fetchItems(1))
watch(() => route.query, (query) => {
  const nextSearch = String(query.search || '')
  const nextCategoryId = query.category_id || ''
  const nextChildId = query.child_id || ''
  const nextComponentId = query.component_id || ''
  const searchChanged = nextSearch !== filters.search
  const hierarchyChanged = nextCategoryId !== filters.category_id || nextChildId !== filters.child_id || nextComponentId !== filters.component_id

  filters.search = nextSearch
  filters.category_id = nextCategoryId
  filters.child_id = nextChildId
  filters.component_id = nextComponentId

  if (hierarchyChanged && !searchChanged) fetchItems(1)
})
onMounted(async () => {
  filters.search = String(route.query.search || '')
  filters.category_id = route.query.category_id || ''
  filters.child_id = route.query.child_id || ''
  filters.component_id = route.query.component_id || ''
  try {
    await loadParents()
  } catch (err) {
    error.value = err.message
  }
  await fetchItems()
})
onBeforeUnmount(() => {
  revokePreviewUrl()
})
</script>

<style scoped>
.category-filter-btn {
  align-items: center;
  background: var(--white);
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  color: var(--text-primary-light);
  display: inline-flex;
  font-size: 14px;
  font-weight: 600;
  gap: 8px;
  padding: 8px 12px;
}

.category-filter-btn span {
  background: var(--neutral-100);
  border-radius: 12px;
  color: var(--text-secondary-light);
  font-size: 12px;
  padding: 2px 7px;
}

.category-filter-btn:hover,
.category-filter-btn.is-selected {
  background: var(--primary-50);
  border-color: var(--primary-600);
  color: var(--primary-600);
}

.category-filter-btn.is-selected span {
  background: var(--primary-600);
  color: var(--white);
}

.master-property-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.filter-action {
  flex: 0 1 auto;
}

.component-list-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.component-icon-uploader {
  align-items: flex-start;
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 14px;
}

.component-icon-section,
.component-icon-actions {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.component-icon-preview {
  align-items: center;
  background: var(--neutral-50);
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  display: grid;
  height: 72px;
  justify-items: center;
  place-items: center;
  width: 72px;
}

.component-icon-preview img {
  height: 36px;
  object-fit: contain;
  width: 36px;
}

.component-icon-empty {
  color: var(--text-secondary-light);
}

.selected-icon-name {
  max-width: 220px;
  overflow-wrap: anywhere;
}

@media (max-width: 768px) {
  .filter-action {
    width: 100%;
    flex: 1 1 100%;
  }

  .component-icon-uploader {
    flex-direction: column;
  }
}
</style>
