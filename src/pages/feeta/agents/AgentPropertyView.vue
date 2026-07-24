<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading property details..." />
    <ErrorState v-else-if="error" :message="error" @retry="loadData" />

    <template v-else>
      <div class="property-hero mb-24">
        <div class="hero-icon"><iconify-icon icon="ri:building-2-line" /></div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h4 class="mb-0">{{ propertyTitle }}</h4>
            <StatusBadge :status="property.status" />
          </div>
          <div class="d-flex align-items-center gap-2 flex-wrap mt-10">
            <span class="meta-pill"><iconify-icon :icon="propertyTypeIcon(property.category)" class="me-4" />{{ value(property.category) }}</span>
            <span class="meta-pill"><iconify-icon :icon="propertyTypeIcon(property.property_type)" class="me-4" />{{ titleCase(property.property_type) }}</span>
            <span class="text-secondary-light text-sm">Property #{{ property.id }}</span>
            <CopyButton :value="property.id" label="property ID" />
          </div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <router-link :to="`/agents/${route.params.id}/properties`" class="btn btn-outline-primary-600"><iconify-icon icon="ri:arrow-left-line" class="me-6" />Back</router-link>
          <button v-if="auth.hasPermission('agent.properties.status')" type="button" class="btn btn-warning-600" :disabled="actionLoading" @click="changeStatus">
            <iconify-icon icon="ri:refresh-line" class="me-6" /> Change status
          </button>
          <button v-if="auth.hasPermission('agent.properties.delete') && String(property.status).toLowerCase() !== 'deleted'" type="button" class="btn btn-danger-600" :disabled="actionLoading" @click="removeProperty">
            <iconify-icon icon="ri:delete-bin-line" class="me-6" /> Delete
          </button>
          <router-link v-if="auth.hasPermission('payment.view') && property.payment_id" :to="`/payments/${property.payment_id}`" class="btn btn-outline-primary-600"><iconify-icon icon="ri:bank-card-line" class="me-6" /> View Payment</router-link>
          <router-link v-if="auth.hasPermission('payment.invoice.view') && property.payment_id && property.invoice_status" :to="`/payments/${property.payment_id}/invoice`" class="btn btn-outline-primary-600"><iconify-icon icon="ri:file-list-3-line" class="me-6" /> View Invoice</router-link>
        </div>
      </div>

      <section class="gallery-card mb-24">
        <div v-if="primaryMedia" class="gallery-main">
          <img :src="propertyMediaUrl(primaryMedia.url)" :alt="propertyTitle" />
        </div>
        <div v-else class="gallery-empty">
          <iconify-icon icon="ri:image-line" />
          <span>No property images available</span>
        </div>
        <div v-if="secondaryMedia.length" class="gallery-strip">
          <button v-for="media in secondaryMedia" :key="media.id" type="button" @click="selectedMediaId = media.id">
            <img :src="propertyMediaUrl(media.url)" alt="Property gallery image" />
          </button>
        </div>
      </section>

      <div class="row gy-4">
        <div class="col-xl-8">
          <section class="detail-card mb-24">
            <div class="section-heading"><iconify-icon icon="ri:home-4-line" /><h6 class="mb-0">Basic property information</h6></div>
            <div class="info-grid">
              <InfoItem label="Category" :value="value(property.category)" />
              <InfoItem label="Listing type" :value="titleCase(property.property_type)" />
              <InfoItem label="Status" :value="titleCase(property.status)" />
              <InfoItem label="Leads" :value="String(property.leads ?? 0)" />
              <InfoItem label="Views" :value="value(property.views)" />
              <InfoItem label="Created" :value="formatDate(property.created_at)" />
              <InfoItem label="Updated" :value="formatDate(property.updated_at)" />
              <InfoItem label="Deleted" :value="formatDate(property.deleted_at)" />
              <InfoItem v-if="property.purchased_using_credits !== undefined" label="Purchased using credits" :value="property.purchased_using_credits ? 'Yes' : 'No'" />
              <InfoItem v-if="property.credits_consumed !== undefined" label="Credits consumed" :value="value(property.credits_consumed)" />
              <InfoItem v-if="property.payment_status" label="Payment status" :value="titleCase(property.payment_status)" />
              <InfoItem v-if="property.invoice_status" label="Invoice status" :value="titleCase(property.invoice_status)" />
            </div>
          </section>

          <section class="detail-card mb-24">
            <div class="section-heading"><iconify-icon icon="ri:map-pin-line" /><h6 class="mb-0">Location information</h6></div>
            <div class="info-grid">
              <InfoItem label="City" :value="value(property.location?.city)" />
              <InfoItem label="State" :value="value(property.location?.state)" />
              <InfoItem label="Locality" :value="value(property.location?.locality)" />
              <InfoItem label="Map address" :value="value(property.location?.map_address)" />
              <InfoItem label="Manual address" :value="value(property.location?.manual_address)" />
              <InfoItem label="Full address" :value="value(property.location?.full_address)" wide />
              <InfoItem label="Latitude" :value="value(property.location?.latitude)" />
              <InfoItem label="Longitude" :value="value(property.location?.longitude)" />
            </div>
          </section>

          <section class="detail-card">
            <div class="section-heading"><iconify-icon icon="ri:file-text-line" /><h6 class="mb-0">Description</h6></div>
            <p class="description-text mb-0">{{ value(property.description) }}</p>
          </section>
        </div>

        <div class="col-xl-4">
          <section class="detail-card mb-24">
            <div class="section-heading"><iconify-icon icon="ri:money-rupee-circle-line" /><h6 class="mb-0">Pricing and area</h6></div>
            <div class="price-value">{{ formatCurrency(property.price ?? property.snapshot?.price) }}</div>
            <div class="side-list">
              <div><span>Monthly rent</span><strong>{{ formatCurrency(property.snapshot?.monthly_rent) }}</strong></div>
              <div><span>Area</span><strong>{{ formatArea(property.snapshot?.area_sqft) }}</strong></div>
              <div><span>Carpet area</span><strong>{{ formatArea(property.snapshot?.carpet_area_sqft) }}</strong></div>
              <div><span>Bedrooms</span><strong>{{ value(property.snapshot?.bed) }}</strong></div>
              <div><span>Furnished</span><strong>{{ titleCase(property.snapshot?.furnished) }}</strong></div>
            </div>
          </section>

          <section class="detail-card mb-24">
            <div class="section-heading"><iconify-icon icon="ri:user-star-line" /><h6 class="mb-0">Owner / agent</h6></div>
            <div class="agent-summary">
              <div class="agent-avatar">{{ initials(agent.name) }}</div>
              <div><h6 class="mb-3">{{ value(agent.name) }}</h6><StatusBadge :status="agent.status" /></div>
            </div>
            <div class="side-list mt-20">
              <div><span>Email</span><strong class="copy-line">{{ value(agent.email) }} <CopyButton :value="agent.email" label="email" /></strong></div>
              <div><span>Phone</span><strong class="copy-line">{{ value(agent.phone) }} <CopyButton :value="agent.phone" label="phone" /></strong></div>
              <div><span>Verification</span><strong>{{ titleCase(agent.verification_status) }}</strong></div>
            </div>
            <router-link :to="`/agents/${route.params.id}`" class="btn btn-outline-primary-600 w-100 mt-20"><iconify-icon icon="ri:user-line" class="me-6" />View agent profile</router-link>
          </section>

          <section v-if="auth.hasPermission('agent.properties.update')" class="detail-card">
            <div class="section-heading"><iconify-icon icon="ri:edit-line" /><h6 class="mb-0">Edit supported fields</h6></div>
            <form class="d-flex flex-column gap-14" @submit.prevent="saveProperty">
              <label class="field-label">Category<input v-model="form.category_name" class="form-control" /></label>
              <label class="field-label">Listing type<input v-model="form.purpose" class="form-control" /></label>
              <label class="field-label">City<input v-model="form.city" class="form-control" /></label>
              <label class="field-label">Locality<input v-model="form.locality" class="form-control" /></label>
              <label class="field-label">Description<textarea v-model="form.description" class="form-control" rows="4"></textarea></label>
              <button type="submit" class="btn btn-primary-600" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-6"></span>
                {{ saving ? 'Saving...' : 'Save changes' }}
              </button>
            </form>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import CopyButton from '@/components/common/CopyButton.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import agentService from '@/services/agentService'
import { useAuthStore } from '@/stores/auth'
import { propertyTypeIcon } from '@/utils/feetaIcons'
import { formatCurrency as formatInrCurrency } from '@/utils/finance'
import { propertyMediaUrl } from '@/utils/mediaUrl'

const InfoItem = defineComponent({
  props: { label: String, value: String, wide: Boolean },
  setup(props) {
    return () => h('div', { class: ['info-item', props.wide ? 'is-wide' : ''] }, [
      h('span', props.label),
      h('strong', props.value),
    ])
  },
})

const route = useRoute()
const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const actionLoading = ref(false)
const error = ref('')
const agent = ref({})
const property = ref({})
const selectedMediaId = ref(null)
const propertyStatuses = ['active', 'pending', 'rejected', 'sold', 'rented', 'inactive', 'draft']
const form = reactive({ category_name: '', purpose: '', city: '', locality: '', description: '' })

const propertyTitle = computed(() => property.value.name || [property.value.category, property.value.location?.locality && `in ${property.value.location.locality}`].filter(Boolean).join(' ') || `Property #${property.value.id}`)
const mediaItems = computed(() => Array.isArray(property.value.media) ? property.value.media.filter((media) => media?.url) : [])
const primaryMedia = computed(() => mediaItems.value.find((media) => media.id === selectedMediaId.value) || mediaItems.value.find((media) => media.is_primary) || mediaItems.value[0] || null)
const secondaryMedia = computed(() => mediaItems.value.filter((media) => media.id !== primaryMedia.value?.id).slice(0, 5))

function value(input) { return input === undefined || input === null || input === '' ? 'Not available' : String(input) }
function titleCase(input) { const text = value(input); return text === 'Not available' ? text : text.replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) }
function initials(name) { return String(name || 'Agent').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A' }
function formatCurrency(input) {
  const amount = Number(input)
  return Number.isFinite(amount) && amount > 0 ? formatInrCurrency(amount, { maximumFractionDigits: 0 }) : 'Not available'
}
function formatArea(input) {
  const area = Number(input)
  return Number.isFinite(area) && area > 0 ? `${new Intl.NumberFormat('en-IN').format(area)} sq ft` : 'Not available'
}
function formatDate(input) {
  if (!input) return 'Not available'
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? String(input) : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
function syncForm() {
  form.category_name = property.value.category || ''
  form.purpose = property.value.property_type || ''
  form.city = property.value.location?.city || ''
  form.locality = property.value.location?.locality || ''
  form.description = property.value.description || ''
}
async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [agentPayload, propertyPayload] = await Promise.all([
      agentService.getAgent(route.params.id),
      agentService.getAgentProperty(route.params.id, route.params.propertyId),
    ])
    agent.value = agentPayload || {}
    property.value = propertyPayload || {}
    selectedMediaId.value = property.value.media?.find((media) => media.is_primary)?.id || property.value.media?.[0]?.id || null
    syncForm()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
async function saveProperty() {
  if (saving.value) return
  saving.value = true
  try {
    property.value = await agentService.updateAgentProperty(route.params.id, route.params.propertyId, { ...form })
    syncForm()
    await Swal.fire({ icon: 'success', title: 'Property updated', timer: 1300, showConfirmButton: false })
  } catch (err) {
    await Swal.fire({ icon: 'error', title: 'Update failed', text: err.message })
  } finally {
    saving.value = false
  }
}
async function changeStatus() {
  if (actionLoading.value) return
  const result = await Swal.fire({
    title: 'Change property status',
    input: 'select',
    inputOptions: Object.fromEntries(propertyStatuses.map((status) => [status, titleCase(status)])),
    inputValue: String(property.value.status || 'inactive').toLowerCase(),
    showCancelButton: true,
    confirmButtonText: 'Update status',
  })
  if (!result.isConfirmed) return
  actionLoading.value = true
  try {
    property.value = await agentService.updateAgentPropertyStatus(route.params.id, route.params.propertyId, { status: result.value, remarks: `Status changed to ${result.value} by admin` })
    syncForm()
    await Swal.fire({ icon: 'success', title: 'Status updated', timer: 1200, showConfirmButton: false })
  } catch (err) {
    await Swal.fire({ icon: 'error', title: 'Status update failed', text: err.message })
  } finally {
    actionLoading.value = false
  }
}
async function removeProperty() {
  if (actionLoading.value) return
  const result = await Swal.fire({ title: 'Move property to deleted?', text: propertyTitle.value, icon: 'warning', showCancelButton: true, confirmButtonText: 'Move to deleted', confirmButtonColor: '#dc2626' })
  if (!result.isConfirmed) return
  actionLoading.value = true
  try {
    await agentService.deleteAgentProperty(route.params.id, route.params.propertyId)
    property.value = { ...property.value, status: 'deleted', deleted_at: new Date().toISOString() }
    await Swal.fire({ icon: 'success', title: 'Property deleted', timer: 1200, showConfirmButton: false })
  } catch (err) {
    await Swal.fire({ icon: 'error', title: 'Delete failed', text: err.message })
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.property-hero { display: flex; align-items: center; gap: 18px; padding: 24px; border: 1px solid #dce6fa; border-radius: 16px; background: linear-gradient(135deg, #fff, #edf4ff); }
.hero-icon { width: 64px; height: 64px; display: grid; place-items: center; flex: 0 0 64px; border-radius: 16px; color: #487fff; background: #fff; font-size: 29px; box-shadow: 0 10px 22px rgba(72,127,255,.14); }
.meta-pill { padding: 4px 9px; border-radius: 999px; color: #475569; background: #f1f5f9; font-size: 12px; font-weight: 600; }
.gallery-card { padding: 14px; border: 1px solid #e5eaf2; border-radius: 16px; background: #fff; }
.gallery-main, .gallery-empty { height: 420px; overflow: hidden; border-radius: 12px; }
.gallery-main img { width: 100%; height: 100%; object-fit: cover; }
.gallery-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #64748b; background: linear-gradient(135deg, #f8fafc, #eef3f9); }
.gallery-empty iconify-icon { font-size: 48px; color: #94a3b8; }
.gallery-strip { display: flex; gap: 10px; overflow-x: auto; padding-top: 12px; }
.gallery-strip button { width: 92px; height: 68px; flex: 0 0 92px; padding: 0; overflow: hidden; border: 2px solid transparent; border-radius: 9px; background: transparent; }
.gallery-strip img { width: 100%; height: 100%; object-fit: cover; }
.detail-card { padding: 22px; border: 1px solid #e5eaf2; border-radius: 14px; background: #fff; }
.section-heading { display: flex; align-items: center; gap: 10px; padding-bottom: 16px; margin-bottom: 18px; border-bottom: 1px solid #edf1f6; }
.section-heading iconify-icon { color: #487fff; font-size: 21px; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 28px; }
:deep(.info-item) { display: flex; justify-content: space-between; gap: 18px; padding: 13px 0; border-bottom: 1px solid #f0f3f7; }
:deep(.info-item span) { color: #64748b; }
:deep(.info-item strong) { text-align: right; color: #172033; }
:deep(.info-item.is-wide) { grid-column: 1 / -1; }
.description-text { color: #475569; line-height: 1.75; white-space: pre-wrap; }
.price-value { color: #172033; font-size: 28px; font-weight: 750; }
.side-list > div { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; padding: 13px 0; border-bottom: 1px solid #f0f3f7; }
.side-list span { color: #64748b; }
.side-list strong { text-align: right; color: #172033; }
.agent-summary { display: flex; align-items: center; gap: 12px; }
.agent-avatar { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 13px; color: #fff; background: linear-gradient(135deg, #487fff, #315ed1); font-weight: 700; }
.copy-line { display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px; word-break: break-word; }
.field-label { display: flex; flex-direction: column; gap: 7px; color: #475569; font-size: 13px; font-weight: 650; }
@media (max-width: 767px) { .property-hero { align-items: flex-start; flex-direction: column; } .gallery-main, .gallery-empty { height: 260px; } .info-grid { grid-template-columns: 1fr; } }
</style>
