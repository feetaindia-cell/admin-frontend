<template>
  <div class="dashboard-main-body">
<section class="policy-page-head mb-24">
      <div class="policy-page-copy">
        <span class="policy-kicker">{{ displayType(policyType) }}</span>
        <h4 class="mb-6">{{ policyTitle }}</h4>
        <p class="text-secondary-light mb-0">{{ sections.length }} total section{{ sections.length === 1 ? '' : 's' }}, ordered by section number.</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <button type="button" class="btn btn-outline-primary-600" :disabled="loading" @click="load"><iconify-icon icon="ri:refresh-line" class="me-6" />Refresh</button>
        <button type="button" class="btn btn-outline-primary-600" :disabled="previewLoading" @click="togglePreview"><iconify-icon icon="ri:external-link-line" class="me-6" />{{ previewOpen ? 'Hide Public Preview' : 'Preview Public Policy' }}</button>
        <button v-if="auth.hasPermission('policy.reorder') && sections.length > 1" type="button" class="btn btn-outline-primary-600" @click="toggleReorder"><iconify-icon icon="ri:sort-asc" class="me-6" />{{ reorderMode ? 'Cancel Reorder' : 'Reorder Sections' }}</button>
        <router-link v-if="auth.hasPermission('policy.create')" :to="createPath" class="btn btn-primary-600"><iconify-icon icon="ri:add-line" class="me-6" />Add Section</router-link>
      </div>
    </section>

    <div class="policy-overview mb-24">
      <div class="overview-card"><iconify-icon icon="ri:file-text-line" /><span>Total</span><strong>{{ sections.length }}</strong></div>
      <div class="overview-card"><iconify-icon icon="ri:checkbox-circle-line" /><span>Active</span><strong>{{ activeCount }}</strong></div>
      <div class="overview-card"><iconify-icon icon="ri:pause-circle-line" /><span>Inactive</span><strong>{{ inactiveCount }}</strong></div>
      <div class="overview-card"><iconify-icon icon="ri:global-line" /><span>Visible publicly</span><strong>{{ activeCount }}</strong></div>
    </div>

    <div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading policy sections..." />

    <template v-else>
      <div v-if="previewOpen" class="card radius-12 mb-24 public-preview">
        <div class="card-header border-bottom d-flex justify-content-between align-items-center gap-3"><div><h6 class="mb-2">Public API Preview</h6><span class="text-secondary-light text-sm">Only active sections are shown.</span></div><span class="badge bg-success-focus text-success-600">Public</span></div>
        <LoadingState v-if="previewLoading" message="Loading public policy..." />
        <div v-else class="card-body p-24">
          <div v-if="publicSections.length" class="d-flex flex-column gap-24">
            <article v-for="section in publicSections" :key="section.id" class="preview-section"><p class="text-primary-600 fw-semibold mb-4">Section {{ section.section_no }}</p><h5>{{ section.title }}</h5><div class="policy-content" v-html="section.content || '<p>No content available.</p>'"></div></article>
          </div>
          <EmptyState v-else icon="ri:eye-off-line" title="No public sections" message="This policy has no active sections available publicly." />
        </div>
      </div>

      <div v-if="reorderMode" class="card radius-12 mb-24 border border-primary-200">
        <div class="card-header border-bottom bg-primary-50 d-flex justify-content-between align-items-center flex-wrap gap-3"><div><h6 class="mb-2">Reorder Sections</h6><p class="text-secondary-light text-sm mb-0">Use Move Up, Move Down, or enter unique positive section numbers.</p></div><button type="button" class="btn btn-primary-600" :disabled="savingOrder" @click="saveOrder"><span v-if="savingOrder" class="spinner-border spinner-border-sm me-6" /><iconify-icon v-else icon="ri:save-line" class="me-6" />Save Order</button></div>
        <div class="card-body p-0">
          <div v-for="(section, index) in reorderSections" :key="section.id" class="reorder-row">
            <div class="reorder-handle"><iconify-icon icon="ri:draggable" /></div>
            <div class="flex-grow-1 min-w-0"><strong class="d-block text-truncate">{{ section.title }}</strong><span class="text-secondary-light text-sm text-capitalize">{{ displayType(section.policy_type) }}</span></div>
            <label class="section-number-label">Section No<input v-model.number="section.section_no" type="number" min="1" step="1" class="form-control" /></label>
            <div class="d-flex gap-2"><button type="button" class="btn btn-sm btn-outline-primary-600" :disabled="index === 0" title="Move up" @click="move(index, -1)"><iconify-icon icon="ri:arrow-up-line" /></button><button type="button" class="btn btn-sm btn-outline-primary-600" :disabled="index === reorderSections.length - 1" title="Move down" @click="move(index, 1)"><iconify-icon icon="ri:arrow-down-line" /></button></div>
          </div>
        </div>
      </div>

      <div v-else class="card radius-12 policy-list-card">
        <div class="card-header border-bottom bg-base p-20">
          <div class="type-toolbar">
            <div class="toolbar-title">
              <h6 class="mb-2">Sections</h6>
              <span>{{ filteredSections.length }} shown</span>
            </div>
            <label class="navbar-search type-search"><input v-model="search" type="search" class="bg-base h-40-px" placeholder="Search title, section number, or content" /><iconify-icon icon="ri:search-line" class="icon" /></label>
            <select v-model="status" class="form-select h-40-px"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </div>
        </div>
        <div class="card-body p-24">
          <div v-if="filteredSections.length" class="policy-timeline">
            <article v-for="section in filteredSections" :key="section.id" class="policy-section-card">
              <div class="section-number">{{ section.section_no }}</div>
              <div class="section-content">
                <div class="section-card-head mb-12"><div><p class="text-secondary-light text-sm mb-4">Section {{ section.section_no }} / {{ wordCount(section.content) }} words</p><h5 class="mb-0">{{ section.title || 'Untitled section' }}</h5></div><StatusBadge :status="section.is_active ? 'Active' : 'Inactive'" /></div>
                <div class="policy-excerpt" v-html="section.content || '<p>No content available.</p>'"></div>
                <div class="section-actions mt-16">
                  <router-link :to="`/policies/sections/${section.id}`" class="btn btn-sm btn-outline-primary-600"><iconify-icon icon="ri:eye-line" class="me-4" />View</router-link>
                  <router-link v-if="auth.hasPermission('policy.update')" :to="`/policies/sections/${section.id}/edit`" class="btn btn-sm btn-outline-success"><iconify-icon icon="ri:edit-line" class="me-4" />Edit</router-link>
                  <button v-if="auth.hasPermission('policy.status')" type="button" class="btn btn-sm btn-outline-secondary" :disabled="actionId === section.id" @click="toggleStatus(section)"><iconify-icon :icon="section.is_active ? 'ri:pause-circle-line' : 'ri:play-circle-line'" class="me-4" />{{ section.is_active ? 'Deactivate' : 'Activate' }}</button>
                  <button v-if="auth.hasPermission('policy.delete') && section.is_active" type="button" class="btn btn-sm btn-outline-warning" :disabled="actionId === section.id" @click="deactivate(section)"><iconify-icon icon="ri:archive-line" class="me-4" />Deactivate</button>
                </div>
              </div>
            </article>
          </div>
          <EmptyState v-else icon="ri:file-text-line" title="No sections found" :message="sections.length ? 'No sections match the current search or status filter.' : 'This policy type does not have any sections yet.'" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import policyService from '@/services/policyService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const sections = ref([])
const reorderSections = ref([])
const publicSections = ref([])
const loading = ref(false)
const previewLoading = ref(false)
const savingOrder = ref(false)
const error = ref('')
const search = ref('')
const status = ref('')
const actionId = ref(null)
const reorderMode = ref(false)
const previewOpen = ref(false)

const policyType = computed(() => String(route.params.policyType || ''))
const displayType = (value) => String(value || '').replaceAll('_', ' ')
const titleCase = (value) => displayType(value).replace(/\b\w/g, (letter) => letter.toUpperCase())
const displayNames = { terms: 'Terms & Conditions', privacy: 'Privacy Policy', accessibility: 'Accessibility Policy', media: 'Media Policy' }
const policyTitle = computed(() => displayNames[policyType.value] || `${titleCase(policyType.value)} Policy`)
const createPath = computed(() => `/policies/${policyType.value}/create?section_no=${Math.max(0, ...sections.value.map((section) => Number(section.section_no) || 0)) + 1}`)
const activeCount = computed(() => sections.value.filter((section) => section.is_active).length)
const inactiveCount = computed(() => sections.value.length - activeCount.value)
const wordCount = (content) => String(content || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim().split(/\s+/).filter(Boolean).length
const filteredSections = computed(() => {
  const term = search.value.trim().toLowerCase()
  return sections.value.filter((section) => {
    const matchesSearch = !term || [section.title, section.content, section.section_no].some((value) => String(value || '').toLowerCase().includes(term))
    const matchesStatus = !status.value || (status.value === 'active' ? section.is_active : !section.is_active)
    return matchesSearch && matchesStatus
  })
})

function sorted(values) {
  return [...values].sort((a, b) => Number(a.section_no) - Number(b.section_no) || Number(a.id) - Number(b.id))
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const grouped = await policyService.getPolicyGroupSections(policyType.value)
    sections.value = sorted(Array.isArray(grouped?.sections) ? grouped.sections : [])
  } catch (err) {
    if (err?.status === 404) sections.value = []
    else error.value = err.message
  } finally {
    loading.value = false
  }
}

function startReorder() {
  reorderSections.value = sorted(sections.value).map((section) => ({ ...section, section_no: Number(section.section_no) }))
  reorderMode.value = true
}

function toggleReorder() {
  if (reorderMode.value) reorderMode.value = false
  else startReorder()
}

function move(index, direction) {
  const target = index + direction
  if (target < 0 || target >= reorderSections.value.length) return
  const next = [...reorderSections.value]
  ;[next[index], next[target]] = [next[target], next[index]]
  next.forEach((section, sectionIndex) => { section.section_no = sectionIndex + 1 })
  reorderSections.value = next
}

async function saveOrder() {
  const numbers = reorderSections.value.map((section) => Number(section.section_no))
  if (numbers.some((number) => !Number.isInteger(number) || number < 1) || new Set(numbers).size !== numbers.length) {
    await Swal.fire('Invalid section numbers', 'Use a unique positive integer for every section.', 'error')
    return
  }
  const result = await Swal.fire({ title: 'Save section order?', text: `Update the order of ${reorderSections.value.length} ${policyTitle.value} sections.`, icon: 'question', showCancelButton: true, confirmButtonText: 'Save Order' })
  if (!result.isConfirmed) return
  savingOrder.value = true
  try {
    await policyService.reorderPolicySections(policyType.value, { items: reorderSections.value.map(({ id, section_no }) => ({ id, section_no: Number(section_no) })) })
    await Swal.fire({ icon: 'success', title: 'Section order saved', timer: 1200, showConfirmButton: false })
    reorderMode.value = false
    await load()
  } catch (err) {
    await Swal.fire('Reorder failed', err.message, 'error')
  } finally {
    savingOrder.value = false
  }
}

async function toggleStatus(section) {
  const next = !section.is_active
  const result = await Swal.fire({ title: next ? 'Activate section?' : 'Deactivate section?', text: section.title, icon: next ? 'question' : 'warning', showCancelButton: true, confirmButtonText: next ? 'Activate' : 'Deactivate' })
  if (!result.isConfirmed) return
  actionId.value = section.id
  try {
    await policyService.updatePolicySectionStatus(section.id, { is_active: next })
    await load()
  } catch (err) {
    await Swal.fire('Status update failed', err.message, 'error')
  } finally {
    actionId.value = null
  }
}

async function deactivate(section) {
  const result = await Swal.fire({ title: 'Deactivate section?', text: 'The row will be retained and hidden from the public policy API.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Deactivate' })
  if (!result.isConfirmed) return
  actionId.value = section.id
  try {
    await policyService.deletePolicySection(section.id)
    await load()
  } catch (err) {
    await Swal.fire('Deactivate failed', err.message, 'error')
  } finally {
    actionId.value = null
  }
}

async function togglePreview() {
  previewOpen.value = !previewOpen.value
  if (!previewOpen.value) return
  previewLoading.value = true
  try {
    const grouped = await policyService.getPublicPolicy(policyType.value)
    publicSections.value = sorted(Array.isArray(grouped?.sections) ? grouped.sections : [])
  } catch (err) {
    if (err?.status === 404) publicSections.value = []
    else await Swal.fire('Preview failed', err.message, 'error')
  } finally {
    previewLoading.value = false
  }
}

watch(() => route.params.policyType, load)
onMounted(async () => {
  await load()
  if (route.query.reorder === '1' && sections.value.length > 1 && auth.hasPermission('policy.reorder')) startReorder()
})
</script>

<style scoped>
.policy-page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  padding: 26px;
  border: 1px solid rgba(148, 163, 184, .18);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(72, 127, 255, .08), rgba(20, 184, 166, .06)),
    var(--white);
  box-shadow: 0 16px 38px rgba(15, 23, 42, .05);
}
.policy-page-copy {
  max-width: 620px;
}
.policy-kicker {
  display: inline-flex;
  margin-bottom: 8px;
  color: var(--primary-600);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.policy-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.overview-card {
  position: relative;
  overflow: hidden;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, .18);
  border-radius: 12px;
  background: var(--white);
  box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
}
.overview-card iconify-icon {
  position: absolute;
  top: 14px;
  right: 16px;
  color: rgba(72, 127, 255, .22);
  font-size: 28px;
}
.overview-card span {
  display: block;
  margin-bottom: 6px;
  color: var(--text-secondary-light);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
.overview-card strong {
  color: var(--text-primary-light);
  font-size: 24px;
  line-height: 1;
}
.public-preview,
.policy-list-card {
  border: 1px solid rgba(148, 163, 184, .18);
}
.type-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.toolbar-title {
  min-width: 140px;
}
.toolbar-title span {
  color: var(--text-secondary-light);
  font-size: 12px;
}
.type-search {
  flex: 1 1 300px;
}
.type-search input {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, .22);
  border-radius: 10px;
}
.type-toolbar .form-select {
  width: 180px;
  border-radius: 10px;
}
.policy-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.policy-section-card {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 18px;
}
.policy-section-card:before {
  content: "";
  position: absolute;
  top: 46px;
  bottom: -16px;
  left: 23px;
  width: 1px;
  background: rgba(148, 163, 184, .20);
}
.policy-section-card:last-child:before {
  display: none;
}
.section-number {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #fff;
  background: var(--primary-600);
  font-size: 18px;
  font-weight: 700;
}
.section-content {
  min-width: 0;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, .18);
  border-radius: 14px;
  background: var(--base);
  transition: border-color .18s ease, box-shadow .18s ease;
}
.section-content:hover {
  border-color: rgba(72, 127, 255, .28);
  box-shadow: 0 12px 26px rgba(15, 23, 42, .06);
}
.section-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.policy-excerpt {
  position: relative;
  max-height: 118px;
  overflow: hidden;
  color: var(--text-secondary-light);
  line-height: 1.65;
}
.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, .14);
}
.policy-excerpt:after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 34px;
  background: linear-gradient(transparent, var(--base));
}
.policy-content {
  overflow-wrap: anywhere;
  color: var(--text-secondary-light);
  line-height: 1.7;
}
.policy-content :deep(img),
.policy-excerpt :deep(img) {
  max-width: 100%;
  height: auto;
}
.preview-section {
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, .16);
  border-radius: 12px;
  background: var(--base);
}
.preview-section + .preview-section {
  margin-top: 4px;
}
.reorder-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, .16);
}
.reorder-row:last-child {
  border-bottom: 0;
}
.reorder-handle {
  color: var(--text-secondary-light);
  font-size: 20px;
}
.section-number-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary-light);
  font-size: 12px;
  white-space: nowrap;
}
.section-number-label input {
  width: 86px;
  border-radius: 10px;
}
.min-w-0 {
  min-width: 0;
}
@media (max-width: 991px) {
  .policy-page-head {
    flex-direction: column;
  }
  .policy-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 575px) {
  .type-toolbar > * {
    width: 100% !important;
  }
  .policy-overview {
    grid-template-columns: 1fr;
  }
  .policy-section-card {
    grid-template-columns: 1fr;
  }
  .policy-section-card:before {
    display: none;
  }
  .section-number {
    width: 40px;
    height: 40px;
  }
  .reorder-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .section-number-label {
    width: 100%;
    justify-content: space-between;
  }
  .section-number-label input {
    width: 120px;
  }
}
:global(.dark) .policy-page-head,
:global(.dark) .overview-card,
:global(.dark) .policy-list-card,
:global(.dark) .public-preview,
:global(.dark) .section-content,
:global(.dark) .preview-section {
  background: var(--neutral-900);
  border-color: rgba(148, 163, 184, .20);
}
</style>
