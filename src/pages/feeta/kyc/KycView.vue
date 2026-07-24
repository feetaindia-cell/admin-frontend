<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading KYC detail..." />
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else>
      <section class="kyc-hero mb-24">
        <div class="avatar-lg">
          <img v-if="kyc.agent?.profile_pic" :src="mediaUrl(kyc.agent.profile_pic)" :alt="agentName(kyc)" />
          <span v-else>{{ initials(agentName(kyc)) }}</span>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h4 class="mb-0">{{ agentName(kyc) }}</h4>
            <span :class="['kyc-badge', statusClass(kyc.status)]">{{ statusLabel(kyc.status) }}</span>
          </div>
          <div class="hero-meta mt-10">
            <span><iconify-icon icon="ri:mail-line" />{{ safe(kyc.agent?.email) }}</span>
            <span><iconify-icon icon="ri:phone-line" />{{ safe(kyc.agent?.phone) }}</span>
            <span><iconify-icon icon="ri:calendar-line" />Submitted {{ formatDate(kyc.submitted_at || kyc.created_at, true) }}</span>
          </div>
        </div>
        <div class="hero-actions">
          <router-link to="/kyc" class="btn btn-outline-primary-600"><iconify-icon icon="ri:arrow-left-line" /> Back</router-link>
          <router-link v-if="auth.hasPermission('agent.view')" :to="`/agents/${kyc.agent_id}`" class="btn btn-outline-primary-600"><iconify-icon icon="ri:user-star-line" /> View Agent Profile</router-link>
          <button v-if="auth.hasPermission('kyc.approve') && !isVerified" class="btn btn-success-600" @click="verify"><iconify-icon icon="ri:check-line" /> Verify</button>
          <button v-if="auth.hasPermission('kyc.reject') && !isRejected" class="btn btn-outline-danger" @click="reject"><iconify-icon icon="ri:close-line" /> Reject</button>
        </div>
      </section>

      <div class="profile-tabs mb-24">
        <button v-for="tab in visibleTabs" :key="tab.key" :class="{ active: activeTab === tab.key }" type="button" @click="activeTab = tab.key">
          <iconify-icon :icon="tab.icon" />{{ tab.label }}
        </button>
      </div>

      <section v-if="activeTab === 'overview'" class="row gy-4">
        <div class="col-xl-7">
          <div class="detail-card">
            <SectionTitle icon="ri:id-card-line" title="Basic Information" />
            <div class="info-grid">
              <Info label="Agent ID" :value="kyc.agent_id" />
              <Info label="KYC Request ID" :value="kyc.kyc_request_id" />
              <Info label="Email" :value="kyc.agent?.email" />
              <Info label="Phone" :value="kyc.agent?.phone" />
              <Info label="Current Status" :value="statusLabel(kyc.status)" />
              <Info label="Verification Status" :value="statusLabel(kyc.verification_status)" />
              <Info label="Submitted Date" :value="formatDate(kyc.submitted_at || kyc.created_at, true)" />
              <Info label="Reviewed Date" :value="formatDate(kyc.verified_at || kyc.rejected_at, true)" />
              <Info label="Reviewer" :value="kyc.reviewed_by?.admin_id ? `Admin #${kyc.reviewed_by.admin_id}` : null" />
            </div>
          </div>
        </div>
        <div class="col-xl-5">
          <div class="detail-card mb-24">
            <SectionTitle icon="ri:briefcase-line" title="Business Details" />
            <div class="side-list">
              <div><span>Agency</span><strong>{{ safe(kyc.agent?.agency_name) }}</strong></div>
              <div><span>RERA ID</span><strong>{{ safe(kyc.agent?.rera_id) }}</strong></div>
              <div><span>City</span><strong>{{ safe(kyc.agent?.city) }}</strong></div>
              <div><span>Operations</span><strong>{{ safe(kyc.profile?.operations) }}</strong></div>
              <div><span>Experience</span><strong>{{ safe(kyc.profile?.experience) }}</strong></div>
              <div><span>Accreditation</span><strong>{{ safe(kyc.profile?.accreditation) }}</strong></div>
            </div>
          </div>
          <div class="detail-card">
            <SectionTitle icon="ri:map-pin-line" title="Address" />
            <p class="mb-0 text-secondary-light">{{ safe(kyc.profile?.address) }}</p>
          </div>
        </div>
      </section>

      <section v-if="activeTab === 'history'" class="detail-card">
        <SectionTitle icon="ri:history-line" title="KYC Timeline" />
        <div v-if="history.length" class="timeline-list">
          <div v-for="item in history" :key="item.id" class="timeline-item">
            <span class="timeline-dot"></span>
            <div><strong>{{ statusLabel(item.action) }}</strong><p>{{ safe(item.description) }}</p><small>{{ formatDate(item.created_at, true) }}</small></div>
          </div>
        </div>
        <EmptyState v-else icon="ri:history-line" title="No history found" message="KYC timeline will appear after admin activity." />
      </section>

      <section v-if="activeTab === 'remarks'" class="detail-card">
        <SectionTitle icon="ri:chat-check-line" title="Remarks" />
        <div v-if="kyc.remarks?.length" class="remark-list mb-20">
          <div v-for="remark in kyc.remarks" :key="remark.id" class="remark-item">
            <strong>{{ statusLabel(remark.action) }}</strong>
            <p>{{ safe(remark.description) }}</p>
            <small>{{ formatDate(remark.created_at, true) }}</small>
          </div>
        </div>
        <EmptyState v-else class="mb-20" icon="ri:chat-1-line" title="No remarks yet" message="Add a remark for internal KYC tracking." />
        <div v-if="auth.hasPermission('kyc.remarks')" class="remark-form">
          <textarea v-model.trim="remarkText" class="form-control" rows="4" placeholder="Write admin remark..."></textarea>
          <div class="d-flex justify-content-end gap-2 mt-12">
            <button class="btn btn-outline-primary-600" @click="load">Refresh</button>
            <button class="btn btn-primary-600" :disabled="!remarkText || savingRemark" @click="addRemark">
              <span v-if="savingRemark" class="spinner-border spinner-border-sm"></span>
              <iconify-icon v-else icon="ri:save-line" /> Save Remark
            </button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import kycService from '@/services/kycService'
import { useAuthStore } from '@/stores/auth'
import { formatDate, safeValue } from '@/utils/finance'
import { mediaUrl } from '@/utils/mediaUrl'
import { agentName, statusClass, statusLabel } from './kycUtils'

const Info = defineComponent({ props: { label: String, value: [String, Number] }, setup: (p) => () => h('div', { class: 'info-item' }, [h('span', p.label), h('strong', safeValue(p.value))]) })
const SectionTitle = defineComponent({ props: { icon: String, title: String, compact: Boolean }, setup: (p) => () => h('div', { class: ['section-title', p.compact ? 'mb-0' : ''] }, [h('span', [h('iconify-icon', { icon: p.icon })]), h('h6', { class: 'mb-0' }, p.title)]) })
const route = useRoute()
const auth = useAuthStore()
const kyc = ref({})
const history = ref([])
const loading = ref(true)
const error = ref('')
const activeTab = ref(String(route.query.tab || 'overview'))
const savingRemark = ref(false)
const remarkText = ref('')
const tabs = [
  { key: 'overview', label: 'Overview', icon: 'ri:id-card-line', permissions: ['kyc.view'] },
  { key: 'history', label: 'History', icon: 'ri:history-line', permissions: ['kyc.history.view'] },
  { key: 'remarks', label: 'Remarks', icon: 'ri:chat-check-line', permissions: ['kyc.remarks', 'kyc.view'] },
]
const visibleTabs = computed(() => tabs.filter((tab) => auth.hasAnyPermission(tab.permissions)))
const isVerified = computed(() => String(kyc.value.status || kyc.value.verification_status).toLowerCase() === 'verified')
const isRejected = computed(() => String(kyc.value.status || kyc.value.verification_status).toLowerCase() === 'rejected')
function safe(value) { return safeValue(value) }
function initials(name) { return String(name || 'A').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A' }
async function load() {
  loading.value = true
  error.value = ''
  try {
    kyc.value = await kycService.getSubmission(route.params.id)
    history.value = kyc.value.history || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
async function loadHistory() { history.value = await kycService.getHistory(route.params.id) }
async function verify() {
  const result = await Swal.fire({ title: 'Verify KYC?', input: 'textarea', inputLabel: 'Remarks', icon: 'question', showCancelButton: true, confirmButtonText: 'Verify' })
  if (!result.isConfirmed) return
  kyc.value = await kycService.approve(route.params.id, { remarks: result.value || 'KYC verified' })
  await Swal.fire({ icon: 'success', title: 'KYC verified', timer: 1200, showConfirmButton: false })
  await loadHistory()
}
async function reject() {
  const result = await Swal.fire({ title: 'Reject KYC', html: '<input id="reason" class="swal2-input" placeholder="Reason"><textarea id="remarks" class="swal2-textarea" placeholder="Remarks"></textarea>', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Reject', preConfirm: () => { const reason = document.getElementById('reason').value.trim(); const remarks = document.getElementById('remarks').value.trim(); if (!reason) return Swal.showValidationMessage('Reason is required'); return { reason, remarks } } })
  if (!result.isConfirmed) return
  kyc.value = await kycService.reject(route.params.id, result.value)
  await Swal.fire({ icon: 'success', title: 'KYC rejected', timer: 1200, showConfirmButton: false })
  await loadHistory()
}
async function addRemark() {
  savingRemark.value = true
  try {
    kyc.value = await kycService.addRemark(route.params.id, { remarks: remarkText.value })
    remarkText.value = ''
    history.value = kyc.value.history || []
    await Swal.fire({ icon: 'success', title: 'Remark added', timer: 1000, showConfirmButton: false })
  } finally {
    savingRemark.value = false
  }
}
onMounted(load)
</script>

<style scoped>
.kyc-hero{display:flex;align-items:center;gap:20px;padding:26px;border:1px solid #dce6fa;border-radius:16px;background:linear-gradient(135deg,#fff,#edf4ff)}.avatar-lg{width:82px;height:82px;display:grid;place-items:center;flex:0 0 82px;overflow:hidden;border:4px solid #fff;border-radius:22px;color:#fff;background:linear-gradient(135deg,#487fff,#315ed1);font-size:27px;font-weight:750}.avatar-lg img{width:100%;height:100%;object-fit:cover}.hero-meta{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.hero-meta>span{display:inline-flex;align-items:center;gap:7px;color:#475569;font-size:13px}.hero-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;max-width:620px}.kyc-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}.profile-tabs{display:flex;flex-wrap:wrap;gap:10px}.profile-tabs button{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid #dbe3ee;border-radius:999px;background:#fff;color:#475569;font-weight:700}.profile-tabs button.active,.profile-tabs button:hover{color:#315ed1;border-color:#a9c2ff;background:#edf3ff}.detail-card{padding:22px;border:1px solid #e5eaf2;border-radius:14px;background:#fff}.section-title{display:flex;align-items:center;gap:12px;margin-bottom:18px}.section-title>span{width:40px;height:40px;display:grid;place-items:center;border-radius:10px;color:#487fff;background:#edf3ff;font-size:20px}.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0 28px}:deep(.info-item){display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #f0f3f7}:deep(.info-item span),.side-list span{color:#64748b}:deep(.info-item strong),.side-list strong{text-align:right;color:#172033;word-break:break-word}.side-list>div{display:flex;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #f0f3f7}.timeline-list,.remark-list{display:flex;flex-direction:column;gap:14px}.timeline-item{position:relative;display:flex;gap:14px;padding:14px;border:1px solid #edf1f6;border-radius:12px;background:#f8fafc}.timeline-dot{width:12px;height:12px;flex:0 0 12px;margin-top:5px;border-radius:999px;background:#487fff}.timeline-item p,.remark-item p{margin:5px 0;color:#475569}.timeline-item small,.remark-item small{color:#94a3b8}.remark-item{padding:14px;border:1px solid #edf1f6;border-radius:12px;background:#f8fafc}@media(max-width:991px){.kyc-hero{align-items:flex-start;flex-wrap:wrap}.hero-actions{justify-content:flex-start;max-width:none;width:100%}}@media(max-width:575px){.kyc-hero{flex-direction:column}.info-grid{grid-template-columns:1fr}}
</style>
