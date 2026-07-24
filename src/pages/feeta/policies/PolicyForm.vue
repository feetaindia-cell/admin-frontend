<template>
  <div class="dashboard-main-body">
<div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading policy section..." />

    <div v-else class="row gy-4">
      <div class="col-xl-8">
        <div class="policy-editor-head mb-24">
          <div>
            <span class="policy-kicker">{{ isEdit ? 'Editing section' : 'New policy section' }}</span>
            <h4 class="mb-6">{{ isEdit ? 'Update policy section' : 'Add policy section' }}</h4>
            <p class="text-secondary-light mb-0">Write structured policy content and control whether it appears in the public response.</p>
          </div>
          <StatusBadge :status="form.is_active ? 'Active' : 'Inactive'" />
        </div>

        <div class="card radius-12 policy-form-card">
          <div class="card-header border-bottom"><h6 class="text-xl mb-0">Section details</h6></div>
          <div class="card-body p-24">
            <form class="d-flex flex-column gap-20" @submit.prevent="submit">
              <div class="row gy-3">
                <div class="col-md-7">
                  <label class="form-label fw-bold text-neutral-900" for="policy-type">Policy Type</label>
                  <input id="policy-type" :value="policyDisplayName" class="form-control border border-neutral-200 radius-8 bg-neutral-50" readonly />
                  <p class="text-secondary-light text-sm mt-1 mb-0">Policy type is fixed by the selected policy group.</p>
                </div>
                <div class="col-md-5">
                  <label class="form-label fw-bold text-neutral-900" for="section-number">Section No</label>
                  <input id="section-number" v-model.number="form.section_no" type="number" min="1" step="1" class="form-control border border-neutral-200 radius-8" required />
                  <div v-if="errors.section_no" class="text-danger-600 text-sm mt-1">{{ firstError('section_no') }}</div>
                </div>
              </div>

              <div>
                <label class="form-label fw-bold text-neutral-900" for="policy-title">Title</label>
                <input id="policy-title" v-model.trim="form.title" type="text" maxlength="200" class="form-control border border-neutral-200 radius-8" placeholder="Example: Data Collection" required />
                <div class="d-flex justify-content-between gap-2 mt-1"><span v-if="errors.title" class="text-danger-600 text-sm">{{ firstError('title') }}</span><span class="text-secondary-light text-xs ms-auto">{{ form.title.length }}/200</span></div>
              </div>

              <div>
                <label class="form-label fw-bold text-neutral-900">Content</label>
                <RichTextEditor v-model="form.content" placeholder="Write the complete policy section..." />
                <div v-if="errors.content" class="text-danger-600 text-sm mt-1">{{ firstError('content') }}</div>
              </div>

              <div class="form-check form-switch d-flex align-items-center gap-10 ps-0">
                <input id="policy-active" v-model="form.is_active" class="form-check-input ms-0" type="checkbox" role="switch" />
                <label class="form-check-label fw-semibold" for="policy-active">{{ form.is_active ? 'Active - visible on the public policy API' : 'Inactive - hidden from the public policy API' }}</label>
              </div>

              <div class="d-flex align-items-center gap-3 flex-wrap">
                <router-link :to="cancelPath" class="btn btn-outline-danger d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:close-line" />Cancel</router-link>
                <button type="submit" :disabled="saving" class="btn btn-primary-600 d-inline-flex align-items-center gap-6"><span v-if="saving" class="spinner-border spinner-border-sm" /><iconify-icon v-else icon="ri:save-line" />{{ saving ? 'Saving...' : 'Save Section' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-xl-4">
        <div class="card radius-12 policy-help-card mb-24">
          <div class="card-body p-24">
            <div class="policy-form-icon mb-16"><iconify-icon icon="ri:file-shield-2-line" /></div>
            <h6 class="mb-12">Policy section structure</h6>
            <p class="text-secondary-light mb-12">Each record is one ordered section inside a policy type.</p>
            <ul class="text-secondary-light ps-20 mb-0 d-flex flex-column gap-8">
              <li>Section numbers must be positive and unique within the selected type.</li>
              <li>Inactive sections remain available to admins.</li>
              <li>Only active sections appear in the public policy response.</li>
            </ul>
          </div>
        </div>

        <div class="card radius-12 policy-help-card policy-editor-meta">
          <div class="card-header border-bottom"><h6 class="mb-0">Writing summary</h6></div>
          <div class="card-body p-24">
            <div class="meta-grid">
              <div><span>Words</span><strong>{{ contentWordCount }}</strong></div>
              <div><span>Characters</span><strong>{{ plainTextLength }}</strong></div>
              <div><span>Section</span><strong>{{ form.section_no || 1 }}</strong></div>
              <div><span>Status</span><strong>{{ form.is_active ? 'Public' : 'Draft' }}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingState from '@/components/common/LoadingState.vue'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import policyService from '@/services/policyService'

const props = defineProps({ mode: { type: String, default: 'create' } })
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => props.mode === 'edit')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const errors = ref({})
const displayNames = { terms: 'Terms & Conditions', privacy: 'Privacy Policy', accessibility: 'Accessibility Policy', media: 'Media Policy' }
const form = reactive({ policy_type: String(route.params.policyType || ''), section_no: Number(route.query.section_no || 1), title: '', content: '', is_active: true })

const policyDisplayName = computed(() => displayNames[form.policy_type] || form.policy_type)
const cancelPath = computed(() => form.policy_type ? `/policies/${form.policy_type}` : '/policies')
const firstError = (field) => Array.isArray(errors.value[field]) ? errors.value[field][0] : errors.value[field]
const plainContent = () => String(form.content || '').replace(/<[^>]*>/g, '').replaceAll('&nbsp;', ' ').trim()
const contentWordCount = computed(() => plainContent().split(/\s+/).filter(Boolean).length)
const plainTextLength = computed(() => plainContent().length)

function validate() {
  const nextErrors = {}
  if (!form.policy_type) nextErrors.policy_type = ['Select a policy type.']
  if (!Number.isInteger(Number(form.section_no)) || Number(form.section_no) < 1) nextErrors.section_no = ['Section number must be a positive integer.']
  if (!form.title) nextErrors.title = ['Title is required.']
  if (!plainContent()) nextErrors.content = ['Content is required.']
  errors.value = nextErrors
  return !Object.keys(nextErrors).length
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (isEdit.value) {
      const policy = await policyService.getPolicySection(route.params.id)
      Object.assign(form, {
        policy_type: policy?.policy_type || '',
        section_no: Number(policy?.section_no || 1),
        title: policy?.title || '',
        content: policy?.content || '',
        is_active: Boolean(policy?.is_active),
      })
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function submit() {
  error.value = ''
  errors.value = {}
  if (!validate()) return
  saving.value = true
  try {
    const payload = { section_no: Number(form.section_no), title: form.title, content: form.content, is_active: Boolean(form.is_active) }
    const policy = isEdit.value
      ? await policyService.updatePolicySection(route.params.id, payload)
      : await policyService.createPolicySection(form.policy_type, payload)
    await Swal.fire({ icon: 'success', title: `Policy section ${isEdit.value ? 'updated' : 'created'}`, timer: 1200, showConfirmButton: false })
    await router.push(`/policies/sections/${policy?.id || route.params.id}`)
  } catch (err) {
    errors.value = err.errors || {}
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.policy-editor-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  padding: 26px;
  border: 1px solid rgba(148, 163, 184, .18);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(72, 127, 255, .08), rgba(34, 197, 94, .06)),
    var(--white);
  box-shadow: 0 16px 38px rgba(15, 23, 42, .05);
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
.policy-form-card,
.policy-help-card {
  border: 1px solid rgba(148, 163, 184, .18);
  box-shadow: 0 12px 28px rgba(15, 23, 42, .04);
}
.policy-form-card :deep(.form-control),
.policy-form-card :deep(.form-select) {
  min-height: 44px;
}
.policy-form-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: var(--primary-600);
  background: var(--primary-50);
  font-size: 26px;
}
.form-check-input {
  width: 42px;
  height: 22px;
  cursor: pointer;
}
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.meta-grid div {
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, .14);
  border-radius: 12px;
  background: var(--neutral-50);
}
.meta-grid span {
  display: block;
  margin-bottom: 5px;
  color: var(--text-secondary-light);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}
.meta-grid strong {
  color: var(--text-primary-light);
  font-size: 20px;
}
@media (max-width: 575px) {
  .policy-editor-head {
    flex-direction: column;
    padding: 20px;
  }
}
:global(.dark) .policy-editor-head,
:global(.dark) .policy-form-card,
:global(.dark) .policy-help-card {
  background: var(--neutral-900);
  border-color: rgba(148, 163, 184, .20);
}
</style>
