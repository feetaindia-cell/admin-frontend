<template>
  <div class="dashboard-main-body property-edit-page">
<LoadingState v-if="loading" message="Loading complete property form..." />
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else>
      <div v-if="!canUpdate" class="card radius-12 p-24">
        <EmptyState icon="lucide:lock" title="No permission" message="You do not have permission to update properties." />
        <div class="mt-16">
          <router-link :to="detailPath" class="btn btn-outline-primary-600">
            <iconify-icon icon="lucide:arrow-left" />
            Back to property
          </router-link>
        </div>
      </div>

      <div v-else class="property-edit-shell">
        <section class="edit-hero">
          <div class="edit-hero-title">
            <span class="edit-hero-icon"><iconify-icon icon="lucide:building-2" /></span>
            <div>
              <span class="eyebrow">Property #{{ property.id }}</span>
              <h5 class="mb-1">{{ property.title || 'Edit property details' }}</h5>
              <p class="text-secondary-light mb-0">Update main details, category details, media, and searchable values safely.</p>
            </div>
          </div>
          <div class="hero-actions">
            <router-link :to="detailPath" class="btn btn-outline-secondary-600">
              <iconify-icon icon="lucide:x" />
              Cancel
            </router-link>
            <button type="button" class="btn btn-outline-primary-600" :disabled="saving || !hasChanges" @click="save(false)">
              <span v-if="saving" class="spinner-border spinner-border-sm" />
              <iconify-icon v-else icon="lucide:save" />
              Save All
            </button>
            <button type="button" class="btn btn-primary-600" :disabled="saving || !hasChanges" @click="save(true)">
              <span v-if="saving" class="spinner-border spinner-border-sm" />
              <iconify-icon v-else icon="lucide:undo-2" />
              Save & Back
            </button>
          </div>
        </section>

        <div v-if="validationMessage" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-16 py-12 radius-8">
          {{ validationMessage }}
        </div>

        <div class="card radius-12">
          <div class="card-header bg-base border-bottom p-20">
            <ul class="nav nav-tabs property-edit-tabs">
              <li v-for="tab in visibleTabs" :key="tab.key" class="nav-item">
                <button class="nav-link" :class="{ active: activeTab === tab.key }" type="button" @click="activeTab = tab.key">
                  <iconify-icon :icon="tab.icon" />
                  {{ tab.label }}
                  <span v-if="changedSections.includes(tab.section || tab.key)" class="change-dot"></span>
                </button>
              </li>
            </ul>
          </div>

          <form class="card-body p-24" @submit.prevent="save(false)">
            <section v-if="tabVisible('main')" v-show="activeTab === 'main'" class="tab-panel">
              <SectionTitle icon="lucide:building-2" title="Main Details" text="Core listing fields from the main property record." />
              <div class="form-grid">
                <Field label="Category">
                  <select v-model="form.main.category_name" class="form-select" disabled>
                    <option value="">Select category</option>
                    <option v-for="item in categories" :key="item.id || item.name" :value="item.name">{{ item.name }}</option>
                  </select>
                  <small class="text-warning-600">Category is locked to avoid stale category-specific data.</small>
                </Field>
                <Field label="Listing type / purpose">
                  <input v-model.trim="form.main.purpose" class="form-control" required />
                </Field>
                <Field label="City">
                  <input v-model.trim="form.main.city" class="form-control" required />
                </Field>
                <Field label="Locality">
                  <input v-model.trim="form.main.locality" class="form-control" />
                </Field>
                <Field label="Map address">
                  <input v-model.trim="form.main.map_address" class="form-control" />
                </Field>
                <Field label="Manual address">
                  <input v-model.trim="form.main.manual_address" class="form-control" />
                </Field>
                <Field label="Latitude">
                  <input v-model="form.main.latitude" type="number" step="any" class="form-control" />
                </Field>
                <Field label="Longitude">
                  <input v-model="form.main.longitude" type="number" step="any" class="form-control" />
                </Field>
                <Field label="Price">
                  <input v-model="form.main.price" type="number" min="0" step="0.01" class="form-control" />
                </Field>
                <Field label="Monthly rent">
                  <input v-model="form.main.monthly_rent" type="number" min="0" step="0.01" class="form-control" />
                </Field>
                <Field v-if="canStatus" label="Status">
                  <select v-model="form.main.post_status" class="form-select">
                    <option v-for="status in statuses" :key="status" :value="status">{{ titleCase(status) }}</option>
                  </select>
                </Field>
                <Field v-if="canFeature" label="Featured">
                  <select v-model="form.main.is_featured" class="form-select">
                    <option :value="true">Yes</option>
                    <option :value="false">No</option>
                  </select>
                </Field>
                <Field label="FEETA rating">
                  <input v-model="form.main.feeta_rating" type="number" min="0" max="5" step="0.1" class="form-control" />
                </Field>
                <Field label="Full address" wide>
                  <textarea v-model.trim="form.main.full_address" class="form-control" rows="3"></textarea>
                </Field>
                <Field label="Description" wide>
                  <textarea v-model.trim="form.main.description" class="form-control" rows="6"></textarea>
                </Field>
              </div>
            </section>

            <section v-if="tabVisible('basic')" v-show="activeTab === 'basic'" class="tab-panel">
              <SectionTitle icon="lucide:list-checks" title="Category Basic Details" :text="`Editable fields for ${activeCategory || 'this'} property category.`" />
              <div v-if="basicFields.length" class="form-grid">
                <Field v-for="field in basicFields" :key="field.key" :label="field.label">
                  <input v-model="form.basic[field.key]" :type="field.type || 'text'" :step="field.step || undefined" :min="field.min ?? undefined" class="form-control" />
                </Field>
              </div>
              <EmptyState v-else icon="lucide:file-list" title="No basic fields configured" message="This category has no supported basic field map yet." />
            </section>

            <section v-if="tabVisible('amenities')" v-show="activeTab === 'amenities'" class="tab-panel">
              <SectionTitle icon="lucide:square-check-big" title="Amenities" text="Update amenity flags and text values linked with this listing." />
              <KeyValueGrid v-model="form.amenities" :keys="sectionFieldKeys('amenities')" />
            </section>

            <section v-if="tabVisible('geography')" v-show="activeTab === 'geography'" class="tab-panel">
              <SectionTitle icon="lucide:map-pin" title="Geography" text="Nearby landmarks, connectivity, locality and geography details." />
              <KeyValueGrid v-model="form.geography" :keys="sectionFieldKeys('geography')" />
            </section>

            <section v-if="tabVisible('highlights')" v-show="activeTab === 'highlights'" class="tab-panel">
              <SectionTitle icon="lucide:sparkles" title="Highlights" text="Important selling points and searchable highlights." />
              <KeyValueGrid v-model="form.highlights" :keys="sectionFieldKeys('highlights')" />
            </section>

            <section v-if="tabVisible('open_house')" v-show="activeTab === 'open_house'" class="tab-panel">
              <SectionTitle icon="lucide:calendar-days" title="Open House" text="Update the active open house schedule. Leave blank if no schedule is needed." />
              <div class="form-grid">
                <Field label="Scheduled date">
                  <input v-model="form.open_house.scheduled_date" type="date" class="form-control" />
                </Field>
                <Field label="From time">
                  <input v-model="form.open_house.from_time" type="time" class="form-control" />
                </Field>
                <Field label="To time">
                  <input v-model="form.open_house.to_time" type="time" class="form-control" />
                </Field>
                <Field label="Notes" wide>
                  <textarea v-model.trim="form.open_house.notes" class="form-control" rows="3"></textarea>
                </Field>
              </div>
            </section>

            <section v-show="activeTab === 'media'" class="tab-panel">
              <SectionTitle icon="lucide:image" title="Media" text="Existing media is kept unless you explicitly mark it for removal." />
              <PropertyGallery :media="activeMedia" :title="property.title" class="mb-18" />

              <div v-if="activeMedia.length" class="media-edit-grid">
                <article v-for="item in activeMedia" :key="item.id" class="media-edit-card">
                  <img v-if="isImage(item)" :src="propertyMediaUrl(item.url)" :alt="`Property media ${item.id}`" />
                  <div v-else class="media-file"><iconify-icon icon="lucide:file" /></div>
                  <div class="media-edit-body">
                    <strong>{{ item.type || 'media' }} #{{ item.id }}</strong>
                    <small>{{ item.url }}</small>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="markMediaForRemoval(item)">
                      <iconify-icon icon="lucide:trash-2" />
                      Mark remove
                    </button>
                  </div>
                </article>
              </div>
              <EmptyState v-else icon="lucide:image-plus" title="No active media" message="No media is currently attached or all media is marked for removal." />

              <div v-if="removedMediaIds.length" class="alert alert-warning bg-warning-100 text-warning-700 border-warning-100 mt-18">
                {{ removedMediaIds.length }} media item(s) will be removed after Save All.
                <button type="button" class="btn btn-sm btn-outline-warning ms-2" @click="removedMediaIds = []">Undo removal</button>
              </div>

              <div class="nested-card mt-18">
                <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-12">
                  <div>
                    <h6 class="mb-1">Add media by URL</h6>
                    <p class="text-secondary-light text-sm mb-0">Use this for already-uploaded image/video/document URLs.</p>
                  </div>
                  <button type="button" class="btn btn-sm btn-primary-600" @click="addMediaUrl">
                    <iconify-icon icon="lucide:plus" />
                    Add URL
                  </button>
                </div>
                <RepeatableRows v-model="form.media.add" :fields="mediaAddFields" empty-label="No URL media queued." />
              </div>

              <div class="nested-card mt-18">
                <div class="d-flex justify-content-between gap-3 flex-wrap">
                  <div>
                    <h6 class="mb-1">Upload property photos</h6>
                    <p class="text-secondary-light text-sm mb-0">Existing upload endpoint remains available for direct photo files.</p>
                  </div>
                  <div class="upload-actions">
                    <input ref="fileInput" class="form-control" type="file" accept="image/jpeg,image/png,image/webp" multiple @change="onFilesChange" />
                    <button class="btn btn-primary-600" type="button" :disabled="uploading || !selectedFiles.length" @click="uploadPhotos">
                      <span v-if="uploading" class="spinner-border spinner-border-sm"></span>
                      <iconify-icon v-else icon="lucide:upload-cloud" />
                      {{ uploading ? 'Uploading...' : `Upload ${selectedFiles.length || ''}` }}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="tabVisible('multi_values')" v-show="activeTab === 'multi_values'" class="tab-panel">
              <SectionTitle icon="lucide:tags" title="Extra Values" text="Repeatable values that sync to property multi-value tables." />
              <div class="extra-grid">
                <TagEditor v-for="item in visibleMultiValueConfig" :key="item.key" v-model="form.multi_values[item.key]" :label="item.label" />
              </div>
            </section>

            <section v-show="activeTab === 'review'" class="tab-panel">
              <SectionTitle icon="lucide:clipboard-list" title="Review & Save" text="Review changed sections before submitting the nested update payload." />
              <div class="review-grid">
                <div class="review-card">
                  <span>Changed sections</span>
                  <strong>{{ changedSections.length ? changedSections.map(titleCase).join(', ') : 'No changes yet' }}</strong>
                </div>
                <div class="review-card">
                  <span>Media removals</span>
                  <strong>{{ removedMediaIds.length }}</strong>
                </div>
                <div class="review-card">
                  <span>New URL media</span>
                  <strong>{{ queuedMediaAdd.length }}</strong>
                </div>
              </div>
              <pre class="payload-preview">{{ payloadPreview }}</pre>
            </section>

            <div class="form-actions">
              <button type="button" class="btn btn-outline-secondary-600" @click="activeTab = previousTab">
                <iconify-icon icon="lucide:arrow-left" />
                Previous
              </button>
              <button v-if="activeTab !== 'review'" type="button" class="btn btn-outline-primary-600" @click="activeTab = nextTab">
                Next
                <iconify-icon icon="lucide:arrow-right" />
              </button>
              <router-link :to="detailPath" class="btn btn-outline-secondary-600">
                <iconify-icon icon="lucide:x" />
                Cancel
              </router-link>
              <button type="button" class="btn btn-primary-600" :disabled="saving || !hasChanges" @click="save(false)">
                <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                <iconify-icon v-else icon="lucide:save" />
                Save All
              </button>
              <button type="button" class="btn btn-success-600" :disabled="saving || !hasChanges" @click="save(true)">
                <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                <iconify-icon v-else icon="lucide:check" />
                Save & Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import PropertyGallery from '@/components/feeta/properties/PropertyGallery.vue'
import masterPropertyService from '@/services/masterPropertyService'
import propertyService from '@/services/propertyService'
import { useAuthStore } from '@/stores/auth'
import { titleCase } from '@/utils/finance'
import { propertyMediaUrl } from '@/utils/mediaUrl'
import {
  configuredPropertySections,
  multiValueConfig,
  numericBasicFields,
} from '@/utils/propertySections'
import features from '@/config/features'

const Field = defineComponent({
  props: { label: String, wide: Boolean },
  setup: (props, { slots }) => () => h('label', { class: ['field', props.wide ? 'wide' : ''] }, [
    h('span', props.label),
    slots.default?.(),
  ]),
})

const SectionTitle = defineComponent({
  props: { icon: String, title: String, text: String },
  setup: (props) => () => h('div', { class: 'section-title' }, [
    h('div', { class: 'section-title-icon' }, [h('iconify-icon', { icon: props.icon })]),
    h('div', [h('h6', { class: 'mb-1' }, props.title), h('p', { class: 'mb-0 text-secondary-light text-sm' }, props.text)]),
  ]),
})

const KeyValueGrid = defineComponent({
  props: { modelValue: Object, keys: Array },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const update = (key, value) => emit('update:modelValue', { ...(props.modelValue || {}), [key]: value })
    return () => h('div', { class: 'form-grid' }, (props.keys || []).map((key) => h(Field, { label: titleCase(key), key }, {
      default: () => h('input', {
        class: 'form-control',
        value: props.modelValue?.[key] ?? '',
        onInput: (event) => update(key, event.target.value),
      }),
    })))
  },
})

const TagEditor = defineComponent({
  props: { modelValue: Array, label: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const update = (index, value) => {
      const next = [...(props.modelValue || [])]
      next[index] = value
      emit('update:modelValue', next)
    }
    const add = () => emit('update:modelValue', [...(props.modelValue || []), ''])
    const remove = (index) => emit('update:modelValue', (props.modelValue || []).filter((_, i) => i !== index))
    return () => h('div', { class: 'tag-editor' }, [
      h('div', { class: 'tag-editor-head' }, [
        h('strong', props.label),
        h('button', { type: 'button', class: 'btn btn-sm btn-outline-primary-600', onClick: add }, [h('iconify-icon', { icon: 'lucide:plus' }), 'Add']),
      ]),
      ...(props.modelValue?.length ? props.modelValue : ['']).map((value, index) => h('div', { class: 'repeat-row', key: index }, [
        h('input', { class: 'form-control', value, placeholder: props.label, onInput: (event) => update(index, event.target.value) }),
        h('button', { type: 'button', class: 'btn btn-outline-danger', onClick: () => remove(index) }, [h('iconify-icon', { icon: 'lucide:x' })]),
      ])),
    ])
  },
})

const RepeatableRows = defineComponent({
  props: { modelValue: Array, fields: Array, emptyLabel: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const update = (index, key, value) => {
      const next = [...(props.modelValue || [])]
      next[index] = { ...(next[index] || {}), [key]: value }
      emit('update:modelValue', next)
    }
    const remove = (index) => emit('update:modelValue', (props.modelValue || []).filter((_, i) => i !== index))
    return () => props.modelValue?.length
      ? h('div', { class: 'repeat-list' }, props.modelValue.map((row, index) => h('div', { class: 'repeat-row multi', key: index }, [
        ...(props.fields || []).map((field) => h('input', {
          class: 'form-control',
          value: row[field.key] ?? '',
          placeholder: field.label,
          type: field.type || 'text',
          onInput: (event) => update(index, field.key, event.target.value),
        })),
        h('button', { type: 'button', class: 'btn btn-outline-danger', onClick: () => remove(index) }, [h('iconify-icon', { icon: 'lucide:x' })]),
      ])))
      : h('p', { class: 'text-secondary-light text-sm mb-0' }, props.emptyLabel)
  },
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const property = ref({})
const categories = ref([])
const sectionTree = ref([])
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const error = ref('')
const validationMessage = ref('')
const activeTab = ref('main')
const selectedFiles = ref([])
const fileInput = ref(null)
const removedMediaIds = ref([])
const initialSnapshot = ref('')
const allowLeave = ref(false)

const statuses = ['active', 'pending', 'rejected', 'inactive', 'draft', 'sold', 'rented']
const detailPath = computed(() => `/properties/${route.params.id}`)
const canUpdate = computed(() => auth.hasPermission('property.update'))
const canStatus = computed(() => auth.hasPermission('property.status'))
const canFeature = computed(() => features.propertyFeatured && auth.hasPermission('property.feature'))
const canMedia = computed(() => auth.hasPermission('property.media.view'))

const form = reactive({
  main: {},
  basic: {},
  amenities: {},
  geography: {},
  highlights: {},
  open_house: {},
  media: { add: [] },
  multi_values: {},
})

const mediaAddFields = [{ key: 'file_url', label: 'Media URL' }, { key: 'media_type', label: 'Type' }, { key: 'sort_order', label: 'Sort', type: 'number' }]

const tabMeta = {
  main: { key: 'main', label: 'Main', icon: 'lucide:building-2', section: 'main' },
  basic: { key: 'basic', label: 'Basic Details', icon: 'lucide:list-checks', section: 'basic' },
  amenities: { key: 'amenities', label: 'Amenities', icon: 'lucide:square-check-big', section: 'amenities' },
  geography: { key: 'geography', label: 'Geography', icon: 'lucide:map-pin', section: 'geography' },
  highlights: { key: 'highlights', label: 'Highlights', icon: 'lucide:sparkles', section: 'highlights' },
  open_house: { key: 'open_house', label: 'Open House', icon: 'lucide:calendar-days', section: 'open_house' },
  multi_values: { key: 'multi_values', label: 'Extra Values', icon: 'lucide:tags', section: 'multi_values' },
}
const utilityTabs = [
  { key: 'media', label: 'Media', icon: 'lucide:image', section: 'media', media: true },
  { key: 'review', label: 'Review & Save', icon: 'lucide:clipboard-list', section: 'review' },
]
const configuredSections = computed(() => configuredPropertySections(activeCategory.value, sectionTree.value))
const configuredSectionKeys = computed(() => configuredSections.value.map((section) => section.key))
const visibleTabs = computed(() => [
  ...configuredSections.value.map((section) => ({ ...(tabMeta[section.key] || section), label: tabMeta[section.key]?.label || section.label })).filter((tab) => tabMeta[tab.key]),
  ...utilityTabs.filter((tab) => !tab.media || canMedia.value),
])
const tabKeys = computed(() => visibleTabs.value.map((tab) => tab.key))
const nextTab = computed(() => tabKeys.value[Math.min(tabKeys.value.indexOf(activeTab.value) + 1, tabKeys.value.length - 1)] || activeTab.value)
const previousTab = computed(() => tabKeys.value[Math.max(tabKeys.value.indexOf(activeTab.value) - 1, 0)] || activeTab.value)
const activeCategory = computed(() => form.main.category_name || property.value.category || '')
const visibleMultiValueConfig = computed(() => multiValueConfig.filter((item) => sectionFieldKeys('multi_values').includes(item.key)))
const basicFields = computed(() => {
  return sectionFieldKeys('basic').map((field) => ({ key: field, label: titleCase(field), type: numericBasicFields.has(field) ? 'number' : 'text', step: numericBasicFields.has(field) ? '0.01' : undefined, min: numericBasicFields.has(field) ? 0 : undefined }))
})
const activeMedia = computed(() => (property.value.media || []).filter((item) => !removedMediaIds.value.includes(Number(item.id))))
const queuedMediaAdd = computed(() => form.media.add.filter((item) => item.file_url || item.url))
const currentSnapshot = computed(() => stableStringify(normalizedState()))
const hasChanges = computed(() => currentSnapshot.value !== initialSnapshot.value)
const changedSections = computed(() => {
  if (!initialSnapshot.value) return []
  const initial = JSON.parse(initialSnapshot.value || '{}')
  const current = normalizedState()
  return payloadSectionKeys().filter((section) => stableStringify(initial[section]) !== stableStringify(current[section]))
})
const payloadPreview = computed(() => JSON.stringify(buildPayload(), null, 2))

function emptyMultiValues() {
  return Object.fromEntries(visibleMultiValueConfig.value.map((item) => [item.key, []]))
}

function tabVisible(section) {
  return configuredSectionKeys.value.includes(section)
}

function sectionFieldKeys(section) {
  return configuredSections.value.find((item) => item.key === section)?.fields || []
}

function payloadSectionKeys() {
  return [
    ...configuredSectionKeys.value,
    'media',
  ].filter((section, index, items) => items.indexOf(section) === index)
}

function sync() {
  const details = property.value.details || {}
  Object.assign(form.main, {
    category_name: property.value.category || '',
    purpose: property.value.listing_type || '',
    city: property.value.location?.city || property.value.city || '',
    locality: property.value.location?.locality || property.value.locality || '',
    map_address: property.value.location?.map_address || '',
    manual_address: property.value.location?.manual_address || '',
    full_address: property.value.location?.full_address || '',
    latitude: property.value.location?.latitude ?? '',
    longitude: property.value.location?.longitude ?? '',
    description: property.value.description || '',
    feeta_rating: property.value.feeta_rating ?? '',
    price: property.value.pricing?.price ?? property.value.price ?? '',
    monthly_rent: property.value.pricing?.monthly_rent ?? '',
    area_sqft: property.value.area?.area_sqft ?? '',
    carpet_area_sqft: property.value.area?.carpet_area_sqft ?? '',
    post_status: property.value.status || '',
    is_featured: Boolean(property.value.featured),
  })
  replaceObject(form.basic, pickKeys(details.basic || {}, sectionFieldKeys('basic')))
  replaceObject(form.amenities, { ...seedKeys(sectionFieldKeys('amenities')), ...pickKeys(property.value.amenities || {}, sectionFieldKeys('amenities')) })
  replaceObject(form.geography, { ...seedKeys(sectionFieldKeys('geography')), ...pickKeys(details.geography || {}, sectionFieldKeys('geography')) })
  replaceObject(form.highlights, { ...seedKeys(sectionFieldKeys('highlights')), ...pickKeys(details.highlights || {}, sectionFieldKeys('highlights')) })
  replaceObject(form.open_house, tabVisible('open_house') ? normalizeOpenHouse(details.open_house?.[0] || details.open_house || {}) : {})
  replaceObject(form.media, { add: [] })
  removedMediaIds.value = []
  replaceObject(form.multi_values, { ...emptyMultiValues(), ...pickKeys(details.multi_values || {}, sectionFieldKeys('multi_values')) })
  initialSnapshot.value = stableStringify(normalizedState())
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [data, cats, tree] = await Promise.all([
      propertyService.getProperty(route.params.id),
      masterPropertyService.getCategories({ per_page: 100, status: 'active' }).catch(() => []),
      masterPropertyService.getTree().catch(() => []),
    ])
    property.value = data || {}
    categories.value = cats?.data || cats || []
    sectionTree.value = tree || []
    sync()
  } catch (err) {
    error.value = err.message || 'Unable to load property.'
  } finally {
    loading.value = false
  }
}

function validate() {
  if (!form.main.category_name) return 'Category is required.'
  if (!form.main.purpose) return 'Listing type / purpose is required.'
  if (!form.main.city) return 'City is required.'
  if (form.main.latitude !== '' && !Number.isFinite(Number(form.main.latitude))) return 'Latitude must be numeric.'
  if (form.main.longitude !== '' && !Number.isFinite(Number(form.main.longitude))) return 'Longitude must be numeric.'
  for (const key of ['price', 'monthly_rent', 'area_sqft', 'carpet_area_sqft']) {
    if (form.main[key] !== '' && Number(form.main[key]) < 0) return `${titleCase(key)} cannot be negative.`
  }
  return ''
}

async function save(back = false) {
  validationMessage.value = validate()
  if (validationMessage.value) return
  const payload = buildPayload()
  if (!Object.keys(payload).length) {
    await Swal.fire({ icon: 'info', title: 'No changes to save', timer: 1200, showConfirmButton: false })
    return
  }

  if (removedMediaIds.value.length) {
    const confirm = await Swal.fire({
      title: 'Remove selected media?',
      text: `${removedMediaIds.value.length} media item(s) will be removed after saving.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, save changes',
    })
    if (!confirm.isConfirmed) return
  }

  saving.value = true
  try {
    property.value = await propertyService.updateProperty(route.params.id, payload)
    sync()
    await Swal.fire({ icon: 'success', title: 'Property updated', timer: 1200, showConfirmButton: false })
    if (back) {
      allowLeave.value = true
      router.push(detailPath.value)
    }
  } catch (err) {
    await Swal.fire('Update failed', err.message || 'Unable to update property.', 'error')
  } finally {
    saving.value = false
  }
}

function buildPayload() {
  const initial = JSON.parse(initialSnapshot.value || '{}')
  const current = normalizedState()
  const payload = {}
  const sectionMap = {
    main: () => ({ main: current.main }),
    basic: () => ({ basic: current.basic }),
    amenities: () => ({ amenities: current.amenities }),
    geography: () => ({ geography: current.geography }),
    highlights: () => ({ highlights: current.highlights }),
    open_house: () => ({ open_house: current.open_house }),
    media: () => current.media.remove_ids.length || current.media.add.length ? { media: current.media } : {},
    multi_values: () => ({ multi_values: current.multi_values }),
  }
  for (const section of payloadSectionKeys()) {
    if (!sectionMap[section]) continue
    if (stableStringify(initial[section]) !== stableStringify(current[section])) {
      Object.assign(payload, sectionMap[section]())
    }
  }
  return payload
}

function normalizedState() {
  return {
    main: cleanObject({
      ...form.main,
      latitude: numberOrNull(form.main.latitude),
      longitude: numberOrNull(form.main.longitude),
      feeta_rating: numberOrNull(form.main.feeta_rating),
      price: numberOrNull(form.main.price),
      monthly_rent: numberOrNull(form.main.monthly_rent),
      area_sqft: numberOrNull(form.main.area_sqft),
      carpet_area_sqft: numberOrNull(form.main.carpet_area_sqft),
      post_status: canStatus.value ? form.main.post_status : undefined,
      is_featured: canFeature.value ? form.main.is_featured : undefined,
    }),
    basic: cleanObject(form.basic),
    amenities: cleanObject(form.amenities),
    geography: cleanObject(form.geography),
    highlights: cleanObject(form.highlights),
    open_house: cleanObject(form.open_house),
    media: {
      add: queuedMediaAdd.value.map((item) => cleanObject({ ...item, sort_order: numberOrNull(item.sort_order), media_type: item.media_type || 'photo' })),
      remove_ids: removedMediaIds.value,
    },
    multi_values: Object.fromEntries(visibleMultiValueConfig.value.map(({ key }) => [key, cleanArray(form.multi_values[key])])),
  }
}

function replaceObject(target, source) {
  Object.keys(target).forEach((key) => delete target[key])
  Object.assign(target, source || {})
}

function seedKeys(keys) {
  return Object.fromEntries(keys.map((key) => [key, '']))
}

function pickKeys(source = {}, keys = []) {
  const allowed = new Set(keys)
  return Object.fromEntries(Object.entries(source || {}).filter(([key]) => allowed.has(key)))
}

function cleanObject(value = {}) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== '' && item !== null && item !== undefined))
}

function cleanArray(value = []) {
  return Array.from(value || []).map((item) => String(item || '').trim()).filter(Boolean)
}

function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : value
}

function stableStringify(value) {
  return JSON.stringify(sortDeep(value))
}

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (!value || typeof value !== 'object') return value
  return Object.keys(value)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = sortDeep(value[key])
      return sorted
    }, {})
}

function normalizeOpenHouse(value) {
  const data = { ...(value || {}) }
  return {
    scheduled_date: data.scheduled_date || '',
    from_time: String(data.from_time || '').slice(0, 5),
    to_time: String(data.to_time || '').slice(0, 5),
    notes: data.notes || '',
  }
}

function addMediaUrl() {
  form.media.add.push({ file_url: '', media_type: 'photo', sort_order: '' })
}

async function markMediaForRemoval(item) {
  const result = await Swal.fire({
    title: 'Mark media for removal?',
    text: 'It will only be removed after you click Save All.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Mark remove',
  })
  if (result.isConfirmed) {
    removedMediaIds.value = [...new Set([...removedMediaIds.value, Number(item.id)])]
  }
}

function isImage(item) {
  return ['photo', 'image'].includes(String(item.type || '').toLowerCase()) || /\.(png|jpe?g|webp|gif)$/i.test(item.url || '')
}

function onFilesChange(event) {
  selectedFiles.value = Array.from(event.target.files || [])
}

async function uploadPhotos() {
  if (!selectedFiles.value.length) return
  uploading.value = true
  try {
    property.value.media = await propertyService.uploadPropertyPhotos(route.params.id, selectedFiles.value, { is_primary: activeMedia.value.length ? 0 : 1 })
    selectedFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
    await Swal.fire({ icon: 'success', title: 'Photo uploaded', timer: 1100, showConfirmButton: false })
  } catch (err) {
    await Swal.fire('Upload failed', err.message || 'Unable to upload photo.', 'error')
  } finally {
    uploading.value = false
  }
}

function beforeUnload(event) {
  if (!hasChanges.value || allowLeave.value) return
  event.preventDefault()
  event.returnValue = ''
}

watch(visibleTabs, () => {
  if (!visibleTabs.value.some((tab) => tab.key === activeTab.value)) activeTab.value = visibleTabs.value[0]?.key || 'review'
})

onBeforeRouteLeave(async () => {
  if (!hasChanges.value || allowLeave.value) return true
  const result = await Swal.fire({
    title: 'Discard unsaved changes?',
    text: 'Your property edit changes have not been saved.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Discard',
    cancelButtonText: 'Stay',
  })
  return result.isConfirmed
})

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
  load()
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>

<style scoped>
.property-edit-page{--property-blue:#2563eb;--property-teal:#0f766e;--property-ink:#0f172a;--property-muted:#64748b;--property-line:#e2e8f0;--property-soft:#f8fafc}.property-edit-shell{display:flex;flex-direction:column;gap:22px}.edit-hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border:1px solid rgba(148,163,184,.24);border-radius:18px;background:linear-gradient(135deg,#fff 0%,#f8fbff 55%,#eef8f5 100%);box-shadow:0 18px 48px rgba(15,23,42,.08)}.edit-hero-title{display:flex;align-items:center;gap:16px;min-width:0}.edit-hero-icon{width:56px;height:56px;display:grid;place-items:center;flex:0 0 56px;border-radius:16px;color:#fff;background:linear-gradient(135deg,var(--property-blue),var(--property-teal));box-shadow:0 12px 28px rgba(37,99,235,.25);font-size:27px}.eyebrow{display:inline-block;margin-bottom:6px;color:var(--property-blue);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.edit-hero h5{color:var(--property-ink);font-size:24px;font-weight:800}.hero-actions,.form-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}.hero-actions .btn,.form-actions .btn{min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:10px;font-weight:750}
.property-edit-shell>.card{overflow:hidden;border:1px solid rgba(148,163,184,.25);border-radius:18px!important;box-shadow:0 18px 48px rgba(15,23,42,.08)}.property-edit-shell>.card>.card-header{background:#fff!important}.property-edit-tabs{gap:10px;flex-wrap:wrap;border-bottom:0}.property-edit-tabs .nav-link{position:relative;min-height:40px;display:inline-flex;align-items:center;gap:8px;border:1px solid #e2e8f0;border-radius:999px;color:#475569;background:#f8fafc;font-weight:750;transition:.18s ease}.property-edit-tabs .nav-link:hover{color:#1d4ed8;background:#eff6ff;border-color:#bfdbfe}.property-edit-tabs .nav-link.active{color:#fff;background:#2563eb;border-color:#2563eb;box-shadow:0 10px 22px rgba(37,99,235,.22)}.change-dot{width:8px;height:8px;border-radius:999px;background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.16)}.tab-panel{min-height:360px}.section-title{display:flex;align-items:flex-start;gap:13px;margin-bottom:24px;padding:16px;border:1px solid #e2e8f0;border-radius:14px;background:linear-gradient(135deg,#fff,#f8fafc)}.section-title-icon{width:44px;height:44px;display:grid;place-items:center;flex:0 0 44px;border-radius:13px;color:#2563eb;background:#eff6ff;font-size:22px}.section-title h6{color:#0f172a;font-weight:800}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.field{display:flex;flex-direction:column;gap:8px;color:#475569;font-size:13px;font-weight:750;min-width:0}.field.wide{grid-column:1/-1}.field :deep(.form-control),.field :deep(.form-select),.repeat-row .form-control,.upload-actions .form-control{min-height:44px;border-color:#dbe3ee;border-radius:12px;color:#0f172a;box-shadow:0 1px 2px rgba(15,23,42,.04)}.field :deep(textarea.form-control){min-height:104px}.nested-card{padding:18px;border:1px dashed #bfdbfe;border-radius:16px;background:#f8fbff}.media-edit-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}.media-edit-card{overflow:hidden;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(15,23,42,.06)}.media-edit-card img,.media-file{width:100%;height:154px;object-fit:cover;background:#f1f5f9}.media-file{display:grid;place-items:center;font-size:34px;color:#94a3b8}.media-edit-body{display:flex;flex-direction:column;gap:9px;padding:14px}.media-edit-body small{color:#64748b;word-break:break-all}.upload-actions{display:flex;gap:10px;min-width:min(100%,540px)}.extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.tag-editor{padding:18px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(15,23,42,.04)}.tag-editor-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.repeat-list{display:flex;flex-direction:column;gap:10px}.repeat-row{display:flex;align-items:center;gap:8px}.repeat-row.multi{align-items:flex-start}.repeat-row.multi .form-control:first-child{flex:2}.review-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.review-card{padding:18px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(15,23,42,.04)}.review-card span{display:block;color:#64748b;font-size:13px}.review-card strong{display:block;margin-top:6px;color:#0f172a}.payload-preview{max-height:360px;overflow:auto;margin-top:18px;padding:18px;border-radius:14px;background:#0f172a;color:#dbeafe;font-size:12px}.form-actions{position:sticky;bottom:0;z-index:2;margin:26px -24px -24px;padding:18px 24px;border-top:1px solid #edf1f6;background:rgba(255,255,255,.94);backdrop-filter:blur(10px)}
@media(max-width:991px){.edit-hero{align-items:flex-start;flex-direction:column}.edit-hero-title{align-items:flex-start}.hero-actions{justify-content:flex-start}.form-grid,.extra-grid,.review-grid{grid-template-columns:1fr}.field.wide{grid-column:auto}.upload-actions{width:100%;flex-direction:column}}@media(max-width:575px){.edit-hero-title{flex-direction:column}.hero-actions,.hero-actions .btn,.form-actions .btn{width:100%}.property-edit-tabs .nav-link{width:100%;justify-content:center}.repeat-row,.repeat-row.multi{flex-direction:column;align-items:stretch}.form-actions{position:static;margin:24px 0 0;padding:18px 0 0;background:transparent}}
</style>
