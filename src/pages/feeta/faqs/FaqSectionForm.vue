<template>
  <div class="dashboard-main-body">
<div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading section..." />

    <div v-else class="row gy-4">
      <div class="col-lg-8">
        <div class="card radius-12">
          <div class="card-header border-bottom">
            <h6 class="text-xl mb-0">{{ isEdit ? 'Update section' : 'Add new section' }}</h6>
          </div>
          <div class="card-body p-24">
            <form class="d-flex flex-column gap-20" @submit.prevent="submit">
              <div class="row gy-3">
                <div class="col-md-4">
                  <label class="form-label fw-bold text-neutral-900">Section No</label>
                  <input v-model.number="form.section_no" type="number" min="0" class="form-control border border-neutral-200 radius-8" />
                  <div v-if="errors.section_no" class="text-danger-600 text-sm mt-1">{{ errors.section_no[0] }}</div>
                </div>
                <div class="col-md-8">
                  <label class="form-label fw-bold text-neutral-900">Title</label>
                  <input v-model="form.title" type="text" class="form-control border border-neutral-200 radius-8" placeholder="Example: General Questions" />
                  <div v-if="errors.title" class="text-danger-600 text-sm mt-1">{{ errors.title[0] }}</div>
                </div>
              </div>
              <div>
                <label class="form-label fw-bold text-neutral-900">Slug</label>
                <input v-model="form.slug" type="text" class="form-control border border-neutral-200 radius-8" placeholder="general-questions" />
                <div v-if="errors.slug" class="text-danger-600 text-sm mt-1">{{ errors.slug[0] }}</div>
              </div>
              <div>
                <label class="form-label fw-bold text-neutral-900">Status</label>
                <select v-model="form.is_active" class="form-control border border-neutral-200 radius-8 form-select">
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </div>
              <div class="d-flex align-items-center gap-3 flex-wrap">
                <router-link :to="cancelPath" class="btn btn-outline-danger d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:close-line" />Cancel</router-link>
                <button type="submit" :disabled="saving" class="btn btn-primary-600 d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:save-line" />{{ saving ? 'Saving...' : 'Save Section' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card radius-12">
          <div class="card-body p-24">
            <h6 class="mb-12">FAQ section</h6>
            <p class="text-secondary-light mb-2">A section groups related questions together.</p>
            <p class="text-secondary-light mb-0">After saving, open the section to add and manage its questions.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingState from '@/components/common/LoadingState.vue'
import faqService from '@/services/faqService'

const props = defineProps({ mode: { type: String, default: 'create' } })
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => props.mode === 'edit')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const errors = ref({})
const form = reactive({ section_no: 0, title: '', slug: '', is_active: true })
const cancelPath = computed(() => isEdit.value ? `/faqs/sections/${route.params.id}` : '/faqs')
let slugTouched = false

const makeSlug = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

watch(() => form.title, (value) => {
  if (!isEdit.value && !slugTouched) form.slug = makeSlug(value)
})
watch(() => form.slug, () => { slugTouched = true })

async function loadSection() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const section = await faqService.getSection(route.params.id)
    Object.assign(form, {
      section_no: section.section_no ?? 0,
      title: section.title || '',
      slug: section.slug || '',
      is_active: Boolean(section.is_active),
    })
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function submit() {
  saving.value = true
  error.value = ''
  errors.value = {}
  try {
    const saved = isEdit.value ? await faqService.updateSection(route.params.id, form) : await faqService.createSection(form)
    router.push(`/faqs/sections/${saved?.section_id || route.params.id}`)
  } catch (err) {
    errors.value = err.errors || {}
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(loadSection)
</script>
