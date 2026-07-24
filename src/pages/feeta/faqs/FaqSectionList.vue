<template>
  <div class="dashboard-main-body">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-24">
      <p class="text-secondary-light mb-0">Manage FAQ sections/categories.</p>
      <router-link v-if="auth.hasPermission('faq.section.create')" to="/faqs/sections/create" class="btn btn-primary-600"><iconify-icon icon="ri:add-line" class="me-6" />Create Section</router-link>
    </div>
    <div class="card radius-12">
      <div class="card-header bg-base border-bottom p-20">
        <div class="faq-toolbar">
          <label class="search-control"><iconify-icon icon="ri:search-line" /><input v-model="filters.search" type="search" placeholder="Search sections" /></label>
          <select v-model="filters.is_active" class="form-select"><option value="">All statuses</option><option value="1">Active</option><option value="0">Inactive</option></select>
          <select v-model.number="filters.per_page" class="form-select"><option v-for="n in [10,15,25,50]" :key="n" :value="n">{{ n }} per page</option></select>
        </div>
      </div>
      <LoadingState v-if="loading" message="Loading sections..." />
      <div v-else class="card-body p-0">
        <div v-if="sections.length" class="table-responsive">
          <table class="table bordered-table sm-table mb-0">
            <thead><tr><th>No</th><th>Title</th><th>Slug</th><th>Status</th><th>Questions</th><th class="manage-cell">Manage</th></tr></thead>
            <tbody>
              <tr v-for="section in sections" :key="section.section_id" class="manage-row">
                <td>{{ section.section_no }}</td>
                <td class="fw-semibold">{{ section.title }}</td>
                <td>{{ section.slug }}</td>
                <td><StatusBadge :status="section.is_active?'Active':'Inactive'" /></td>
                <td>{{ section.questions_count ?? '-' }}</td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(section)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else icon="ri:folder-3-line" title="No sections found" message="No FAQ sections match filters." />
        <div v-if="sections.length" class="px-24 pb-24">
          <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="load" />
        </div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedSection?.title" :subtitle="selectedSection?.slug || ''">
      <router-link v-if="selectedSection" :to="`/faqs/sections/${selectedSection.section_id}`"><iconify-icon icon="ri:eye-line" /> View section</router-link>
      <router-link v-if="selectedSection && auth.hasPermission('faq.section.update')" :to="`/faqs/sections/${selectedSection.section_id}/edit`"><iconify-icon icon="ri:edit-line" /> Edit section</router-link>
      <button v-if="selectedSection && auth.hasPermission('faq.section.status')" type="button" @click="toggleStatus(selectedSection)"><iconify-icon icon="ri:refresh-line" /> {{ selectedSection.is_active ? 'Deactivate' : 'Activate' }}</button>
      <button v-if="selectedSection && auth.hasPermission('faq.section.delete') && selectedSection.is_active" type="button" class="text-danger" @click="deleteSection(selectedSection)"><iconify-icon icon="ri:delete-bin-line" /> Deactivate section</button>
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
const sections = ref([])
const loading = ref(false)
const actionId = ref(null)
const manageOpen = ref(false)
const selectedSection = ref(null)
const total = ref(0)
const page = ref(1)
const filters = reactive({ search: '', is_active: '', per_page: 15 })
let timer

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.per_page)))
const startIndex = computed(() => total.value ? (page.value - 1) * filters.per_page : 0)
const endIndex = computed(() => Math.min(startIndex.value + sections.value.length, total.value))

function norm(p) { const items = Array.isArray(p) ? p : p?.data || []; return { items, total: p?.meta?.total ?? p?.total ?? items.length } }
function openManage(section) { selectedSection.value = section; manageOpen.value = true }
async function load(next = 1) { loading.value = true; page.value = next; try { const p = norm(await faqService.getSections({ ...filters, page: next })); sections.value = p.items; total.value = p.total } finally { loading.value = false } }
async function toggleStatus(s) { if (actionId.value) return; const next = !s.is_active; const r = await Swal.fire({ title: next ? 'Activate section?' : 'Deactivate section?', text: next ? s.title : 'This hides the section and its FAQ items publicly without deleting child rows.', icon: next ? 'question' : 'warning', showCancelButton: true, confirmButtonText: next ? 'Activate' : 'Deactivate' }); if (!r.isConfirmed) return; actionId.value = s.section_id; try { await faqService.updateSectionStatus(s.section_id, { is_active: next }); await load(page.value) } catch (err) { await Swal.fire('Status update failed', err.message, 'error') } finally { actionId.value = null } }
async function deleteSection(s) { if (actionId.value) return; const r = await Swal.fire({ title: 'Deactivate section?', text: 'This safely deactivates the section; FAQ items are not deleted.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Deactivate' }); if (r.isConfirmed) { actionId.value = s.section_id; try { await faqService.deleteSection(s.section_id); await load(page.value) } catch (err) { await Swal.fire('Deactivate failed', err.message, 'error') } finally { actionId.value = null } } }

watch(() => filters.search, () => { clearTimeout(timer); timer = setTimeout(() => load(1), 450) })
watch(() => [filters.is_active, filters.per_page], () => load(1))
watch(() => route.query.search, (value) => { filters.search = value || ''; load(1) })
onMounted(() => { filters.search = route.query.search || ''; load() })
</script>

<style scoped>
.faq-toolbar{display:flex;flex-wrap:wrap;gap:12px}.faq-toolbar>*{min-width:180px;flex:1 1 180px}.search-control{min-height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid #d9e0ea;border-radius:10px;background:#fff;flex:2 1 280px}.search-control input{width:100%;border:0;outline:0;background:transparent}.action-btn{width:36px;height:36px;display:grid;place-items:center;border:0;border-radius:10px}.is-view{color:#2563eb;background:#eff6ff}.is-edit{color:#059669;background:#ecfdf5}.is-status{color:#a16207;background:#fffbeb}.is-delete{color:#dc2626;background:#fff1f2}@media(max-width:768px){.faq-toolbar>*{width:100%;flex:1 1 100%}}
</style>
