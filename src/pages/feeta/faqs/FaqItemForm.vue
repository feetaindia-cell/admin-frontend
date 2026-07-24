<template>
  <div class="dashboard-main-body">
<div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading FAQ question..." />
    <div v-else class="card radius-12">
      <div class="card-body p-24">
        <form class="d-flex flex-column gap-20" @submit.prevent="submit">
          <div class="row gy-3">
            <div class="col-md-6">
              <label class="form-label fw-bold text-neutral-900">FAQ Section</label>
              <input :value="sectionTitle" class="form-control border border-neutral-200 radius-8 bg-neutral-50" readonly />
              <p class="text-secondary-light text-sm mt-1 mb-0">This question belongs to the selected section.</p>
              <div v-if="errors.section_id" class="text-danger-600 text-sm mt-1">{{ errors.section_id[0] }}</div>
            </div>
            <div class="col-md-3"><label class="form-label fw-bold text-neutral-900">Question No</label><input v-model.number="form.question_no" type="number" min="0" class="form-control border border-neutral-200 radius-8" /><div v-if="errors.question_no" class="text-danger-600 text-sm mt-1">{{ errors.question_no[0] }}</div></div>
            <div class="col-md-3"><label class="form-label fw-bold text-neutral-900">Sort Order</label><input v-model.number="form.sort_order" type="number" min="0" class="form-control border border-neutral-200 radius-8" /></div>
          </div>
          <div><label class="form-label fw-bold text-neutral-900">Question</label><textarea v-model="form.question" rows="3" class="form-control border border-neutral-200 radius-8" placeholder="Enter the question"></textarea><div v-if="errors.question" class="text-danger-600 text-sm mt-1">{{ errors.question[0] }}</div></div>
          <div><label class="form-label fw-bold text-neutral-900">Answer</label><RichTextEditor v-model="form.answer" placeholder="Write the answer..." /><div v-if="errors.answer" class="text-danger-600 text-sm mt-1">{{ errors.answer[0] }}</div></div>
          <div class="col-md-4"><label class="form-label fw-bold text-neutral-900">Status</label><select v-model="form.is_active" class="form-control border border-neutral-200 radius-8 form-select"><option :value="true">Active</option><option :value="false">Inactive</option></select></div>
          <div class="d-flex align-items-center gap-3 flex-wrap"><router-link :to="sectionPath" class="btn btn-outline-danger"><iconify-icon icon="ri:close-line" class="me-6" />Cancel</router-link><button type="submit" :disabled="saving || !form.section_id" class="btn btn-primary-600"><iconify-icon icon="ri:save-line" class="me-6" />{{ saving ? 'Saving...' : 'Save Question' }}</button></div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingState from '@/components/common/LoadingState.vue'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import faqService from '@/services/faqService'

const props = defineProps({ mode: { type: String, default: 'create' } })
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => props.mode === 'edit')
const section = ref({})
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const errors = ref({})
const form = reactive({ section_id: Number(route.params.sectionId || 0), question_no: 0, question: '', answer: '', sort_order: 0, is_active: true })
const sectionTitle = computed(() => section.value.title || 'FAQ Section')
const sectionPath = computed(() => form.section_id ? `/faqs/sections/${form.section_id}` : '/faqs')

async function load() {
  loading.value = true
  try {
    if (isEdit.value) {
      const item = await faqService.getItem(route.params.id)
      Object.assign(form, { section_id: Number(item.section_id), question_no: item.question_no ?? 0, question: item.question || '', answer: item.answer || '', sort_order: item.sort_order ?? 0, is_active: Boolean(item.is_active) })
      section.value = item.section || await faqService.getSection(item.section_id)
    } else {
      section.value = await faqService.getSection(form.section_id)
      const questions = section.value.items || []
      form.question_no = Math.max(0, ...questions.map((item) => Number(item.question_no) || 0)) + 1
      form.sort_order = Math.max(0, ...questions.map((item) => Number(item.sort_order) || 0)) + 1
    }
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
    const payload = { ...form, section_id: Number(form.section_id), question_no: Number(form.question_no), sort_order: Number(form.sort_order), is_active: Boolean(form.is_active) }
    if (isEdit.value) await faqService.updateItem(route.params.id, payload)
    else await faqService.createItem(payload)
    await router.push(sectionPath.value)
  } catch (err) {
    errors.value = err.errors || {}
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
