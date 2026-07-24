<template>
  <div class="dashboard-main-body">
<div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-24">
      <p class="text-secondary-light mb-0">Manage questions and answers from <code>faq_items</code>.</p>
      <router-link v-if="auth.hasPermission('faq.item.create')" to="/faqs/items/create" class="btn btn-primary-600"><iconify-icon icon="ri:add-line" class="me-6" />Create FAQ Item</router-link>
    </div>
    <div class="card radius-12">
      <div class="card-header bg-base border-bottom p-20"><div class="faq-toolbar"><label class="search-control"><iconify-icon icon="ri:search-line" /><input v-model="filters.search" type="search" placeholder="Search question or answer" /></label><select v-model="filters.section_id" class="form-select"><option value="">All sections</option><option v-for="section in sections" :key="section.section_id" :value="section.section_id">{{ section.title }}</option></select><select v-model="filters.is_active" class="form-select"><option value="">All statuses</option><option value="1">Active</option><option value="0">Inactive</option></select><select v-model.number="filters.per_page" class="form-select"><option v-for="n in [10,15,25,50]" :key="n" :value="n">{{ n }} per page</option></select></div></div>
      <LoadingState v-if="loading" message="Loading FAQ items..." />
      <div v-else class="card-body p-0">
        <div v-if="items.length" class="table-responsive">
          <table class="table bordered-table sm-table mb-0">
            <thead><tr><th>No</th><th>Question</th><th>Section</th><th>Sort</th><th>Status</th><th class="manage-cell">Manage</th></tr></thead>
            <tbody>
              <tr v-for="item in items" :key="item.item_id" class="manage-row">
                <td>{{ item.question_no }}</td>
                <td class="fw-semibold">{{ item.question }}</td>
                <td>{{ item.section?.title || item.section_title || item.section_id }}</td>
                <td><input v-if="auth.hasPermission('faq.item.sort')" v-model.number="sortOrders[item.item_id]" type="number" min="0" class="form-control sort-input" @click.stop /><span v-else>{{ item.sort_order }}</span></td>
                <td><StatusBadge :status="item.is_active ? 'Active' : 'Inactive'" /></td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else icon="ri:question-answer-line" title="No FAQ items found" message="No questions match the current filters." />
        <div v-if="items.length" class="p-24 d-flex justify-content-between gap-3 flex-wrap">
          <button v-if="auth.hasPermission('faq.item.sort')" class="btn btn-outline-primary-600" :disabled="savingSort" @click="saveSort"><iconify-icon icon="ri:sort-asc" class="me-6" />{{ savingSort ? 'Saving...' : 'Save Sort Order' }}</button>
          <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="load" />
        </div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedItem?.question" :subtitle="selectedItem ? selectedItem.section?.title || selectedItem.section_title || '' : ''">
      <router-link v-if="selectedItem" :to="`/faqs/items/${selectedItem.item_id}`"><iconify-icon icon="ri:eye-line" /> View item</router-link>
      <router-link v-if="selectedItem && auth.hasPermission('faq.item.update')" :to="`/faqs/items/${selectedItem.item_id}/edit`"><iconify-icon icon="ri:edit-line" /> Edit item</router-link>
      <button v-if="selectedItem && auth.hasPermission('faq.item.status')" type="button" @click="toggleStatus(selectedItem)"><iconify-icon icon="ri:refresh-line" /> {{ selectedItem.is_active ? 'Deactivate' : 'Activate' }}</button>
      <button v-if="selectedItem && auth.hasPermission('faq.item.delete') && selectedItem.is_active" type="button" class="text-danger" @click="deleteItem(selectedItem)"><iconify-icon icon="ri:delete-bin-line" /> Deactivate item</button>
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
import faqService from '@/services/faqService'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const items = ref([])
const sections = ref([])
const sortOrders = reactive({})
const loading = ref(false)
const savingSort = ref(false)
const manageOpen = ref(false)
const selectedItem = ref(null)
const total = ref(0)
const page = ref(1)
const filters = reactive({ search: '', section_id: '', is_active: '', per_page: 15 })
let timer
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.per_page)))
const startIndex = computed(() => total.value ? (page.value - 1) * filters.per_page : 0)
const endIndex = computed(() => Math.min(startIndex.value + items.value.length, total.value))
function norm(payload) { const rows = Array.isArray(payload) ? payload : payload?.data || []; return { rows, total: payload?.meta?.total ?? payload?.total ?? rows.length } }
function openManage(item) { selectedItem.value = item; manageOpen.value = true }
async function load(next = 1) { loading.value = true; page.value = next; try { const p = norm(await faqService.getItems({ ...filters, page: next })); items.value = p.rows; total.value = p.total; items.value.forEach((item) => { sortOrders[item.item_id] = item.sort_order ?? item.question_no ?? 0 }) } finally { loading.value = false } }
async function loadSections() { const p = norm(await faqService.getSections({ per_page: 100 })); sections.value = p.rows }
async function toggleStatus(item) { const next = !item.is_active; const result = await Swal.fire({ title: next ? 'Activate FAQ item?' : 'Deactivate FAQ item?', text: item.question, icon: next ? 'question' : 'warning', showCancelButton: true, confirmButtonText: next ? 'Activate' : 'Deactivate' }); if (!result.isConfirmed) return; try { await faqService.updateItemStatus(item.item_id, { is_active: next }); await load(page.value) } catch (err) { await Swal.fire('Status update failed', err.message, 'error') } }
async function deleteItem(item) { const result = await Swal.fire({ title: 'Deactivate FAQ item?', text: item.question, icon: 'warning', showCancelButton: true, confirmButtonText: 'Deactivate' }); if (result.isConfirmed) { await faqService.deleteItem(item.item_id); load(page.value) } }
async function saveSort() { savingSort.value = true; try { await faqService.reorderItems({ items: items.value.map((item) => ({ item_id: item.item_id, sort_order: Number(sortOrders[item.item_id] ?? 0) })) }); await Swal.fire({ icon: 'success', title: 'Sort order saved', timer: 1200, showConfirmButton: false }); await load(page.value) } catch (err) { await Swal.fire('Reorder failed', err.message, 'error') } finally { savingSort.value = false } }
watch(() => filters.search, () => { clearTimeout(timer); timer = setTimeout(() => load(1), 450) })
watch(() => [filters.section_id, filters.is_active, filters.per_page], () => load(1))
watch(() => route.query.search, (value) => { filters.search = value || ''; load(1) })
onMounted(() => { filters.search = route.query.search || ''; loadSections(); load() })
</script>

<style scoped>.faq-toolbar{display:flex;flex-wrap:wrap;gap:12px}.faq-toolbar>*{min-width:180px;flex:1 1 180px}.search-control{min-height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid #d9e0ea;border-radius:10px;background:#fff;flex:2 1 280px}.search-control input{width:100%;border:0;outline:0;background:transparent}.sort-input{width:92px}.action-btn{width:36px;height:36px;display:grid;place-items:center;border:0;border-radius:10px}.is-view{color:#2563eb;background:#eff6ff}.is-edit{color:#059669;background:#ecfdf5}.is-status{color:#a16207;background:#fffbeb}.is-delete{color:#dc2626;background:#fff1f2}@media(max-width:768px){.faq-toolbar>*{width:100%;flex:1 1 100%}}</style>
