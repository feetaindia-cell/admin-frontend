<template>
  <div class="dashboard-main-body">
<section class="policy-hero mb-24">
      <div class="policy-hero-copy">
        <span class="policy-kicker">Policy workspace</span>
        <h4 class="mb-6">Manage legal and public policy content</h4>
        <p class="mb-0">Review active sections, identify unpublished content, and keep public policy pages consistent.</p>
      </div>
      <div class="policy-hero-actions">
        <span class="policy-health"><iconify-icon icon="ri:checkbox-circle-line" /> {{ totals.active }} public sections</span>
        <button type="button" class="btn btn-light-100" :disabled="loading" @click="load"><iconify-icon icon="ri:refresh-line" class="me-6" />Refresh</button>
      </div>
    </section>

    <div v-if="types.length" class="policy-summary mb-24">
      <div class="summary-card"><span>Policy groups</span><strong>{{ types.length }}</strong></div>
      <div class="summary-card"><span>Total sections</span><strong>{{ totals.sections }}</strong></div>
      <div class="summary-card"><span>Active sections</span><strong>{{ totals.active }}</strong></div>
      <div class="summary-card"><span>Inactive sections</span><strong>{{ totals.inactive }}</strong></div>
    </div>

    <div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading policy types..." />
    <div v-else-if="types.length" class="row gy-4">
      <div v-for="type in types" :key="type.policy_type" class="col-xxl-3 col-md-6">
        <div class="card radius-12 policy-type-card" role="button" tabindex="0" title="Manage" @click="openManage(type)" @keyup.enter="openManage(type)">
          <div class="card-body p-20">
            <div class="policy-card-top mb-14">
              <div class="policy-title-wrap">
                <div class="policy-type-icon"><iconify-icon :icon="iconFor(type.policy_type)" /></div>
                <div class="min-w-0">
                  <h5 class="mb-2">{{ type.display_name }}</h5>
                  <span class="policy-code">{{ type.policy_type }}</span>
                </div>
              </div>
            </div>
            <p class="policy-description mb-14">{{ descriptionFor(type.policy_type) }}</p>
            <div class="policy-meta-line mb-14">
              <span :class="['policy-state', statusTone(type)]">{{ statusLabel(type) }}</span>
              <span>{{ Number(type.total_sections || 0) }} section{{ Number(type.total_sections || 0) === 1 ? '' : 's' }}</span>
              <span>{{ completionPercent(type) }}% published</span>
            </div>
            <div v-if="showCoverage(type)" class="policy-progress mb-14">
              <div class="d-flex justify-content-between gap-2 mb-6"><span>Public coverage</span><strong>{{ completionPercent(type) }}%</strong></div>
              <div class="progress-track"><span :style="{ width: `${completionPercent(type)}%` }"></span></div>
            </div>
            <div class="policy-compact-stats mb-14">
              <div><strong>{{ type.active_sections }}</strong><span>Published</span></div>
              <div><strong>{{ type.inactive_sections }}</strong><span>Draft</span></div>
            </div>
            <p class="policy-updated mb-14" :title="formatDateTime(type.last_updated_at)"><iconify-icon icon="ri:time-line" class="me-6" />{{ relativeUpdated(type.last_updated_at) }}<span>{{ formatDateTime(type.last_updated_at) }}</span></p>
            <router-link :to="`/policies/${type.policy_type}`" class="btn btn-primary-600 w-100 policy-primary-action" @click.stop><iconify-icon icon="ri:folder-open-line" class="me-6" />Manage Policy</router-link>
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else icon="ri:folder-shield-2-line" title="No policy types available" message="The backend did not return any policy types." />
    <RowManageDialog v-model="manageOpen" :title="selectedType?.display_name" :subtitle="selectedType?.policy_type || ''">
      <router-link v-if="selectedType" :to="`/policies/${selectedType.policy_type}`"><iconify-icon icon="ri:folder-open-line" /> Manage Policy</router-link>
      <router-link v-if="selectedType && auth.hasPermission('policy.create')" :to="`/policies/${selectedType.policy_type}/create?section_no=${Number(selectedType.total_sections || 0) + 1}`"><iconify-icon icon="ri:add-line" /> Add Section</router-link>
      <span v-if="selectedType" class="disabled"><iconify-icon icon="ri:history-line" /> History</span>
    </RowManageDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import policyService from '@/services/policyService'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const types = ref([])
const loading = ref(false)
const error = ref('')
const manageOpen = ref(false)
const selectedType = ref(null)

const displayType = (value) => String(value || '').replaceAll('_', ' ')
const formatDateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(value)).replace(',', ' •') : 'No sections yet'
const relativeUpdated = (value) => {
  if (!value) return 'No updates yet'
  const diffMs = Date.now() - new Date(value).getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < minute) return 'Updated just now'
  if (diffMs < hour) return `Updated ${Math.max(1, Math.round(diffMs / minute))} min ago`
  if (diffMs < day) return `Updated ${Math.round(diffMs / hour)} hr ago`
  const days = Math.round(diffMs / day)
  if (days < 30) return `Updated ${days} day${days === 1 ? '' : 's'} ago`
  return 'Updated'
}
const totals = computed(() => types.value.reduce((sum, type) => ({
  sections: sum.sections + Number(type.total_sections || 0),
  active: sum.active + Number(type.active_sections || 0),
  inactive: sum.inactive + Number(type.inactive_sections || 0),
}), { sections: 0, active: 0, inactive: 0 }))
const iconFor = (type) => ({
  terms: 'ri:scroll-to-bottom-line',
  privacy: 'ri:lock-2-line',
  accessibility: 'ri:open-arm-line',
  media: 'ri:image-line',
})[type] || 'ri:file-shield-2-line'
const descriptionFor = (type) => ({
  terms: 'Customer-facing rules, service usage terms, and commercial commitments.',
  privacy: 'Data collection, consent, storage, sharing, and user rights content.',
  accessibility: 'Inclusive access, support channels, and usability commitments.',
  media: 'Brand, content, image, and publishing usage guidance.',
})[type] || `Sections stored under ${type}.`
const completionPercent = (type) => {
  const total = Number(type.total_sections || 0)
  if (!total) return 0
  return Math.round((Number(type.active_sections || 0) / total) * 100)
}
const statusLabel = (type) => {
  const total = Number(type.total_sections || 0)
  const inactive = Number(type.inactive_sections || 0)
  const active = Number(type.active_sections || 0)
  if (!total) return 'Draft'
  if (inactive > 0 && active > 0) return 'Review Required'
  if (inactive > 0) return 'Draft'
  return 'Published'
}
const statusTone = (type) => ({
  Published: 'published',
  Draft: 'draft',
  'Review Required': 'review',
})[statusLabel(type)] || 'draft'
const showCoverage = (type) => Number(type.total_sections || 0) > 0 && completionPercent(type) < 100
const openPolicy = (policyType) => router.push(`/policies/${policyType}`)
function openManage(type) {
  selectedType.value = type
  manageOpen.value = true
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await policyService.getPolicyGroups()
    types.value = Array.isArray(response) ? response : []
  } catch (err) {
    types.value = []
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.policy-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 28px;
  border: 1px solid rgba(72, 127, 255, .16);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(72, 127, 255, .12), rgba(34, 197, 94, .08)),
    var(--white);
  box-shadow: 0 18px 44px rgba(15, 23, 42, .06);
}
.policy-hero-copy p {
  max-width: 720px;
  color: var(--text-secondary-light);
}
.policy-hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.policy-health {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border: 1px solid rgba(34, 197, 94, .20);
  border-radius: 999px;
  color: #15803d;
  background: rgba(34, 197, 94, .10);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
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
.policy-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.summary-card {
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, .18);
  border-radius: 12px;
  background: var(--white);
  box-shadow: 0 10px 24px rgba(15, 23, 42, .04);
}
.summary-card span {
  display: block;
  margin-bottom: 6px;
  color: var(--text-secondary-light);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
.summary-card strong {
  color: var(--text-primary-light);
  font-size: 26px;
  line-height: 1;
}
.policy-type-card {
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, .16);
  background:
    linear-gradient(180deg, rgba(248, 250, 252, .62), rgba(255, 255, 255, 0) 58px),
    var(--white);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
}
.policy-type-card:hover {
  transform: translateY(-3px) scale(1.01);
  border-color: rgba(72, 127, 255, .34);
  box-shadow: 0 18px 34px rgba(15, 23, 42, .10);
}
.policy-type-card:focus-visible {
  outline: 3px solid rgba(72, 127, 255, .20);
  outline-offset: 3px;
}
.policy-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.policy-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.policy-title-wrap h5 {
  color: var(--text-primary-light);
  font-size: 18px;
  line-height: 1.25;
}
.policy-code {
  color: var(--text-secondary-light);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}
.policy-type-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: var(--primary-600);
  background: var(--primary-50);
  font-size: 22px;
}
.policy-menu-btn {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, .18);
  border-radius: 10px;
  color: var(--text-secondary-light);
  background: var(--white);
  font-size: 18px;
  transition: color .18s ease, border-color .18s ease, background .18s ease;
}
.policy-menu-btn:hover {
  color: var(--primary-600);
  border-color: rgba(72, 127, 255, .28);
  background: var(--primary-50);
}
.policy-description {
  min-height: 42px;
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-secondary-light);
  font-size: 13px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.policy-meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: var(--text-secondary-light);
  font-size: 12px;
  font-weight: 700;
}
.policy-state {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.policy-state.published {
  color: #15803d;
  background: rgba(34, 197, 94, .12);
}
.policy-state.review {
  color: #b45309;
  background: rgba(245, 158, 11, .14);
}
.policy-state.draft {
  color: #475569;
  background: rgba(100, 116, 139, .12);
}
.policy-progress span,
.policy-progress strong {
  color: var(--text-secondary-light);
  font-size: 12px;
  font-weight: 700;
}
.progress-track {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148, 163, 184, .16);
}
.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #487fff, #22c55e);
}
.policy-compact-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.policy-compact-stats div {
  display: flex;
  align-items: baseline;
  gap: 7px;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, .12);
  border-radius: 10px;
  background: var(--neutral-50);
}
.policy-compact-stats strong {
  color: var(--text-primary-light);
  font-size: 17px;
}
.policy-compact-stats span {
  color: var(--text-secondary-light);
  font-size: 12px;
  font-weight: 600;
}
.policy-updated {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary-light);
  font-size: 12px;
}
.policy-updated span {
  color: rgba(100, 116, 139, .82);
}
.policy-primary-action {
  min-height: 40px;
  box-shadow: 0 10px 18px rgba(72, 127, 255, .18);
  transition: transform .18s ease, box-shadow .18s ease;
}
.policy-primary-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(72, 127, 255, .24);
}
.min-w-0 {
  min-width: 0;
}
@media (max-width: 991px) {
  .policy-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 575px) {
  .policy-hero {
    align-items: stretch;
    flex-direction: column;
    padding: 20px;
  }
  .policy-hero-actions {
    justify-content: flex-start;
  }
  .policy-summary {
    grid-template-columns: 1fr;
  }
}
:global(.dark) .policy-hero,
:global(.dark) .summary-card,
:global(.dark) .policy-type-card {
  background: var(--neutral-900);
  border-color: rgba(148, 163, 184, .20);
}
</style>
