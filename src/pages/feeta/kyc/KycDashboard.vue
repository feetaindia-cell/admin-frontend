<template>
  <div class="dashboard-main-body">
<div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-24">
      <div>
        <h5 class="mb-4">KYC management</h5>
        <p class="text-secondary-light mb-0">Review and manage agent verification submissions.</p>
      </div>
      <div class="d-flex gap-8 flex-wrap">
        <router-link to="/kyc/pending" class="btn btn-primary-600"><iconify-icon icon="ri:time-line" /> Pending KYC</router-link>
        <button class="btn btn-outline-primary-600" :disabled="loading" @click="load"><iconify-icon icon="ri:refresh-line" /> Refresh</button>
      </div>
    </div>

    <ErrorState v-if="error" :message="error" @retry="load" />
    <template v-else>
      <div class="row gy-4">
        <div v-for="card in cards" :key="card.label" class="col-sm-6 col-xl-3">
          <div class="stat-card">
            <div :class="['stat-icon', card.iconClass]"><iconify-icon :icon="card.icon" /></div>
            <div>
              <span>{{ card.label }}</span>
              <strong>{{ loading ? '...' : card.value }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="row gy-4 mt-1">
        <div class="col-xl-8">
          <div class="card radius-12 h-100">
            <div class="card-header bg-base border-bottom"><h6 class="mb-0">Review queues</h6></div>
            <div class="card-body queue-grid">
              <router-link v-for="queue in queues" :key="queue.path" :to="queue.path" class="queue-card">
                <iconify-icon :icon="queue.icon" />
                <div><strong>{{ queue.label }}</strong><span>{{ queue.text }}</span></div>
              </router-link>
            </div>
          </div>
        </div>
        <div class="col-xl-4">
          <div class="card radius-12 h-100">
            <div class="card-header bg-base border-bottom d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Quick actions</h6>
              <router-link to="/kyc/all" class="text-primary-600 text-sm">View all</router-link>
            </div>
            <div class="card-body d-flex flex-column gap-12">
              <router-link class="btn btn-outline-primary-600 justify-content-start" to="/kyc/all"><iconify-icon icon="ri:file-list-3-line" /> All submissions</router-link>
              <router-link class="btn btn-outline-warning justify-content-start" to="/kyc/pending"><iconify-icon icon="ri:time-line" /> Pending review</router-link>
              <router-link class="btn btn-outline-info justify-content-start" to="/kyc/submitted"><iconify-icon icon="ri:send-plane-line" /> Submitted KYC</router-link>
              <router-link class="btn btn-outline-success justify-content-start" to="/kyc/verified"><iconify-icon icon="ri:shield-check-line" /> Verified KYC</router-link>
              <router-link class="btn btn-outline-danger justify-content-start" to="/kyc/rejected"><iconify-icon icon="ri:close-circle-line" /> Rejected KYC</router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ErrorState from '@/components/common/ErrorState.vue'
import kycService from '@/services/kycService'

const loading = ref(true)
const error = ref('')
const stats = ref({})
const cards = computed(() => [
  { label: 'Total KYC', value: stats.value.total_submissions ?? 0, icon: 'ri:file-list-3-line', iconClass: 'bg-primary-50 text-primary-600' },
  { label: 'Pending', value: stats.value.pending ?? 0, icon: 'ri:time-line', iconClass: 'bg-warning-focus text-warning-600' },
  { label: 'Submitted', value: stats.value.submitted ?? 0, icon: 'ri:send-plane-line', iconClass: 'bg-info-focus text-info-600' },
  { label: 'Verified', value: stats.value.verified ?? 0, icon: 'ri:shield-check-line', iconClass: 'bg-success-focus text-success-600' },
  { label: 'Rejected', value: stats.value.rejected ?? 0, icon: 'ri:close-circle-line', iconClass: 'bg-danger-100 text-danger-600' },
  { label: "Today's Submissions", value: stats.value.today_submissions ?? 0, icon: 'ri:calendar-check-line', iconClass: 'bg-primary-50 text-primary-600' },
  { label: 'This Month Verified', value: stats.value.this_month_verified ?? 0, icon: 'ri:calendar-event-line', iconClass: 'bg-success-focus text-success-600' },
])
const queues = [
  { label: 'Pending KYC', text: 'Agents waiting for admin review', path: '/kyc/pending', icon: 'ri:time-line' },
  { label: 'Submitted KYC', text: 'Agents who submitted KYC for review', path: '/kyc/submitted', icon: 'ri:send-plane-line' },
  { label: 'Verified KYC', text: 'Verified agents and review record', path: '/kyc/verified', icon: 'ri:shield-check-line' },
  { label: 'Rejected KYC', text: 'Rejected submissions and reasons', path: '/kyc/rejected', icon: 'ri:close-circle-line' },
]
async function load() {
  loading.value = true
  error.value = ''
  try { stats.value = await kycService.getStatistics() } catch (err) { error.value = err.message } finally { loading.value = false }
}
onMounted(load)
</script>

<style scoped>
.stat-card{height:100%;display:flex;align-items:center;gap:14px;padding:20px;border:1px solid #e5eaf2;border-radius:14px;background:#fff}.stat-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:14px;font-size:24px}.stat-card span{display:block;color:#64748b;font-size:12px}.stat-card strong{display:block;margin-top:4px;color:#172033;font-size:24px}.queue-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.queue-card{display:flex;align-items:center;gap:13px;padding:16px;border:1px solid #e4ebf7;border-radius:14px;color:#172033;background:#f8fbff;text-decoration:none}.queue-card:hover{border-color:#a9c2ff;background:#edf3ff}.queue-card iconify-icon{font-size:24px;color:#487fff}.queue-card span{display:block;color:#64748b;font-size:12px}@media(max-width:767px){.queue-grid{grid-template-columns:1fr}}
</style>
