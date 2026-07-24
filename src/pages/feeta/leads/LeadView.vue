<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading lead details..." />
    <div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="load" /></div>
    <template v-else>
      <header class="lead-header mb-24">
        <div class="lead-identity">
          <div class="lead-avatar">{{ userInitials }}</div>
          <div class="lead-title-block">
            <div class="lead-kicker">Lead #{{ lead.lead_id || lead.id }}</div>
            <h4>{{ safeValue(lead.user?.name, 'Unknown contact') }}</h4>
            <div class="lead-context">
              <span><iconify-icon icon="ri:home-4-line" />{{ safeValue(lead.category_name) }}</span>
              <span><iconify-icon icon="ri:key-2-line" />{{ titleCase(lead.purpose) }}</span>
              <span><iconify-icon icon="ri:map-pin-line" />{{ locationLabel }}</span>
            </div>
          </div>
        </div>
        <div class="header-controls">
          <div class="status-row">
            <LeadStatusBadge :status="lead.status" :overdue="lead.overdue" />
            <LeadStatusBadge :status="lead.lead_status" />
            <LeadStatusBadge :status="lead.deal_status" />
          </div>
          <div class="lead-actions">
            <router-link to="/leads" class="btn btn-outline-secondary-600"><iconify-icon icon="ri:arrow-left-line" class="me-6" />Back</router-link>
            <button class="btn btn-primary-600" @click="openAssign"><iconify-icon icon="ri:user-add-line" class="me-6" />{{ lead.assigned_agent?.id ? 'Reassign' : 'Assign Agent' }}</button>
          </div>
        </div>
      </header>

      <div class="row gy-4">
        <div class="col-xl-8">
          <section class="detail-section mb-20">
            <SectionTitle icon="ri:home-search-line" title="Property requirement" subtitle="What this contact is looking for" />
            <div class="facts-grid">
              <Info icon="ri:building-line" label="Category" :value="lead.category_name" />
              <Info icon="ri:key-line" label="Purpose" :value="titleCase(lead.purpose)" />
              <Info icon="ri:map-2-line" label="City" :value="lead.city" />
              <Info icon="ri:road-map-line" label="Preferred area" :value="lead.area" />
            </div>
          </section>

          <section class="detail-section mb-20">
            <div class="section-heading section-heading--split">
              <SectionTitle icon="ri:progress-3-line" title="Lead progress" subtitle="Current lifecycle and activity" compact />
              <div class="status-update">
                <select v-model="nextStatus" class="form-select" aria-label="Lead status">
                  <option v-for="item in statuses" :key="item" :value="item">{{ titleCase(item) }}</option>
                </select>
                <button class="btn btn-primary-600" :disabled="statusSaving || nextStatus === lead.status" @click="updateStatus">
                  <span v-if="statusSaving" class="spinner-border spinner-border-sm"></span>
                  <iconify-icon v-else icon="ri:check-line" />Save
                </button>
              </div>
            </div>
            <div class="facts-grid">
              <Info icon="ri:flag-line" label="Lead status" :value="titleCase(lead.lead_status)" />
              <Info icon="ri:hand-coin-line" label="Deal status" :value="titleCase(lead.deal_status)" />
              <Info icon="ri:calendar-event-line" label="Created" :value="formatDate(lead.created_at, true)" />
              <Info icon="ri:refresh-line" label="Last updated" :value="formatDate(lead.updated_at, true)" />
            </div>
          </section>

          <section class="detail-section history-section">
            <SectionTitle icon="ri:history-line" title="Assignment history" :subtitle="`${assignments.length} assignment${assignments.length === 1 ? '' : 's'} recorded`" />
            <LeadAssignmentHistory :items="assignments" />
          </section>
        </div>

        <div class="col-xl-4">
          <div class="side-stack">
            <section class="detail-section">
              <SectionTitle icon="ri:user-3-line" title="Contact" subtitle="Lead owner details" />
              <div class="contact-list">
                <ContactRow icon="ri:user-line" label="Name" :value="lead.user?.name" />
                <ContactRow icon="ri:phone-line" label="Phone" :value="lead.user?.phone" :href="lead.user?.phone ? `tel:${lead.user.phone}` : ''" />
                <ContactRow icon="ri:mail-line" label="Email" :value="lead.user?.email" :href="lead.user?.email ? `mailto:${lead.user.email}` : ''" />
              </div>
            </section>

            <section class="detail-section">
              <div class="section-heading section-heading--split">
                <SectionTitle icon="ri:user-star-line" title="Assigned agent" subtitle="Current lead owner" compact />
                <span v-if="lead.assigned_agent?.id" class="verified-mark"><iconify-icon icon="ri:verified-badge-fill" />Verified</span>
              </div>
              <div v-if="lead.assigned_agent?.id">
                <div class="agent-profile">
                  <div class="agent-avatar">{{ agentInitials }}</div>
                  <div><h6>{{ safeValue(lead.assigned_agent.name) }}</h6><p>{{ safeValue(lead.assigned_agent.role, 'Agent') }}</p></div>
                </div>
                <div class="agent-details">
                  <span><iconify-icon icon="ri:phone-line" />{{ safeValue(lead.assigned_agent.phone) }}</span>
                  <span><iconify-icon icon="ri:mail-line" />{{ safeValue(lead.assigned_agent.email) }}</span>
                  <span><iconify-icon icon="ri:calendar-check-line" />Assigned {{ formatDate(lead.assigned_at, true) }}</span>
                </div>
              </div>
              <div v-else class="unassigned-state">
                <div class="unassigned-icon"><iconify-icon icon="ri:user-search-line" /></div>
                <h6>No agent assigned</h6><p>This lead is waiting for an owner.</p>
              </div>
              <button class="btn agent-action" @click="openAssign">
                <iconify-icon :icon="lead.assigned_agent?.id ? 'ri:user-shared-line' : 'ri:user-add-line'" />
                {{ lead.assigned_agent?.id ? 'Reassign agent' : 'Assign an agent' }}
              </button>
            </section>

            <section v-if="lead.overdue" class="overdue-notice">
              <iconify-icon icon="ri:alarm-warning-line" />
              <div><strong>Follow-up overdue</strong><span>This pending lead is older than one hour.</span></div>
            </section>
          </div>
        </div>
      </div>
    </template>

    <AssignAgentModal :show="showAssign" :lead="lead" :mode="lead.assigned_agent?.id ? 'reassign' : 'assign'" @close="showAssign=false" @saved="onAssigned" />
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import AssignAgentModal from '@/components/feeta/leads/AssignAgentModal.vue'
import LeadAssignmentHistory from '@/components/feeta/leads/LeadAssignmentHistory.vue'
import LeadStatusBadge from '@/components/feeta/leads/LeadStatusBadge.vue'
import leadService from '@/services/adminLeadService'
import { formatDate, safeValue, titleCase } from '@/utils/finance'

const SectionTitle = defineComponent({
  props: { icon: String, title: String, subtitle: String, compact: Boolean },
  setup: (props) => () => h('div', { class: ['section-heading', { 'mb-0': props.compact }] }, [
    h('div', { class: 'section-icon' }, [h('iconify-icon', { icon: props.icon })]),
    h('div', [h('h6', props.title), h('p', props.subtitle)]),
  ]),
})

const Info = defineComponent({
  props: { icon: String, label: String, value: [String, Number, Boolean] },
  setup: (props) => () => h('div', { class: 'info-item' }, [
    h('div', { class: 'info-icon' }, [h('iconify-icon', { icon: props.icon })]),
    h('div', { class: 'info-copy' }, [h('span', props.label), h('strong', safeValue(props.value))]),
  ]),
})

const ContactRow = defineComponent({
  props: { icon: String, label: String, value: String, href: String },
  setup: (props) => () => h(props.href ? 'a' : 'div', { class: 'contact-row', href: props.href || undefined }, [
    h('iconify-icon', { icon: props.icon }),
    h('div', [h('span', props.label), h('strong', safeValue(props.value))]),
    ...(props.href ? [h('iconify-icon', { icon: 'ri:arrow-right-up-line', class: 'contact-action' })] : []),
  ]),
})

const route = useRoute()
const lead = ref({})
const assignments = ref([])
const loading = ref(false)
const error = ref('')
const showAssign = ref(false)
const statusSaving = ref(false)
const nextStatus = ref('')
const statuses = ['pending', 'assigned', 'in_progress', 'completed', 'expired', 'cancelled']
const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NA'
const userInitials = computed(() => initials(lead.value.user?.name))
const agentInitials = computed(() => initials(lead.value.assigned_agent?.name))
const locationLabel = computed(() => [lead.value.area, lead.value.city].filter(Boolean).join(', ') || 'Location unavailable')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const leadId = route.params.leadId
    if (!leadId) throw new Error('A valid lead ID is required.')
    const [detail, history] = await Promise.all([leadService.getLeadDetail(leadId), leadService.getLeadAssignments(leadId)])
    lead.value = detail || {}
    assignments.value = Array.isArray(history) ? history : history?.data || []
    nextStatus.value = lead.value.status || 'pending'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function openAssign() { showAssign.value = true }

async function onAssigned(updated) {
  showAssign.value = false
  await Swal.fire({ icon: 'success', title: 'Lead assignment updated', timer: 1200, showConfirmButton: false })
  lead.value = updated || lead.value
  await load()
}

async function updateStatus() {
  if (statusSaving.value || nextStatus.value === lead.value.status) return
  statusSaving.value = true
  try {
    lead.value = await leadService.updateLeadStatus(lead.value.lead_id || lead.value.id, { status: nextStatus.value })
    await Swal.fire({ icon: 'success', title: 'Lead status updated', timer: 1100, showConfirmButton: false })
  } catch (err) {
    await Swal.fire('Status update failed', err.message, 'error')
  } finally {
    statusSaving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.lead-header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:24px;border:1px solid #dbe5f1;border-radius:12px;background:#fff;box-shadow:0 10px 24px rgba(15,23,42,.05)}.lead-identity{display:flex;align-items:center;gap:16px;min-width:0}.lead-avatar,.agent-avatar{display:grid;place-items:center;flex:0 0 auto;border-radius:12px;color:#fff;background:#315ed1;font-weight:800}.lead-avatar{width:58px;height:58px;font-size:18px}.lead-title-block{min-width:0}.lead-kicker{margin-bottom:3px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase}.lead-title-block h4{margin:0 0 7px;color:#111827;font-size:22px}.lead-context{display:flex;align-items:center;gap:14px;flex-wrap:wrap;color:#64748b;font-size:12px}.lead-context span{display:inline-flex;align-items:center;gap:5px}.lead-context iconify-icon{color:#2563eb;font-size:15px}.header-controls{display:flex;align-items:flex-end;gap:12px;flex-direction:column}.status-row,.lead-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.lead-actions .btn{display:inline-flex;align-items:center}.detail-section{padding:22px;border:1px solid #e5edf6;border-radius:12px;background:#fff;box-shadow:0 8px 20px rgba(15,23,42,.03)}.section-heading{display:flex;align-items:center;gap:11px;margin-bottom:20px}.section-heading--split{justify-content:space-between;align-items:flex-start;gap:16px}.section-icon{width:38px;height:38px;display:grid;place-items:center;flex:0 0 38px;border-radius:10px;color:#315ed1;background:#edf3ff;font-size:19px}.section-heading h6{margin:0;color:#111827;font-size:14px}.section-heading p{margin:3px 0 0;color:#8490a3;font-size:11px}.facts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.info-item{display:flex;align-items:center;gap:11px;min-width:0;padding:14px;border:1px solid #edf1f5;border-radius:10px;background:#f8fafc}.info-icon{width:34px;height:34px;display:grid;place-items:center;flex:0 0 34px;border-radius:9px;color:#64748b;background:#fff;font-size:17px}.info-copy{display:grid;gap:3px;min-width:0}.info-copy span{color:#7c889b;font-size:11px}.info-copy strong{overflow:hidden;color:#172033;font-size:13px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.status-update{display:flex;gap:7px}.status-update .form-select{width:170px;min-height:40px;font-size:12px;border-radius:10px}.status-update .btn{display:inline-flex;align-items:center;gap:5px;min-height:40px;padding-inline:14px}.side-stack{position:sticky;top:92px;display:grid;gap:20px}.contact-list{display:grid}.contact-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #edf0f4;color:#64748b;text-decoration:none}.contact-row:first-child{padding-top:0}.contact-row:last-child{padding-bottom:0;border:0}.contact-row>iconify-icon:first-child{font-size:18px}.contact-row div{display:grid;gap:2px;min-width:0}.contact-row span{font-size:10px;text-transform:uppercase}.contact-row strong{overflow:hidden;color:#172033;font-size:12px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.contact-row[href]:hover strong{color:#2563eb}.contact-action{color:#94a3b8;font-size:15px}.verified-mark{display:inline-flex;align-items:center;gap:4px;color:#15803d;font-size:11px;font-weight:700}.agent-profile{display:flex;align-items:center;gap:12px;padding:2px 0 16px}.agent-avatar{width:48px;height:48px;font-size:15px;background:#0f766e}.agent-profile h6{margin:0 0 3px;font-size:14px}.agent-profile p{margin:0;color:#7c889b;font-size:11px;text-transform:capitalize}.agent-details{display:grid;gap:9px;padding:14px 0;border-top:1px solid #edf0f4;border-bottom:1px solid #edf0f4}.agent-details span{display:flex;align-items:center;gap:8px;min-width:0;color:#64748b;font-size:11px;word-break:break-word}.agent-details iconify-icon{flex:0 0 auto;color:#2563eb;font-size:15px}.agent-action{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;margin-top:16px;border:1px solid #d9e2ef;border-radius:10px;color:#1d4ed8;background:#fff;font-size:12px;font-weight:700}.agent-action:hover{border-color:#b9cdf7;background:#f7faff}.unassigned-state{padding:8px 0 4px;text-align:center}.unassigned-icon{width:48px;height:48px;display:grid;place-items:center;margin:0 auto 10px;border-radius:12px;color:#64748b;background:#f1f5f9;font-size:23px}.unassigned-state h6{margin:0 0 4px;font-size:13px}.unassigned-state p{margin:0;color:#7c889b;font-size:11px}.overdue-notice{display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border:1px solid #fecaca;border-radius:10px;color:#b91c1c;background:#fff7f7}.overdue-notice>iconify-icon{margin-top:1px;font-size:19px}.overdue-notice div{display:grid;gap:2px}.overdue-notice strong{font-size:12px}.overdue-notice span{color:#9f1239;font-size:11px}.history-section{overflow:hidden}.history-section :deep(.history-list){margin:0 -22px -22px}.history-section :deep(.history-table th:first-child),.history-section :deep(.history-table td:first-child){padding-inline-start:22px}.history-section :deep(.history-table th:last-child),.history-section :deep(.history-table td:last-child){padding-inline-end:22px}@media(max-width:1199px){.side-stack{position:static}.header-controls{align-items:flex-start}.lead-header{align-items:flex-start}}@media(max-width:767px){.lead-header{padding:18px;flex-direction:column}.header-controls{width:100%}.lead-actions{width:100%}.lead-actions .btn{flex:1;justify-content:center}.facts-grid{grid-template-columns:1fr}.section-heading--split{flex-direction:column}.status-update{width:100%}.status-update .form-select{flex:1;width:auto}.lead-context{gap:8px 12px}}@media(max-width:480px){.lead-avatar{width:44px;height:44px}.lead-title-block h4{font-size:18px}.detail-section{padding:18px}.history-section :deep(.history-list){margin:0 -18px -18px}}:global([data-theme=dark]) .lead-header,:global([data-theme=dark]) .detail-section{background:#182233;border-color:#334155}:global([data-theme=dark]) .lead-title-block h4,:global([data-theme=dark]) .section-heading h6,:global([data-theme=dark]) .info-copy strong,:global([data-theme=dark]) .contact-row strong{color:#e5e7eb}:global([data-theme=dark]) .info-item{background:#111827;border-color:#263244}
</style>
