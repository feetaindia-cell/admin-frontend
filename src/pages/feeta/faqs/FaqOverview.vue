<template>
  <div class="dashboard-main-body">
<div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-24">
      <div>
        <h4 class="mb-4">FAQ Sections</h4>
        <p class="text-secondary-light mb-0">Choose a section to manage its questions and answers.</p>
      </div>
      <router-link v-if="auth.hasPermission('faq.section.create')" to="/faqs/sections/create" class="btn btn-primary-600">
        <iconify-icon icon="ri:add-line" class="me-6" />Add Section
      </router-link>
    </div>

    <div class="row gy-4 mb-24">
      <div v-for="card in cards" :key="card.label" class="col-sm-6 col-xl-3">
        <div class="summary-card">
          <span class="summary-icon bg-primary-50 text-primary-600"><iconify-icon :icon="card.icon" /></span>
          <div><span class="text-secondary-light text-sm">{{ card.label }}</span><h5 class="mb-0 mt-4">{{ card.value }}</h5></div>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <div class="card radius-12">
      <div class="card-header bg-base border-bottom p-20">
        <div class="faq-toolbar">
          <label class="search-control"><iconify-icon icon="ri:search-line" /><input v-model="search" type="search" placeholder="Search sections, questions, or answers" /><button v-if="search" type="button" class="search-clear" aria-label="Clear FAQ search" @click="search = ''"><iconify-icon icon="ri:close-line" /></button></label>
          <select v-model="status" class="form-select"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          <button type="button" class="btn btn-outline-primary-600" :disabled="loading" @click="load"><iconify-icon icon="ri:refresh-line" class="me-6" />Refresh</button>
        </div>
      </div>
      <LoadingState v-if="loading" message="Loading FAQ sections..." />
      <div v-else class="card-body p-24">
        <p v-if="search.trim()" class="text-secondary-light text-sm mb-16">{{ filteredSections.length }} section{{ filteredSections.length === 1 ? '' : 's' }} matched “{{ search.trim() }}”</p>
        <div v-if="filteredSections.length" class="row gy-4">
          <div v-for="section in filteredSections" :key="section.section_id" class="col-xl-4 col-md-6">
            <article class="faq-section-card">
              <div class="d-flex justify-content-between align-items-start gap-3 mb-16">
                <div class="section-icon"><iconify-icon icon="ri:folder-3-line" /></div>
                <StatusBadge :status="section.is_active ? 'Active' : 'Inactive'" />
              </div>
              <p class="text-primary-600 text-sm fw-semibold mb-4">Section {{ section.section_no }}</p>
              <h5 class="mb-8">{{ section.title }}</h5>
              <p class="text-secondary-light mb-12">{{ section.items?.length || 0 }} question{{ section.items?.length === 1 ? '' : 's' }}</p>
              <div v-if="search.trim()" class="match-list mb-16">
                <template v-if="matchingItems(section).length">
                  <router-link v-for="item in matchingItems(section).slice(0, 3)" :key="item.item_id" :to="`/faqs/questions/${item.item_id}`" class="match-item">
                    <iconify-icon icon="ri:question-line" /><span>{{ item.question }}</span>
                  </router-link>
                  <span v-if="matchingItems(section).length > 3" class="text-secondary-light text-xs">+{{ matchingItems(section).length - 3 }} more matching questions</span>
                </template>
                <span v-else class="text-primary-600 text-sm"><iconify-icon icon="ri:folder-search-line" class="me-4" />Section name matched</span>
              </div>
              <div class="d-flex gap-2 flex-wrap mt-auto">
                <router-link :to="`/faqs/sections/${section.section_id}`" class="btn btn-sm btn-primary-600 flex-grow-1"><iconify-icon icon="ri:eye-line" class="me-4" />Manage Questions</router-link>
                <router-link v-if="auth.hasPermission('faq.section.update')" :to="`/faqs/sections/${section.section_id}/edit`" class="btn btn-sm btn-outline-primary-600" title="Edit section"><iconify-icon icon="ri:edit-line" /></router-link>
                <button v-if="auth.hasPermission('faq.section.status')" type="button" class="btn btn-sm btn-outline-secondary" :disabled="workingId === section.section_id" :title="section.is_active ? 'Deactivate section' : 'Activate section'" @click="toggleSection(section)"><iconify-icon :icon="section.is_active ? 'ri:pause-circle-line' : 'ri:play-circle-line'" /></button>
              </div>
            </article>
          </div>
        </div>
        <EmptyState v-else icon="ri:folder-3-line" title="No FAQ sections found" message="Create a section first, then add questions inside it." />
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import faqService from '@/services/faqService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const sections = ref([])
const search = ref('')
const status = ref('')
const loading = ref(false)
const workingId = ref(null)
const error = ref('')

const allQuestions = computed(() => sections.value.flatMap((section) => section.items || []))
const cards = computed(() => [
  { label: 'Sections', value: sections.value.length, icon: 'ri:folder-3-line' },
  { label: 'Active Sections', value: sections.value.filter((section) => section.is_active).length, icon: 'ri:checkbox-circle-line' },
  { label: 'Questions', value: allQuestions.value.length, icon: 'ri:question-line' },
  { label: 'Active Questions', value: allQuestions.value.filter((item) => item.is_active).length, icon: 'ri:chat-check-line' },
])
const searchTerms = computed(() => normalize(search.value).split(/\s+/).filter(Boolean))
const filteredSections = computed(() => {
  const terms = searchTerms.value
  return sections.value.filter((section) => {
    const matchesStatus = !status.value || (status.value === 'active' ? section.is_active : !section.is_active)
    const sectionMatch = matches([section.title, section.slug], terms)
    return matchesStatus && (!terms.length || sectionMatch || matchingItems(section).length > 0)
  })
})

function normalize(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function matches(values, terms = searchTerms.value) {
  if (!terms.length) return true
  const text = normalize(values.join(' '))
  return terms.every((term) => text.includes(term))
}

function matchingItems(section) {
  if (!searchTerms.value.length) return section.items || []
  return (section.items || []).filter((item) => matches([item.question, item.answer]))
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const result = await faqService.getFaqTree()
    sections.value = Array.isArray(result) ? result : result?.data || []
  } catch (err) {
    sections.value = []
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function toggleSection(section) {
  const next = !section.is_active
  const result = await Swal.fire({ title: `${next ? 'Activate' : 'Deactivate'} section?`, text: section.title, icon: next ? 'question' : 'warning', showCancelButton: true, confirmButtonText: next ? 'Activate' : 'Deactivate' })
  if (!result.isConfirmed) return
  workingId.value = section.section_id
  try {
    await faqService.updateSectionStatus(section.section_id, { is_active: next })
    await load()
  } catch (err) {
    await Swal.fire('Status update failed', err.message, 'error')
  } finally {
    workingId.value = null
  }
}

watch(() => route.query.search, (value) => { search.value = String(value || '') })
onMounted(() => { search.value = String(route.query.search || ''); load() })
</script>

<style scoped>
.summary-card{height:100%;display:flex;align-items:center;gap:14px;padding:18px;border:1px solid #e5eaf2;border-radius:14px;background:#fff}.summary-icon,.section-icon{display:grid;place-items:center;color:var(--primary-600);background:var(--primary-50)}.summary-icon{width:46px;height:46px;border-radius:12px;font-size:22px}.section-icon{width:44px;height:44px;border-radius:13px;font-size:21px}.faq-toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center}.faq-toolbar .form-select{width:180px}.search-control{min-height:44px;display:flex;align-items:center;gap:10px;padding:0 10px 0 14px;border:1px solid #d9e0ea;border-radius:10px;background:#fff;flex:1 1 300px}.search-control input{width:100%;border:0;outline:0;background:transparent}.search-clear{width:28px;height:28px;display:grid;place-items:center;flex:0 0 28px;border:0;border-radius:50%;color:var(--text-secondary-light);background:var(--neutral-100)}.faq-section-card{height:100%;display:flex;flex-direction:column;padding:20px;border:1px solid #e5eaf2;border-radius:14px;background:#fff;transition:transform .18s ease,box-shadow .18s ease}.faq-section-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(15,23,42,.08)}.match-list{display:flex;flex-direction:column;gap:7px;padding:10px;border-radius:10px;background:var(--neutral-50)}.match-item{display:flex;align-items:flex-start;gap:7px;min-width:0;color:var(--text-primary-light);font-size:13px;font-weight:600}.match-item iconify-icon{flex:0 0 auto;margin-top:2px;color:var(--primary-600)}.match-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@media(max-width:768px){.faq-toolbar>*,.faq-toolbar .form-select{width:100%;flex:1 1 100%}}
</style>
