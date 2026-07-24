<template>
  <Teleport to="body">
    <div v-if="show" class="lead-modal">
      <div class="lead-modal__backdrop" @click="close"></div>
      <section class="lead-modal__panel" role="dialog" aria-modal="true">
        <header class="lead-modal__header">
          <div>
            <h6 class="mb-2">{{ mode === 'reassign' ? 'Reassign Agent' : 'Assign Agent' }}</h6>
            <p class="text-secondary-light mb-0">Lead #{{ lead?.lead_id || lead?.id }}</p>
          </div>
          <button class="icon-btn" type="button" :disabled="submitting" @click="close" aria-label="Close">
            <iconify-icon icon="ri:close-line" />
          </button>
        </header>

        <div class="lead-modal__body">
          <label class="form-label fw-semibold">Agent search</label>
          <div class="agent-search mb-14">
            <iconify-icon icon="ri:search-line" />
            <input v-model="search" type="search" placeholder="Search verified agents" />
          </div>

          <div v-if="loading" class="agent-loading">
            <span class="spinner-border spinner-border-sm"></span>
            Loading verified agents...
          </div>
          <div v-else-if="agents.length" class="agent-list">
            <label v-for="agent in agents" :key="agent.id" :class="{ selected: selectedAgentId === agent.id }" class="agent-option">
              <input v-model="selectedAgentId" type="radio" :value="agent.id" />
              <span class="agent-avatar"><iconify-icon icon="ri:user-star-line" /></span>
              <span class="agent-info">
                <strong>{{ safeValue(agent.name, `Agent #${agent.id}`) }}</strong>
                <small>{{ safeValue(agent.phone) }} / {{ safeValue(agent.email) }}</small>
                <small>{{ safeValue(agent.city) }} / {{ safeValue(agent.agency_name) }}</small>
              </span>
            </label>
          </div>
          <EmptyState v-else icon="ri:user-search-line" title="No verified agents" message="No verified agents match this search." />

          <p v-if="errors.agent_id" class="field-error">{{ errors.agent_id }}</p>

          <label class="form-label fw-semibold mt-16">Notes</label>
          <textarea v-model="notes" class="form-control" rows="4" placeholder="Assignment notes"></textarea>
          <p v-if="errors.notes" class="field-error">{{ errors.notes }}</p>
        </div>

        <footer class="lead-modal__footer">
          <button class="btn btn-outline-secondary-600" type="button" :disabled="submitting" @click="close">Cancel</button>
          <button class="btn btn-primary-600" type="button" :disabled="submitting || !selectedAgentId" @click="submit">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-6"></span>
            {{ mode === 'reassign' ? 'Reassign' : 'Assign' }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import leadService from '@/services/adminLeadService'
import { safeValue } from '@/utils/finance'
import Swal from 'sweetalert2'

const props = defineProps({
  show: { type: Boolean, default: false },
  lead: { type: Object, default: null },
  mode: { type: String, default: 'assign' },
})
const emit = defineEmits(['close', 'saved'])

const agents = ref([])
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const selectedAgentId = ref(null)
const notes = ref('')
const errors = ref({})
let timer

function close() {
  if (!submitting.value) emit('close')
}

function normalize(result) {
  return Array.isArray(result) ? result : result?.data || []
}

async function loadAgents() {
  loading.value = true
  try {
    agents.value = normalize(await leadService.getVerifiedAgents({ search: search.value, per_page: 20 }))
  } catch (error) {
    errors.value.agent_id = error.message
    agents.value = []
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!selectedAgentId.value || submitting.value) return
  const leadId = props.lead?.lead_id || props.lead?.id
  if (!leadId) {
    await Swal.fire('Assignment failed', 'A valid lead ID is required.', 'error')
    return
  }
  submitting.value = true
  errors.value = {}
  try {
    const method = props.mode === 'reassign' ? leadService.reassignLeadAgent : leadService.assignLeadAgent
    const updated = await method(leadId, { agent_id: selectedAgentId.value, notes: notes.value || undefined })
    emit('saved', updated)
  } catch (error) {
    const backendErrors = error.errors || {}
    errors.value = {
      agent_id: backendErrors.agent_id?.[0],
      notes: backendErrors.notes?.[0],
      general: error.message,
    }
    if (!errors.value.agent_id && !errors.value.notes) errors.value.agent_id = error.message
  } finally {
    submitting.value = false
  }
}

watch(() => props.show, (value) => {
  if (!value) return
  selectedAgentId.value = props.lead?.assigned_agent?.id || null
  notes.value = ''
  search.value = ''
  errors.value = {}
  loadAgents()
})

watch(search, () => {
  if (!props.show) return
  clearTimeout(timer)
  timer = setTimeout(loadAgents, 350)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.lead-modal{position:fixed;inset:0;z-index:1055;display:grid;place-items:center;padding:18px}.lead-modal__backdrop{position:absolute;inset:0;background:rgba(15,23,42,.52);backdrop-filter:blur(2px)}.lead-modal__panel{position:relative;width:min(680px,100%);max-height:92vh;display:flex;flex-direction:column;background:#fff;border:1px solid #e5edf6;border-radius:12px;box-shadow:0 20px 60px rgba(15,23,42,.22);overflow:hidden}.lead-modal__header,.lead-modal__footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid #edf1f5}.lead-modal__footer{border-top:1px solid #edf1f5;border-bottom:0;justify-content:flex-end}.lead-modal__body{padding:20px;overflow:auto}.icon-btn{width:36px;height:36px;display:grid;place-items:center;border:1px solid #dbe3ee;border-radius:9px;background:#fff}.agent-search{min-height:44px;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid #d9e0ea;border-radius:10px;background:#fff}.agent-search input{width:100%;min-width:0;border:0;outline:0;background:transparent}.agent-loading{display:flex;align-items:center;gap:8px;color:#64748b;padding:18px}.agent-list{display:grid;gap:10px;max-height:320px;overflow:auto}.agent-option{display:flex;gap:11px;padding:13px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;cursor:pointer;transition:border-color .15s ease,background .15s ease}.agent-option:hover{border-color:#c7d7fe;background:#f8fbff}.agent-option.selected{border-color:#487fff;background:#edf3ff}.agent-option input{margin-top:5px}.agent-avatar{width:40px;height:40px;display:grid;place-items:center;border-radius:10px;background:#f1f5f9;color:#487fff;flex:0 0 40px}.agent-info{display:grid;gap:2px;min-width:0}.agent-info strong{color:#111827}.agent-info small{color:#64748b;word-break:break-word}.field-error{margin:8px 0 0;color:#dc2626;font-size:12px}:global([data-theme=dark]) .lead-modal__panel,:global([data-theme=dark]) .agent-option,:global([data-theme=dark]) .agent-search,:global([data-theme=dark]) .icon-btn{background:#182233;border-color:#334155}:global([data-theme=dark]) .agent-info strong{color:#e5e7eb}
</style>
