<template>
  <div class="dashboard-main-body user-profile-page">
<LoadingState v-if="loading && !user.id" message="Loading complete user profile..." />
    <ErrorState v-else-if="error && !user.id" :message="error" @retry="loadUser" />

    <template v-else>
      <div class="profile-hero mb-24 position-relative">
        <div v-if="loading" class="profile-refreshing"><span class="spinner-border spinner-border-sm"></span> Refreshing</div>
        <div class="profile-avatar">
          <img v-if="avatar" :src="avatar" :alt="userName" /><span v-else>{{ initials(userName) }}</span>
        </div>
        <div class="flex-grow-1 min-w-0">
          <div class="profile-title-row"><h4 class="mb-0 text-break">{{ userName }}</h4><span class="role-badge">{{ roleLabel }}</span></div>
          <div class="hero-contact mt-10"><span><iconify-icon icon="ri:mail-line" />{{ value(user.email) }}</span><span><iconify-icon icon="ri:phone-line" />{{ value(user.phone) }}</span></div>
          <div class="profile-status-row mt-12"><StatusBadge :status="accountStatus" /><StatusBadge :status="verificationStatus" /><span class="user-id-pill">User ID #{{ user.id }}</span><CopyButton :value="user.id" label="user ID" /></div>
        </div>
        <div class="hero-actions">
          <button class="btn btn-outline-primary-600" :disabled="loading || actionLoading" @click="loadUser"><iconify-icon icon="ri:refresh-line" />Refresh</button>
          <button v-if="can('user.update')" class="btn btn-primary-600" :disabled="actionLoading" @click="startEdit"><iconify-icon icon="ri:edit-line" />Edit</button>
          <button v-if="can('user.status') && accountStatus === 'inactive'" class="btn btn-success-600" :disabled="actionLoading" @click="changeStatus('activate')"><iconify-icon icon="ri:user-follow-line" />Activate</button>
          <button v-if="can('user.status') && accountStatus !== 'blocked'" class="btn btn-outline-danger" :disabled="actionLoading" @click="changeStatus('block')"><iconify-icon icon="ri:user-forbid-line" />Block</button>
          <button v-if="can('user.status') && accountStatus === 'blocked'" class="btn btn-success-600" :disabled="actionLoading" @click="changeStatus('unblock')"><iconify-icon icon="ri:lock-unlock-line" />Unblock</button>
          <button v-if="can('user.delete') && !user.is_deleted" class="btn btn-danger-600" :disabled="actionLoading" @click="removeUser"><iconify-icon icon="ri:delete-bin-line" />Delete</button>
        </div>
      </div>

      <div class="profile-tabs mb-24" role="tablist" aria-label="User profile sections">
        <button v-for="tab in tabs" :key="tab.key" type="button" :class="{ active: activeTab === tab.key }" @click="selectTab(tab.key)"><iconify-icon :icon="tab.icon" />{{ tab.label }}</button>
      </div>

      <section v-if="activeTab === 'overview'" class="row gy-4">
        <div v-for="card in overviewCards" :key="card.label" class="col-sm-6 col-xl-3"><div class="metric-card"><span :class="card.color"><iconify-icon :icon="card.icon" /></span><div><small>{{ card.label }}</small><strong>{{ card.value }}</strong></div></div></div>
        <div class="col-xl-6"><section class="profile-card h-100"><SectionTitle icon="ri:user-line" title="Account overview" subtitle="Identity and account metadata" /><div class="detail-grid"><Info label="Full name" :value="userName" /><Info label="Role" :value="roleLabel" /><Info label="Registration" :value="formatDate(registrationDate)" /><Info label="Last login" :value="formatDate(user.last_login_at)" /><Info label="Account status"><StatusBadge :status="accountStatus" /></Info><Info label="Verification"><StatusBadge :status="verificationStatus" /></Info></div></section></div>
        <div class="col-xl-6"><section class="profile-card h-100"><div class="section-title-action"><SectionTitle icon="ri:shield-check-line" title="Verification" subtitle="Dedicated verification controls" /><button v-if="can('user.verification')" class="btn btn-sm btn-outline-primary-600" :disabled="actionLoading" @click="toggleVerification"><iconify-icon icon="ri:shield-check-line" />{{ verificationStatus === 'verified' ? 'Reset verification' : 'Mark verified' }}</button></div><div class="detail-grid"><Info label="Phone"><StatusBadge :status="user.is_phone_verified ? 'verified' : 'pending'" /></Info><Info label="Email"><StatusBadge :status="user.is_email_verified ? 'verified' : 'pending'" /></Info><Info label="KYC status" :value="verificationStatus" /><Info label="Verified at" :value="formatDate(user.kyc_verified_at || user.verification?.kyc_verified_at)" /></div></section></div>
      </section>

      <section v-if="activeTab === 'profile'" class="profile-card">
        <div class="section-title-action"><SectionTitle icon="ri:profile-line" title="Profile information" subtitle="Only safe profile fields are editable" /><button v-if="can('user.update') && !editMode" class="btn btn-sm btn-primary-600" @click="startEdit"><iconify-icon icon="ri:edit-line" />Edit profile</button></div>
        <form v-if="editMode" class="profile-form" @submit.prevent="saveProfile">
          <div v-for="field in editableFields" :key="field.key" :class="field.wide ? 'field-wide' : ''">
            <label class="form-label">{{ field.label }}</label>
            <textarea v-if="field.type === 'textarea'" v-model="form[field.key]" class="form-control" rows="3" :placeholder="field.placeholder"></textarea>
            <input v-else v-model="form[field.key]" class="form-control" :type="field.type || 'text'" :placeholder="field.placeholder" />
            <div v-if="fieldErrors[field.key]" class="text-danger text-xs mt-4">{{ fieldErrors[field.key] }}</div>
          </div>
          <div class="field-wide d-flex gap-2 flex-wrap pt-2"><button class="btn btn-primary-600" type="submit" :disabled="actionLoading"><span v-if="actionLoading" class="spinner-border spinner-border-sm"></span><iconify-icon v-else icon="ri:save-line" />Save changes</button><button class="btn btn-outline-secondary-600" type="button" :disabled="actionLoading" @click="cancelEdit">Cancel</button></div>
        </form>
        <div v-else class="detail-grid"><Info v-for="field in profileDisplayFields" :key="field.label" :label="field.label" :value="field.value" :wide="field.wide" /></div>
      </section>

      <section v-if="activeTab === 'devices'" class="profile-card">
        <SectionTitle icon="ri:smartphone-line" title="Devices" subtitle="Read-only login and push-device information; identifiers remain hidden" />
        <ResponsiveTable v-if="devices.length" :headers="['Device name','Platform','App version','Last login','Login date','Device status']"><tr v-for="(device,index) in devices" :key="`${device.source}-${index}`"><td>{{ value(device.device_name) }}</td><td class="text-capitalize">{{ value(device.platform) }}</td><td>{{ value(device.app_version) }}</td><td>{{ formatDate(device.last_login) }}</td><td>{{ formatDate(device.login_date) }}</td><td><StatusBadge :status="device.is_active === false ? 'inactive' : 'active'" /></td></tr></ResponsiveTable>
        <EmptyState v-else icon="ri:smartphone-line" title="No devices found" message="No device information is available for this user." />
      </section>

      <section v-if="activeTab === 'favourites'" class="profile-card">
        <SectionTitle icon="ri:heart-3-line" title="Favourite properties" :subtitle="`${favouriteTotal} saved properties`" />
        <ResponsiveTable v-if="favourites.length" :headers="['Property','Category','City','Favourite date','Actions']"><tr v-for="item in favourites" :key="item.fav_id || item.post_id"><td>#{{ item.post_id }}</td><td>{{ value(item.category_name) }}</td><td>{{ value([item.locality,item.city].filter(Boolean).join(', ')) }}</td><td>{{ formatDate(item.created_at) }}</td><td><router-link v-if="canAny(['property.view'])" class="btn btn-sm btn-outline-primary-600" :to="`/properties/${item.post_id}`"><iconify-icon icon="ri:eye-line" />View property</router-link><span v-else>-</span></td></tr></ResponsiveTable>
        <EmptyState v-else icon="ri:heart-3-line" title="No favourite properties" message="This user has not saved any properties." />
      </section>

      <section v-if="activeTab === 'enquiries'" class="profile-card">
        <SectionTitle icon="ri:question-answer-line" title="Enquiries" :subtitle="`${enquiryTotal} enquiries and offers`" />
        <ResponsiveTable v-if="enquiries.length" :headers="['Enquiry','Property','Agent / source','Status','Date','Actions']"><tr v-for="item in enquiries" :key="`${item.source}-${item.id}`"><td>#{{ item.id }}<div class="text-secondary-light text-xs">{{ value(item.category_name || item.message) }}</div></td><td>{{ item.post_id ? `#${item.post_id}` : 'Not linked' }}</td><td class="text-capitalize">{{ sourceLabel(item.source) }}</td><td><StatusBadge :status="item.status" /></td><td>{{ formatDate(item.created_at) }}</td><td><router-link v-if="item.post_id && canAny(['property.view'])" class="btn btn-sm btn-outline-primary-600" :to="`/properties/${item.post_id}`">View property</router-link><span v-else>-</span></td></tr></ResponsiveTable>
        <EmptyState v-else icon="ri:question-answer-line" title="No enquiries found" message="No contact enquiries or property offers are available." />
      </section>

      <section v-if="activeTab === 'conversations'" class="profile-card">
        <SectionTitle icon="ri:chat-3-line" title="Conversations" :subtitle="`${conversationTotal} conversations | ${messageTotal} messages`" />
        <ResponsiveTable v-if="conversations.length" :headers="['Conversation ID','Participant / type','Last message','Last activity']"><tr v-for="item in conversations" :key="item.id"><td>#{{ item.id }}</td><td class="text-capitalize">{{ value(item.type) }}</td><td>{{ item.last_message_id ? `Message #${item.last_message_id}` : 'No messages' }}</td><td>{{ formatDate(item.updated_at) }}</td></tr></ResponsiveTable>
        <EmptyState v-else icon="ri:chat-3-line" title="No conversations" message="This user has no conversation history." />
      </section>

      <section v-if="activeTab === 'notifications'" class="profile-card">
        <SectionTitle icon="ri:notification-3-line" title="Notification history" :subtitle="`${notificationTotal} total | ${notificationUnread} unread`" />
        <ResponsiveTable v-if="notifications.length" :headers="['Title','Type','Read status','Sent date']"><tr v-for="item in notifications" :key="`${item.source}-${item.id}`"><td>{{ value(item.title) }}<div class="text-secondary-light text-xs">{{ value(item.body) }}</div></td><td class="text-capitalize">{{ sourceLabel(item.type) }}</td><td><StatusBadge :status="item.is_read ? 'read' : 'unread'" /></td><td>{{ formatDate(item.created_at) }}</td></tr></ResponsiveTable>
        <EmptyState v-else icon="ri:notification-3-line" title="No notifications" message="No notification history is available." />
      </section>

      <section v-if="activeTab === 'activity'" class="row gy-4">
        <div v-for="card in activityCards" :key="card.label" class="col-sm-6 col-xl-3"><div class="metric-card"><span :class="card.color"><iconify-icon :icon="card.icon" /></span><div><small>{{ card.label }}</small><strong>{{ card.value }}</strong></div></div></div>
        <div class="col-12"><section class="profile-card"><SectionTitle icon="ri:history-line" title="Activity summary" subtitle="Read-only data derived from the user relationship response" /><div class="detail-grid"><Info label="Last seen" :value="formatDate(user.last_seen_at)" /><Info label="Last login" :value="formatDate(user.last_login_at)" /><Info label="Account created" :value="formatDate(registrationDate)" /><Info label="Last profile update" :value="formatDate(user.updatedAt || user.updated_at)" /></div></section></div>
      </section>
    </template>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CopyButton from '@/components/common/CopyButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import userService from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import { mediaUrl } from '@/utils/mediaUrl'

const SectionTitle = defineComponent({ props: { icon: String, title: String, subtitle: String }, setup: (props) => () => h('div', { class: 'section-heading' }, [h('span', [h('iconify-icon', { icon: props.icon })]), h('div', [h('h6', { class: 'mb-2' }, props.title), h('p', { class: 'mb-0' }, props.subtitle)])]) })
const Info = defineComponent({ props: { label: String, value: [String, Number], wide: Boolean }, setup: (props, { slots }) => () => h('div', { class: ['detail-item', { 'is-wide': props.wide }] }, [h('span', props.label), slots.default ? slots.default() : h('strong', props.value || 'Not available')]) })
const ResponsiveTable = defineComponent({ props: { headers: Array }, setup: (props, { slots }) => () => h('div', { class: 'table-responsive' }, [h('table', { class: 'table profile-table mb-0' }, [h('thead', [h('tr', props.headers.map((header) => h('th', header)))]), h('tbody', slots.default?.())])]) })

const route = useRoute(); const router = useRouter(); const auth = useAuthStore()
const user = ref({}); const loading = ref(true); const error = ref(''); const actionLoading = ref(false); const editMode = ref(false); const fieldErrors = ref({})
const activeTab = ref(String(route.query.tab || 'overview'))
const form = reactive({}); const originalForm = ref({})
const tabs = [
  { key: 'overview', label: 'Overview', icon: 'ri:dashboard-line' }, { key: 'profile', label: 'Profile', icon: 'ri:user-line' },
  { key: 'devices', label: 'Devices', icon: 'ri:smartphone-line' }, { key: 'favourites', label: 'Favourite Properties', icon: 'ri:heart-3-line' },
  { key: 'enquiries', label: 'Enquiries', icon: 'ri:question-answer-line' }, { key: 'conversations', label: 'Conversations', icon: 'ri:chat-3-line' },
  { key: 'notifications', label: 'Notifications', icon: 'ri:notification-3-line' }, { key: 'activity', label: 'Activity', icon: 'ri:history-line' },
]
const permissionAliases = {
  'user.view': ['user.view', 'users.view', 'view_users'], 'user.update': ['user.update', 'users.edit', 'manage_users'],
  'user.delete': ['user.delete', 'users.delete', 'delete_users'], 'user.status': ['user.status', 'users.edit', 'restore_users'],
  'user.verification': ['user.verification', 'users.edit', 'manage_users'],
}
const can = (permission) => auth.hasAnyPermission(permissionAliases[permission] || [permission]); const canAny = (permissions) => permissions.some(can)
const userName = computed(() => user.value.name || [user.value.firstName, user.value.lastName].filter(Boolean).join(' ') || 'Unnamed user')
const roleLabel = computed(() => String(user.value.role?.name || user.value.role || 'User').replace(/[-_]/g, ' '))
const avatar = computed(() => mediaUrl(user.value.profile?.profile_pic || user.value.profile_pic || ''))
const accountStatus = computed(() => String(user.value.status || user.value.chat_status || (user.value.is_deleted ? 'deleted' : 'active')).toLowerCase())
const verificationStatus = computed(() => String(user.value.verification_status || user.value.kyc_status || 'pending').toLowerCase())
const registrationDate = computed(() => user.value.registration_date || user.value.createdAt || user.value.created_at)
const devices = computed(() => user.value.device_information || [])
const favourites = computed(() => user.value.favourite_properties?.recent || [])
const favouriteTotal = computed(() => user.value.favourite_properties?.total ?? favourites.value.length)
const enquiries = computed(() => user.value.enquiry_summary?.recent || [])
const enquiryTotal = computed(() => user.value.enquiry_summary?.total ?? enquiries.value.length)
const conversations = computed(() => user.value.conversation_summary?.recent || [])
const conversationTotal = computed(() => user.value.conversation_summary?.total_conversations ?? conversations.value.length)
const messageTotal = computed(() => user.value.conversation_summary?.total_messages ?? 0)
const notifications = computed(() => user.value.notification_summary?.recent || [])
const notificationTotal = computed(() => user.value.notification_summary?.total ?? notifications.value.length)
const notificationUnread = computed(() => user.value.notification_summary?.unread ?? 0)
const propertyViews = computed(() => user.value.property_view_summary?.total_views ?? '-')
const overviewCards = computed(() => [
  { label: 'Favourite properties', value: favouriteTotal.value, icon: 'ri:heart-3-line', color: 'bg-primary-50 text-primary-600' },
  { label: 'Enquiries', value: enquiryTotal.value, icon: 'ri:question-answer-line', color: 'bg-warning-focus text-warning-600' },
  { label: 'Conversations', value: conversationTotal.value, icon: 'ri:chat-3-line', color: 'bg-info-focus text-info-600' },
  { label: 'Notifications', value: notificationTotal.value, icon: 'ri:notification-3-line', color: 'bg-success-focus text-success-600' },
])
const activityCards = computed(() => [
  { label: 'Known logins', value: devices.value.filter((item) => item.source === 'login').length, icon: 'ri:login-circle-line', color: 'bg-primary-50 text-primary-600' },
  { label: 'Property views', value: propertyViews.value, icon: 'ri:eye-line', color: 'bg-info-focus text-info-600' },
  { label: 'Favourites', value: favouriteTotal.value, icon: 'ri:heart-3-line', color: 'bg-danger-focus text-danger-600' },
  { label: 'Enquiries', value: enquiryTotal.value, icon: 'ri:question-answer-line', color: 'bg-warning-focus text-warning-600' },
])
const editableFields = [
  { key: 'firstName', label: 'First name' }, { key: 'lastName', label: 'Last name' }, { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' }, { key: 'whatsapp', label: 'WhatsApp' }, { key: 'profile_pic', label: 'Profile image URL / path' },
  { key: 'address', label: 'Address', wide: true }, { key: 'city', label: 'City' }, { key: 'pincode', label: 'Pincode' },
  { key: 'about_me', label: 'About user', type: 'textarea', wide: true },
]
const profileDisplayFields = computed(() => [
  { label: 'First name', value: value(user.value.firstName) }, { label: 'Last name', value: value(user.value.lastName) },
  { label: 'Email', value: value(user.value.email) }, { label: 'Phone', value: value(user.value.phone) },
  { label: 'WhatsApp', value: value(user.value.profile?.whatsapp || user.value.whatsapp) }, { label: 'City', value: value(user.value.profile?.city || user.value.city) },
  { label: 'Pincode', value: value(user.value.profile?.pincode || user.value.pincode) }, { label: 'Address', value: value(user.value.profile?.address || user.value.address), wide: true },
  { label: 'About user', value: value(user.value.profile?.about_me || user.value.about_me), wide: true },
])

function value(input) { return input === undefined || input === null || input === '' ? 'Not available' : input }
function initials(name) { return String(name || 'User').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U' }
function formatDate(input) { if (!input) return 'Not available'; const date = new Date(input); return Number.isNaN(date.getTime()) ? String(input) : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
function sourceLabel(input) { return String(input || 'Not available').replaceAll('_', ' ') }
function selectTab(tab) { activeTab.value = tab; router.replace({ query: { ...route.query, tab: tab === 'overview' ? undefined : tab } }) }
function profileFormData() { const profile = user.value.profile || {}; return Object.fromEntries(editableFields.map(({ key }) => [key, user.value[key] ?? profile[key] ?? ''])) }
function startEdit() { Object.assign(form, profileFormData()); originalForm.value = { ...form }; fieldErrors.value = {}; editMode.value = true; selectTab('profile') }
function cancelEdit() { editMode.value = false; fieldErrors.value = {} }

async function loadUser() { if (loading.value && user.value.id) return; loading.value = true; error.value = ''; try { user.value = await userService.getUser(route.params.id); if (editMode.value) startEdit() } catch (err) { error.value = err.message } finally { loading.value = false } }
async function saveProfile() {
  if (actionLoading.value) return
  fieldErrors.value = {}
  const payload = {}
  editableFields.forEach(({ key }) => { if (String(form[key] ?? '') !== String(originalForm.value[key] ?? '')) payload[key] = typeof form[key] === 'string' ? (form[key].trim() || null) : form[key] })
  if (!Object.keys(payload).length) { editMode.value = false; return }
  actionLoading.value = true
  try { user.value = await userService.updateUser(user.value.id, payload); await loadUser(); editMode.value = false; await Swal.fire({ icon: 'success', title: 'Profile updated', timer: 1200, showConfirmButton: false }) }
  catch (err) { fieldErrors.value = Object.fromEntries(Object.entries(err.errors || {}).map(([key, messages]) => [key, Array.isArray(messages) ? messages[0] : messages])); await Swal.fire({ icon: 'error', title: 'Update failed', text: err.message }) }
  finally { actionLoading.value = false }
}
async function changeStatus(status) {
  if (actionLoading.value) return
  const labels = { activate: 'Activate', block: 'Block', unblock: 'Unblock' }; const label = labels[status]
  const result = await Swal.fire({ title: `${label} user?`, input: 'textarea', inputLabel: 'Reason', inputPlaceholder: `Optional reason to ${label.toLowerCase()} this user`, icon: status === 'block' ? 'warning' : 'question', showCancelButton: true, confirmButtonText: label, confirmButtonColor: status === 'block' ? '#dc2626' : undefined })
  if (!result.isConfirmed) return
  actionLoading.value = true
  const successLabels = { activate: 'User activated', block: 'User blocked', unblock: 'User unblocked' }
  try { await userService.updateStatus(user.value.id, { status, reason: result.value?.trim() || undefined }); await loadUser(); await Swal.fire({ icon: 'success', title: successLabels[status], timer: 1200, showConfirmButton: false }) }
  catch (err) { await Swal.fire({ icon: 'error', title: 'Status update failed', text: err.message }) }
  finally { actionLoading.value = false }
}
async function toggleVerification() {
  if (actionLoading.value) return
  const verify = verificationStatus.value !== 'verified'; const result = await Swal.fire({ title: verify ? 'Mark user verified?' : 'Reset verification?', input: 'textarea', inputLabel: 'Remarks', icon: 'question', showCancelButton: true, confirmButtonText: verify ? 'Mark verified' : 'Reset' })
  if (!result.isConfirmed) return
  actionLoading.value = true
  try { await userService.updateVerification(user.value.id, { is_phone_verified: verify, is_email_verified: verify, verification_status: verify ? 'verified' : 'pending', remarks: result.value?.trim() || undefined }); await loadUser(); await Swal.fire({ icon: 'success', title: 'Verification updated', timer: 1200, showConfirmButton: false }) }
  catch (err) { await Swal.fire({ icon: 'error', title: 'Verification update failed', text: err.message }) }
  finally { actionLoading.value = false }
}
async function removeUser() {
  if (actionLoading.value) return
  const result = await Swal.fire({ title: 'Delete user?', text: 'This soft-deletes the account while preserving conversations, messages, favourites, enquiries, notifications and payment history.', input: 'textarea', inputLabel: 'Deletion reason', inputPlaceholder: 'Reason for deletion', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete user', confirmButtonColor: '#dc2626' })
  if (!result.isConfirmed) return
  actionLoading.value = true
  try { await userService.deleteUser(user.value.id, { reason: result.value?.trim() || undefined }); await Swal.fire({ icon: 'success', title: 'User deleted', timer: 1200, showConfirmButton: false }); await router.push('/users-list') }
  catch (err) { await Swal.fire({ icon: 'error', title: 'Delete failed', text: err.message }) }
  finally { actionLoading.value = false }
}

watch(() => route.params.id, loadUser)
watch(() => route.query.tab, (tab) => { activeTab.value = tabs.some((item) => item.key === tab) ? String(tab) : 'overview' })
onMounted(loadUser)
</script>

<style scoped>
.user-profile-page {
  max-width: 100%;
  overflow-x: hidden;
  color: #172033;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 26px;
  border: 1px solid #d9e2ef;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.profile-refreshing {
  position: absolute;
  top: 12px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #315ed1;
  font-size: 12px;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  flex: 0 0 96px;
  overflow: hidden;
  border: 4px solid #f1f5f9;
  border-radius: 8px;
  color: #fff;
  background: #315ed1;
  font-size: 30px;
  font-weight: 800;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.profile-title-row h4 {
  color: #0f172a;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 12px;
  border: 1px solid #c7d7fe;
  border-radius: 999px;
  color: #315ed1;
  background: #f4f7ff;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.hero-contact {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-contact span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #475569;
  font-size: 13px;
}

.hero-contact iconify-icon {
  color: #315ed1;
  font-size: 16px;
}

.profile-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-id-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
}

.hero-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 540px;
}

.hero-actions .btn,
.profile-form .btn,
.section-title-action .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  border-radius: 8px;
  font-weight: 700;
}

.profile-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e5edf6;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.035);
}

.profile-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 13px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}

.profile-tabs button.active,
.profile-tabs button:hover {
  color: #315ed1;
  border-color: #c7d7fe;
  background: #edf3ff;
}

.profile-card {
  padding: 24px;
  border: 1px solid #e5edf6;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.035);
}

.metric-card {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid #e5edf6;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.025);
}

.metric-card > span {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  border-radius: 8px;
  font-size: 21px;
}

.metric-card small {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.metric-card strong {
  display: block;
  margin-top: 5px;
  color: #172033;
  font-size: 23px;
}

.section-title-action {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 17px;
  margin-bottom: 18px;
  border-bottom: 1px solid #edf1f6;
  flex: 1;
  min-width: 240px;
}

.section-heading > span {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  border: 1px solid #dbe7ff;
  border-radius: 8px;
  color: #315ed1;
  background: #f4f7ff;
  font-size: 20px;
}

.section-heading h6 {
  color: #0f172a;
  font-weight: 800;
  letter-spacing: 0;
}

.section-heading p {
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 30px;
}

:deep(.detail-item) {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  min-height: 52px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f3f7;
}

:deep(.detail-item span) {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

:deep(.detail-item strong) {
  text-align: right;
  color: #172033;
  font-weight: 800;
  word-break: break-word;
}

:deep(.detail-item.is-wide) {
  grid-column: 1 / -1;
}

.profile-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.profile-form .form-label {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.profile-form .form-control {
  min-height: 44px;
  border-color: #dbe5f1;
  border-radius: 8px;
}

.profile-form textarea.form-control {
  min-height: 108px;
}

.field-wide {
  grid-column: 1 / -1;
}

.profile-table {
  min-width: 840px;
}

.profile-table th {
  padding: 13px 15px;
  border-bottom: 1px solid #e5edf6;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  background: #f8fafc;
  white-space: nowrap;
}

.profile-table td {
  padding: 14px 15px;
  vertical-align: middle;
  border-color: #eef2f7;
  max-width: 360px;
  word-break: break-word;
  color: #334155;
}

.profile-table tbody tr:hover {
  background: #f8fbff;
}

@media (max-width: 1199px) {
  .profile-hero {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .hero-actions {
    justify-content: flex-start;
    max-width: none;
    width: 100%;
  }
}

@media (max-width: 767px) {
  .profile-hero {
    flex-direction: column;
  }

  .profile-form,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .field-wide,
  :deep(.detail-item.is-wide) {
    grid-column: auto;
  }

  .hero-actions,
  .hero-actions .btn {
    width: 100%;
  }

  .profile-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .profile-tabs button {
    flex: 0 0 auto;
  }
}

:global([data-theme=dark]) .profile-hero,
:global([data-theme=dark]) .profile-card,
:global([data-theme=dark]) .metric-card,
:global([data-theme=dark]) .profile-tabs {
  background: #182233;
  border-color: #334155;
}

:global([data-theme=dark]) .metric-card strong,
:global([data-theme=dark]) :deep(.detail-item strong) {
  color: #e5e7eb;
}

:global([data-theme=dark]) .profile-table th {
  background: #111827;
}
</style>
