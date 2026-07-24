<template>
  <div class="dashboard-main-body">
<div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>

    <div class="row gy-4 mb-24">
      <div v-for="metric in metrics" :key="metric.label" class="col-xxl-3 col-sm-6">
        <div class="card px-24 py-16 shadow-none border radius-12 h-100">
          <div class="d-flex align-items-center justify-content-between gap-2">
            <div>
              <span class="fw-medium text-secondary-light">{{ metric.label }}</span>
              <h5 class="fw-semibold mb-0 mt-4">{{ metric.value }}</h5>
            </div>
            <span :class="`w-48-px h-48-px bg-${metric.color}-600 text-white rounded-circle d-flex justify-content-center align-items-center text-2xl`">
              <iconify-icon :icon="metric.icon"></iconify-icon>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card radius-12 mb-24">
      <div class="card-body p-20">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h6 class="mb-4">Browse the hierarchy from left to right</h6>
            <p class="text-secondary-light mb-0">Select one item in each column to see the next level.</p>
          </div>
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <form class="navbar-search" @submit.prevent>
              <input v-model="search" type="text" class="bg-base h-40-px w-auto" placeholder="Search current lists" />
              <iconify-icon icon="ri:search-line" class="icon"></iconify-icon>
            </form>
            <select v-model="status" class="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px">
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Deleted">Deleted</option>
            </select>
            <button type="button" class="btn btn-outline-primary-600 text-sm px-12 py-10 radius-8" :disabled="loading" @click="loadTree">
              <iconify-icon icon="ri:refresh-line" class="me-1"></iconify-icon>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <LoadingState v-if="loading" message="Loading master property hierarchy..." />

    <template v-else>
      <div class="card radius-12 mb-24">
        <div class="card-body p-16">
          <div class="d-flex align-items-center flex-wrap gap-2">
            <span class="text-secondary-light text-sm me-1">Selected path:</span>
            <span class="path-chip">{{ selectedCategory?.name || 'Select category' }}</span>
            <iconify-icon icon="ri:arrow-right-s-line" class="text-secondary-light"></iconify-icon>
            <span class="path-chip">{{ selectedChild?.name || 'Select child group' }}</span>
            <iconify-icon icon="ri:arrow-right-s-line" class="text-secondary-light"></iconify-icon>
            <span class="path-chip">{{ selectedComponent?.name || 'Select component' }}</span>
            <iconify-icon icon="ri:arrow-right-s-line" class="text-secondary-light"></iconify-icon>
            <span class="path-chip">{{ selectedComponent ? `${visibleOptions.length} options` : 'Options' }}</span>
          </div>
        </div>
      </div>

      <div class="row gy-4">
        <div class="col-xl-3 col-md-6">
          <HierarchyColumn
            title="1. Categories"
            icon="ri:layers-line"
            :items="visibleCategories"
            :selected-id="selectedCategoryId"
            count-label="child groups"
            child-key="children"
            empty-message="No categories match the filters."
            @select="selectCategory"
          />
        </div>

        <div class="col-xl-3 col-md-6">
          <HierarchyColumn
            title="2. Child Groups"
            icon="ri:node-tree"
            :items="visibleChildren"
            :selected-id="selectedChildId"
            count-label="components"
            child-key="components"
            :empty-message="selectedCategory ? 'No child groups in this category.' : 'Select a category first.'"
            @select="selectChild"
          />
        </div>

        <div class="col-xl-3 col-md-6">
          <HierarchyColumn
            title="3. Components"
            icon="ri:puzzle-line"
            :items="visibleComponents"
            :selected-id="selectedComponentId"
            count-label="options"
            child-key="options"
            :empty-message="selectedChild ? 'No components in this child group.' : 'Select a child group first.'"
            @select="selectComponent"
          />
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card border shadow-none radius-12 h-100">
            <div class="card-header bg-base border-bottom px-16 py-14 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <iconify-icon icon="ri:checkbox-multiple-line" class="text-warning-600 text-xl"></iconify-icon>
                <h6 class="mb-0">4. Options</h6>
              </div>
              <span class="bg-warning-focus text-warning-600 px-8 py-2 radius-4 text-xs">{{ visibleOptions.length }}</span>
            </div>
            <div class="card-body p-12 hierarchy-column">
              <div v-if="visibleOptions.length" class="d-flex flex-column gap-2">
                <div v-for="option in visibleOptions" :key="option.id" class="border radius-8 px-12 py-10 bg-base">
                  <div class="d-flex align-items-center justify-content-between gap-2">
                    <span class="fw-medium text-primary-light">{{ option.name }}</span>
                    <MasterPropertyStatusBadge :status="option.status" />
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-40 px-12">
                <iconify-icon icon="ri:inbox-line" class="text-4xl text-secondary-light mb-8"></iconify-icon>
                <p class="text-secondary-light mb-0">{{ selectedComponent ? 'No options in this component.' : 'Select a component first.' }}</p>
              </div>
            </div>
            <div class="card-footer bg-base border-top px-16 py-12">
              <router-link to="/master-properties/options" class="text-primary-600 fw-medium text-sm">Manage all options</router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import LoadingState from '@/components/common/LoadingState.vue'
import MasterPropertyStatusBadge from '@/components/common/MasterPropertyStatusBadge.vue'
import service from '@/services/masterPropertyService'

const HierarchyColumn = defineComponent({
  props: {
    title: String,
    icon: String,
    items: { type: Array, default: () => [] },
    selectedId: [String, Number],
    countLabel: String,
    childKey: String,
    emptyMessage: String,
  },
  emits: ['select'],
  setup(props, { emit }) {
    return () => h('div', { class: 'card border shadow-none radius-12 h-100' }, [
      h('div', { class: 'card-header bg-base border-bottom px-16 py-14 d-flex align-items-center justify-content-between' }, [
        h('div', { class: 'd-flex align-items-center gap-2' }, [
          h('iconify-icon', { icon: props.icon, class: 'text-primary-600 text-xl' }),
          h('h6', { class: 'mb-0' }, props.title),
        ]),
        h('span', { class: 'bg-primary-50 text-primary-600 px-8 py-2 radius-4 text-xs' }, String(props.items.length)),
      ]),
      h('div', { class: 'card-body p-12 hierarchy-column' }, props.items.length
        ? h('div', { class: 'd-flex flex-column gap-2' }, props.items.map((item) =>
          h('button', {
            type: 'button',
            class: ['hierarchy-item text-start border radius-8 px-12 py-10 bg-base', Number(props.selectedId) === Number(item.id) ? 'is-selected' : ''],
            onClick: () => emit('select', item),
          }, [
            h('div', { class: 'd-flex align-items-center justify-content-between gap-2 mb-4' }, [
              h('span', { class: 'fw-medium text-primary-light' }, item.name),
              h(MasterPropertyStatusBadge, { status: item.status }),
            ]),
            h('span', { class: 'text-secondary-light text-xs' }, `${item[props.childKey]?.length || 0} ${props.countLabel}`),
          ]),
        ))
        : h('div', { class: 'text-center py-40 px-12' }, [
          h('iconify-icon', { icon: 'ri:inbox-line', class: 'text-4xl text-secondary-light mb-8' }),
          h('p', { class: 'text-secondary-light mb-0' }, props.emptyMessage),
        ])),
    ])
  },
})

const tree = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const status = ref('')
const selectedCategoryId = ref(null)
const selectedChildId = ref(null)
const selectedComponentId = ref(null)

const matches = (item) => {
  const term = search.value.trim().toLowerCase()
  return (!status.value || item.status === status.value)
    && (!term || item.name?.toLowerCase().includes(term))
}

const counts = computed(() => {
  const children = tree.value.flatMap((category) => category.children || [])
  const components = children.flatMap((child) => child.components || [])
  const options = components.flatMap((component) => component.options || [])
  return { categories: tree.value.length, children: children.length, components: components.length, options: options.length }
})
const metrics = computed(() => [
  { label: 'Categories', value: counts.value.categories, icon: 'ri:layers-line', color: 'primary' },
  { label: 'Child Groups', value: counts.value.children, icon: 'ri:node-tree', color: 'success' },
  { label: 'Components', value: counts.value.components, icon: 'ri:puzzle-line', color: 'info' },
  { label: 'Options', value: counts.value.options, icon: 'ri:checkbox-multiple-line', color: 'warning' },
])

const visibleCategories = computed(() => tree.value.filter(matches))
const selectedCategory = computed(() => tree.value.find((item) => Number(item.id) === Number(selectedCategoryId.value)))
const visibleChildren = computed(() => (selectedCategory.value?.children || []).filter(matches))
const selectedChild = computed(() => (selectedCategory.value?.children || []).find((item) => Number(item.id) === Number(selectedChildId.value)))
const visibleComponents = computed(() => (selectedChild.value?.components || []).filter(matches))
const selectedComponent = computed(() => (selectedChild.value?.components || []).find((item) => Number(item.id) === Number(selectedComponentId.value)))
const visibleOptions = computed(() => (selectedComponent.value?.options || []).filter(matches))

function selectCategory(category) {
  selectedCategoryId.value = category.id
  selectedChildId.value = null
  selectedComponentId.value = null
}
function selectChild(child) {
  selectedChildId.value = child.id
  selectedComponentId.value = null
}
function selectComponent(component) {
  selectedComponentId.value = component.id
}
function selectFirstPath() {
  const category = visibleCategories.value[0]
  selectedCategoryId.value = category?.id || null
  const child = (category?.children || []).filter(matches)[0]
  selectedChildId.value = child?.id || null
  const component = (child?.components || []).filter(matches)[0]
  selectedComponentId.value = component?.id || null
}

async function loadTree() {
  loading.value = true
  error.value = ''
  try {
    tree.value = await service.getTree()
    selectFirstPath()
  } catch (err) {
    tree.value = []
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch([search, status], selectFirstPath)
onMounted(loadTree)
</script>

<style scoped>
.hierarchy-column {
  min-height: 420px;
  max-height: 520px;
  overflow-y: auto;
}

.hierarchy-item {
  width: 100%;
  transition: border-color .15s ease, background-color .15s ease, box-shadow .15s ease;
}

.hierarchy-item:hover {
  border-color: var(--primary-300) !important;
  background: var(--primary-50) !important;
}

.hierarchy-item.is-selected {
  border-color: var(--primary-600) !important;
  background: var(--primary-50) !important;
  box-shadow: inset 3px 0 0 var(--primary-600);
}

.path-chip {
  background: var(--neutral-100);
  border: 1px solid var(--neutral-200);
  border-radius: 6px;
  color: var(--text-primary-light);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 10px;
}
</style>
