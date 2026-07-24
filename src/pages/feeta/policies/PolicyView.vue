<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading policy section..." />
    <div v-else-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>

    <div v-else class="row gy-4 policy-detail-layout">
      <div class="col-xl-8">
        <section class="policy-detail-head mb-24">
          <div>
            <div class="d-flex align-items-center gap-8 flex-wrap mb-10">
              <span class="badge bg-primary-focus text-primary-600 text-capitalize">{{ displayType(policy.policy_type) }}</span>
              <span class="section-chip">Section {{ policy.section_no }}</span>
            </div>
            <h3 class="mb-0">{{ policy.title || 'Untitled section' }}</h3>
          </div>
          <StatusBadge :status="policy.is_active ? 'Active' : 'Inactive'" />
        </section>

        <div class="card radius-12 policy-content-card">
          <div class="card-body p-24">
            <div class="reader-meta mb-20">
              <span><iconify-icon icon="ri:file-word-line" /> {{ wordCount }} words</span>
              <span><iconify-icon icon="ri:time-line" /> Updated {{ formatDate(policy.updated_at) }}</span>
            </div>
            <div class="policy-content" v-html="policy.content || '<p>No content available.</p>'"></div>
          </div>
        </div>
      </div>

      <div class="col-xl-4">
        <div class="policy-side-stack">
        <div class="card radius-12 mb-24 policy-side-card">
          <div class="card-header border-bottom"><h6 class="mb-0">Section Information</h6></div>
          <div class="card-body p-24 d-flex flex-column gap-16">
            <div class="detail-row"><span class="detail-label">Policy Type</span><strong class="text-capitalize">{{ displayType(policy.policy_type) }}</strong></div>
            <div class="detail-row"><span class="detail-label">Section Number</span><strong>{{ policy.section_no }}</strong></div>
            <div class="detail-row"><span class="detail-label">Created At</span><strong>{{ formatDate(policy.created_at) }}</strong></div>
            <div class="detail-row"><span class="detail-label">Updated At</span><strong>{{ formatDate(policy.updated_at) }}</strong></div>
          </div>
        </div>

        <div class="card radius-12 policy-side-card">
          <div class="card-header border-bottom"><h6 class="mb-0">Actions</h6></div>
          <div class="card-body p-24 d-grid gap-10">
            <router-link v-if="auth.hasPermission('policy.update')" :to="`/policies/sections/${policy.id}/edit`" class="btn btn-primary-600"><iconify-icon icon="ri:edit-line" class="me-6" />Edit Section</router-link>
            <button v-if="auth.hasPermission('policy.status')" type="button" class="btn btn-outline-primary-600" :disabled="working" @click="toggleStatus"><iconify-icon :icon="policy.is_active ? 'ri:pause-circle-line' : 'ri:play-circle-line'" class="me-6" />{{ policy.is_active ? 'Deactivate Section' : 'Activate Section' }}</button>
            <button v-if="auth.hasPermission('policy.delete') && policy.is_active" type="button" class="btn btn-outline-warning" :disabled="working" @click="deactivate"><iconify-icon icon="ri:archive-line" class="me-6" />Move to Inactive</button>
            <router-link :to="`/policies/${policy.policy_type}`" class="btn btn-outline-secondary"><iconify-icon icon="ri:folder-open-line" class="me-6" />Back to Policy</router-link>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import policyService from '@/services/policyService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const policy = ref({})
const loading = ref(true)
const working = ref(false)
const error = ref('')

const displayType = (value) => String(value || '').replaceAll('_', ' ')
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-'
const wordCount = computed(() => String(policy.value?.content || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim().split(/\s+/).filter(Boolean).length)

async function load() {
  loading.value = true
  error.value = ''
  try {
    policy.value = await policyService.getPolicySection(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function toggleStatus() {
  const next = !policy.value.is_active
  const result = await Swal.fire({ title: next ? 'Activate section?' : 'Deactivate section?', text: policy.value.title, icon: next ? 'question' : 'warning', showCancelButton: true, confirmButtonText: next ? 'Activate' : 'Deactivate' })
  if (!result.isConfirmed) return
  working.value = true
  try {
    policy.value = await policyService.updatePolicySectionStatus(policy.value.id, { is_active: next })
    await Swal.fire({ icon: 'success', title: `Section ${next ? 'activated' : 'deactivated'}`, timer: 1200, showConfirmButton: false })
  } catch (err) {
    await Swal.fire('Status update failed', err.message, 'error')
  } finally {
    working.value = false
  }
}

async function deactivate() {
  const result = await Swal.fire({ title: 'Move section to inactive?', text: 'This does not permanently delete the policy section.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Move to Inactive' })
  if (!result.isConfirmed) return
  working.value = true
  try {
    policy.value = await policyService.deletePolicySection(policy.value.id)
    await Swal.fire({ icon: 'success', title: 'Section moved to inactive', timer: 1200, showConfirmButton: false })
  } catch (err) {
    await Swal.fire('Deactivate failed', err.message, 'error')
  } finally {
    working.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.policy-detail-head {
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
.section-chip {
  color: var(--text-secondary-light);
  font-size: 13px;
  font-weight: 600;
}
.policy-content-card,
.policy-side-card {
  border: 1px solid rgba(148, 163, 184, .18);
  box-shadow: 0 12px 28px rgba(15, 23, 42, .04);
}
.policy-side-stack {
  position: sticky;
  top: 92px;
}
.reader-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(148, 163, 184, .16);
}
.reader-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  color: var(--text-secondary-light);
  background: var(--neutral-50);
  font-size: 12px;
  font-weight: 700;
}
.policy-content {
  max-width: 820px;
  overflow-wrap: anywhere;
  color: var(--text-secondary-light);
  font-size: 15px;
  line-height: 1.75;
}
.policy-content :deep(h1),
.policy-content :deep(h2),
.policy-content :deep(h3),
.policy-content :deep(h4),
.policy-content :deep(h5),
.policy-content :deep(h6) {
  margin-top: 22px;
  margin-bottom: 10px;
  color: var(--text-primary-light);
}
.policy-content :deep(p) {
  margin-bottom: 14px;
}
.policy-content :deep(ul),
.policy-content :deep(ol) {
  padding-left: 22px;
  margin-bottom: 16px;
}
.policy-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}
.policy-content :deep(a) {
  overflow-wrap: anywhere;
}
.detail-row {
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, .14);
  border-radius: 10px;
  background: var(--neutral-50);
}
.detail-label {
  display: block;
  margin-bottom: 4px;
  color: var(--text-secondary-light);
  font-size: 12px;
  letter-spacing: .05em;
  text-transform: uppercase;
}
@media (max-width: 575px) {
  .policy-detail-head {
    flex-direction: column;
    padding: 20px;
  }
}
@media (max-width: 1199px) {
  .policy-side-stack {
    position: static;
  }
}
:global(.dark) .policy-detail-head,
:global(.dark) .policy-content-card,
:global(.dark) .policy-side-card {
  background: var(--neutral-900);
  border-color: rgba(148, 163, 184, .20);
}
</style>
