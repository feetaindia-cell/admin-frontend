<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading FAQ section..." />
    <div v-else-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <template v-else>
      <div class="card radius-12 mb-24">
        <div class="card-body p-24">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <div class="d-flex align-items-center gap-8 flex-wrap mb-8"><span class="text-primary-600 fw-semibold">Section {{ section.section_no }}</span><StatusBadge :status="section.is_active ? 'Active' : 'Inactive'" /></div>
              <h4 class="mb-4">{{ section.title }}</h4>
              <p class="text-secondary-light mb-0">{{ items.length }} question{{ items.length === 1 ? '' : 's' }}</p>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <router-link to="/faqs" class="btn btn-outline-secondary"><iconify-icon icon="ri:arrow-left-line" class="me-6" />All Sections</router-link>
              <router-link v-if="auth.hasPermission('faq.section.update')" :to="`/faqs/sections/${section.section_id}/edit`" class="btn btn-outline-primary-600"><iconify-icon icon="ri:edit-line" class="me-6" />Edit Section</router-link>
              <router-link v-if="auth.hasPermission('faq.item.create')" :to="`/faqs/sections/${section.section_id}/questions/create`" class="btn btn-primary-600"><iconify-icon icon="ri:add-line" class="me-6" />Add Question</router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="card radius-12">
        <div class="card-header bg-base border-bottom p-20">
          <div class="question-toolbar">
            <label class="search-control"><iconify-icon icon="ri:search-line" /><input v-model="search" type="search" placeholder="Search questions in this section" /></label>
            <select v-model="status" class="form-select"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
            <button v-if="auth.hasPermission('faq.item.sort') && items.length > 1" type="button" class="btn btn-outline-primary-600" :disabled="savingSort" @click="saveSort"><iconify-icon icon="ri:sort-asc" class="me-6" />{{ savingSort ? 'Saving...' : 'Save Order' }}</button>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="filteredItems.length" class="table-responsive">
            <table class="table bordered-table sm-table mb-0">
              <thead><tr><th>No</th><th>Question</th><th>Status</th><th v-if="auth.hasPermission('faq.item.sort')">Order</th><th class="manage-cell">Manage</th></tr></thead>
              <tbody>
                <tr v-for="item in filteredItems" :key="item.item_id" class="manage-row">
                  <td>{{ item.question_no }}</td>
                  <td><strong class="d-block question-text">{{ item.question }}</strong><span class="text-secondary-light text-sm answer-preview">{{ plainText(item.answer) }}</span></td>
                  <td><StatusBadge :status="item.is_active ? 'Active' : 'Inactive'" /></td>
                  <td v-if="auth.hasPermission('faq.item.sort')"><input v-model.number="sortOrders[item.item_id]" type="number" min="0" class="form-control sort-input" @click.stop /></td>
                  <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-24"><EmptyState icon="ri:question-answer-line" title="No questions found" :message="items.length ? 'No questions match the current filters.' : 'Add the first question to this FAQ section.'" /></div>
        </div>
      </div>
    </template>
    <RowManageDialog v-model="manageOpen" :title="selectedItem?.question" :subtitle="section.title || ''">
      <router-link v-if="selectedItem" :to="`/faqs/questions/${selectedItem.item_id}`"><iconify-icon icon="ri:eye-line" /> View question</router-link>
      <router-link v-if="selectedItem && auth.hasPermission('faq.item.update')" :to="`/faqs/questions/${selectedItem.item_id}/edit`"><iconify-icon icon="ri:edit-line" /> Edit question</router-link>
      <button v-if="selectedItem && auth.hasPermission('faq.item.status')" type="button" :disabled="workingId === selectedItem.item_id" @click="toggleStatus(selectedItem)"><iconify-icon :icon="selectedItem.is_active ? 'ri:pause-circle-line' : 'ri:play-circle-line'" /> {{ selectedItem.is_active ? 'Deactivate' : 'Activate' }}</button>
      <button v-if="selectedItem && auth.hasPermission('faq.item.delete') && selectedItem.is_active" type="button" class="text-danger" :disabled="workingId === selectedItem.item_id" @click="deactivate(selectedItem)"><iconify-icon icon="ri:archive-line" /> Deactivate question</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import faqService from '@/services/faqService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const section = ref({})
const items = ref([])
const search = ref('')
const status = ref('')
const loading = ref(true)
const savingSort = ref(false)
const workingId = ref(null)
const manageOpen = ref(false)
const selectedItem = ref(null)
const error = ref('')
const sortOrders = reactive({})

const plainText = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()
  return items.value.filter((item) => {
    const matchesStatus = !status.value || (status.value === 'active' ? item.is_active : !item.is_active)
    const matchesSearch = !term || `${item.question} ${plainText(item.answer)}`.toLowerCase().includes(term)
    return matchesStatus && matchesSearch
  })
})

function openManage(item) {
  selectedItem.value = item
  manageOpen.value = true
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    section.value = await faqService.getSection(route.params.id)
    items.value = section.value.items || []
    items.value.forEach((item) => { sortOrders[item.item_id] = item.sort_order ?? item.question_no ?? 0 })
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function toggleStatus(item) {
  const next = !item.is_active
  const result = await Swal.fire({ title: `${next ? 'Activate' : 'Deactivate'} question?`, text: item.question, icon: next ? 'question' : 'warning', showCancelButton: true, confirmButtonText: next ? 'Activate' : 'Deactivate' })
  if (!result.isConfirmed) return
  workingId.value = item.item_id
  try { await faqService.updateItemStatus(item.item_id, { is_active: next }); await load() }
  catch (err) { await Swal.fire('Status update failed', err.message, 'error') }
  finally { workingId.value = null }
}

async function deactivate(item) {
  const result = await Swal.fire({ title: 'Deactivate question?', text: item.question, icon: 'warning', showCancelButton: true, confirmButtonText: 'Deactivate' })
  if (!result.isConfirmed) return
  workingId.value = item.item_id
  try { await faqService.deleteItem(item.item_id); await load() }
  catch (err) { await Swal.fire('Deactivate failed', err.message, 'error') }
  finally { workingId.value = null }
}

async function saveSort() {
  savingSort.value = true
  try {
    await faqService.reorderItems({ items: items.value.map((item) => ({ item_id: item.item_id, sort_order: Number(sortOrders[item.item_id] ?? 0) })) })
    await Swal.fire({ icon: 'success', title: 'Question order saved', timer: 1100, showConfirmButton: false })
    await load()
  } catch (err) {
    await Swal.fire('Reorder failed', err.message, 'error')
  } finally {
    savingSort.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.question-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.question-toolbar .form-select{width:180px}.search-control{min-height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid #d9e0ea;border-radius:10px;background:#fff;flex:1 1 300px}.search-control input{width:100%;border:0;outline:0;background:transparent}.question-text,.answer-preview{max-width:620px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sort-input{width:90px}.action-btn{width:36px;height:36px;display:grid;place-items:center;border:0;border-radius:10px}.is-view{color:#2563eb;background:#eff6ff}.is-edit{color:#059669;background:#ecfdf5}.is-status{color:#a16207;background:#fffbeb}.is-delete{color:#dc2626;background:#fff1f2}@media(max-width:768px){.question-toolbar>*,.question-toolbar .form-select{width:100%;flex:1 1 100%}.question-text,.answer-preview{max-width:260px}}
</style>
