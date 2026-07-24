<template>
  <div class="dashboard-main-body user-management-page">
<section class="users-hero mb-24">
      <div>
        <span class="users-kicker">Account directory</span>
        <h4 class="mb-6">User management</h4>
        <p class="mb-0">Review customers and agents, check account health, and open complete profile history from one focused workspace.</p>
      </div>
      <div class="users-hero-actions">
        <button type="button" class="btn btn-light-100" :disabled="loading" @click="fetchUsers(page)">
          <iconify-icon icon="ri:refresh-line" /> Refresh
        </button>
        <button type="button" class="btn btn-outline-light" :disabled="!hasActiveFilters || loading" @click="resetFilters">
          <iconify-icon icon="ri:filter-off-line" /> Clear filters
        </button>
      </div>
    </section>

    <div class="row gy-4 mb-24">
      <div v-for="card in summaryCards" :key="card.label" class="col-sm-6 col-xl-3">
        <div class="summary-card">
          <span class="summary-icon" :class="card.color"><iconify-icon :icon="card.icon" /></span>
          <div><span class="text-secondary-light text-sm">{{ card.label }}</span><h5 class="mb-0 mt-4">{{ card.value }}</h5></div>
        </div>
      </div>
    </div>

    <div class="card radius-12 overflow-hidden">
      <div class="card-header bg-base border-bottom p-20">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h6 class="mb-4">FEETA Users</h6>
            <p class="text-secondary-light text-sm mb-0">
              Showing {{ displayStart }}-{{ endIndex }} of {{ total }} accounts
            </p>
          </div>
          <span class="result-pill">{{ filters.per_page }} per page</span>
        </div>

        <div class="filter-grid mt-20">
          <label class="search-control filter-search">
            <iconify-icon icon="ri:search-line" />
            <input v-model="filters.search" type="search" placeholder="Search name, email, phone or city" />
          </label>
          <input v-model="filters.email" class="form-control filter-input" type="search" placeholder="Email" />
          <input v-model="filters.phone" class="form-control filter-input" type="search" placeholder="Mobile" />
          <select v-model="filters.status" class="form-select filter-input">
            <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option><option value="deleted">Deleted</option>
          </select>
          <select v-model="filters.verification_status" class="form-select filter-input">
            <option value="">All verification</option><option value="pending">Pending</option><option value="submitted">Submitted</option>
            <option value="verified">Verified</option><option value="rejected">Rejected</option>
          </select>
          <select v-model="filters.role" class="form-select filter-input">
            <option value="">All roles</option><option value="user">User</option><option value="agent">Agent</option>
          </select>
          <input v-model="filters.city" class="form-control filter-input" type="search" placeholder="City" />
          <input v-model="filters.state" class="form-control filter-input" type="search" placeholder="State / address" />
          <label class="date-control"><span>Registered from</span><input v-model="filters.registration_from" class="form-control" type="date" /></label>
          <label class="date-control"><span>Registered to</span><input v-model="filters.registration_to" class="form-control" type="date" /></label>
          <select v-model.number="filters.per_page" class="form-select filter-input">
            <option v-for="size in [10, 15, 25, 50, 100]" :key="size" :value="size">{{ size }} per page</option>
          </select>
        </div>
      </div>

      <LoadingState v-if="loading && !users.length" message="Loading users..." />
      <div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="fetchUsers(page)" /></div>

      <div v-else class="card-body p-0 position-relative">
        <div v-if="loading" class="table-loading"><span class="spinner-border spinner-border-sm text-primary"></span> Refreshing users...</div>
        <div v-if="users.length" class="table-responsive">
          <table class="table user-table mb-0">
            <thead>
              <tr>
                <th>User</th>
                <th><button class="sort-button" @click="setSort('email')">Contact {{ sortIndicator('email') }}</button></th>
                <th>Role</th>
                <th><button class="sort-button" @click="setSort('chat_status')">Status {{ sortIndicator('chat_status') }}</button></th>
                <th><button class="sort-button" @click="setSort('kyc_status')">Verification {{ sortIndicator('kyc_status') }}</button></th>
                <th><button class="sort-button" @click="setSort('createdAt')">Registration {{ sortIndicator('createdAt') }}</button></th>
                <th class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="user-identity">
                    <div class="user-avatar"><img v-if="avatar(user)" :src="avatar(user)" :alt="userName(user)" /><span v-else>{{ initials(userName(user)) }}</span></div>
                    <div class="min-w-0">
                      <router-link :to="`/users/${user.id}`" class="user-link">{{ userName(user) }}</router-link>
                      <div class="text-secondary-light text-xs">#{{ user.id }} - {{ locationLabel(user) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-stack">
                    <div class="contact-cell"><span>{{ value(user.email) }}</span><CopyButton v-if="user.email" :value="user.email" label="email" /></div>
                    <small>{{ value(user.phone) }}</small>
                  </div>
                </td>
                <td><span class="role-pill">{{ roleLabel(user) }}</span></td>
                <td><StatusBadge :status="accountStatus(user)" /></td>
                <td><StatusBadge :status="verificationStatus(user)" /></td>
                <td>{{ formatDate(registrationDate(user)) }}</td>
                <td class="manage-cell">
                  <button type="button" class="manage-row-button" @click="openManage(user)"><iconify-icon icon="lucide:settings" /> Manage</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState v-else icon="ri:user-search-line" title="No users found" message="No user accounts match the current filters." />

        <div v-if="users.length" class="px-24 pb-24">
          <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="fetchUsers" />
        </div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedUser ? userName(selectedUser) : ''" :subtitle="selectedUser ? `${value(selectedUser.email)} - #${selectedUser.id}` : ''">
      <router-link v-if="selectedUser" :to="`/users/${selectedUser.id}`"><iconify-icon icon="ri:eye-line" /> View profile</router-link>
      <router-link v-if="selectedUser && roleSlug(selectedUser) === 'agent' && canAny(['agent.properties.view'])" :to="`/agents/${selectedUser.id}/properties`"><iconify-icon icon="ri:building-line" /> View properties</router-link>
      <button v-if="selectedUser && can('user.delete')" type="button" class="text-danger" :disabled="Boolean(actionId)" @click="removeUser(selectedUser)">
        <iconify-icon icon="ri:delete-bin-line" /> Delete user
      </button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CopyButton from '@/components/common/CopyButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import Pagination from '@/components/pagination/index.vue'
import userService from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import { mediaUrl } from '@/utils/mediaUrl'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const users = ref([])
const loading = ref(false)
const error = ref('')
const actionId = ref('')
const manageOpen = ref(false)
const selectedUser = ref(null)
const suppressFilterWatch = ref(false)
const page = ref(Math.max(1, Number(route.query.page) || 1))
const total = ref(0)
let searchTimer

const filters = reactive({
  search: String(route.query.search || ''), email: String(route.query.email || ''), phone: String(route.query.phone || ''),
  role: String(route.query.role || ''), status: String(route.query.status || ''), verification_status: String(route.query.verification_status || ''),
  city: String(route.query.city || ''), state: String(route.query.state || ''), registration_from: String(route.query.registration_from || ''),
  registration_to: String(route.query.registration_to || ''), sort_by: String(route.query.sort_by || 'createdAt'),
  sort_direction: String(route.query.sort_direction || 'desc'), per_page: Number(route.query.per_page) || 15,
})

const permissionAliases = {
  'user.view': ['user.view', 'users.view', 'view_users'], 'user.update': ['user.update', 'users.edit', 'manage_users'],
  'user.delete': ['user.delete', 'users.delete', 'delete_users'], 'user.status': ['user.status', 'users.edit', 'restore_users'],
}
const can = (permission) => auth.hasAnyPermission(permissionAliases[permission] || [permission])
const canAny = (permissions) => permissions.some(can)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / filters.per_page)))
const startIndex = computed(() => total.value ? (page.value - 1) * filters.per_page : 0)
const endIndex = computed(() => Math.min((page.value - 1) * filters.per_page + users.value.length, total.value))
const displayStart = computed(() => total.value ? startIndex.value + 1 : 0)
const activeOnPage = computed(() => users.value.filter((user) => accountStatus(user) === 'active').length)
const verifiedOnPage = computed(() => users.value.filter((user) => verificationStatus(user) === 'verified').length)
const blockedOnPage = computed(() => users.value.filter((user) => accountStatus(user) === 'blocked').length)
const summaryCards = computed(() => [
  { label: 'Users in result', value: total.value, icon: 'ri:group-line', color: 'bg-primary-50 text-primary-600' },
  { label: 'Active on page', value: activeOnPage.value, icon: 'ri:user-follow-line', color: 'bg-success-focus text-success-600' },
  { label: 'Verified on page', value: verifiedOnPage.value, icon: 'ri:shield-check-line', color: 'bg-info-focus text-info-600' },
  { label: 'Blocked on page', value: blockedOnPage.value, icon: 'ri:user-forbid-line', color: 'bg-danger-focus text-danger-600' },
])
const hasActiveFilters = computed(() => Object.entries(filters).some(([key, value]) => {
  const defaults = { sort_by: 'createdAt', sort_direction: 'desc', per_page: 15 }
  return String(value || '') !== String(defaults[key] ?? '')
}))

function normalize(payload) { const items = Array.isArray(payload) ? payload : payload?.data || []; return { items, total: payload?.meta?.total ?? payload?.total ?? items.length } }
function value(input) { return input === undefined || input === null || input === '' ? 'Not available' : input }
function userName(user) { return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed user' }
function initials(name) { return String(name || 'User').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U' }
function avatar(user) { return mediaUrl(user.profile?.profile_pic || user.profile_pic || '') }
function roleSlug(user) { return String(user?.role?.slug || user?.role?.name || user?.role || '').toLowerCase() }
function roleLabel(user) { return String(user?.role?.name || user?.role || 'user').replace(/[-_]/g, ' ') }
function locationLabel(user) { return [user.city || user.profile?.city, user.state || user.profile?.state].filter(Boolean).join(', ') || 'Location not set' }
function accountStatus(user) { return String(user.status || user.chat_status || (user.is_deleted ? 'deleted' : 'active')).toLowerCase() }
function verificationStatus(user) { return String(user.verification_status || user.kyc_status || (user.is_email_verified ? 'verified' : 'pending')).toLowerCase() }
function registrationDate(user) { return user.registration_date || user.createdAt || user.created_at }
function formatDate(input) { if (!input) return 'Not available'; const date = new Date(input); return Number.isNaN(date.getTime()) ? String(input) : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
function sortIndicator(column) { return filters.sort_by === column ? (filters.sort_direction === 'asc' ? 'Asc' : 'Desc') : '' }
function setSort(column) { filters.sort_direction = filters.sort_by === column && filters.sort_direction === 'asc' ? 'desc' : 'asc'; filters.sort_by = column; fetchUsers(1) }
function openManage(user) { selectedUser.value = user; manageOpen.value = true }

function syncQuery() {
  const defaults = { sort_by: 'createdAt', sort_direction: 'desc', per_page: 15 }
  const query = { page: page.value > 1 ? page.value : undefined }
  Object.entries(filters).forEach(([key, val]) => { query[key] = String(val || '') === String(defaults[key] ?? '') ? undefined : (val || undefined) })
  router.replace({ query })
}

async function fetchUsers(nextPage = 1) {
  if (loading.value) return
  loading.value = true; error.value = ''; page.value = nextPage
  try { const payload = normalize(await userService.getUsers({ ...filters, page: nextPage })); users.value = payload.items; total.value = payload.total; syncQuery() }
  catch (err) { if (!users.value.length) { users.value = []; total.value = 0 }; error.value = err.message }
  finally { loading.value = false }
}

async function removeUser(user) {
  if (actionId.value) return
  manageOpen.value = false
  const result = await Swal.fire({ title: 'Delete user?', text: `${userName(user)} will be soft-deleted. Related chats, favourites, enquiries, notifications and payments remain preserved.`, input: 'textarea', inputLabel: 'Reason', inputPlaceholder: 'Optional deletion reason', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete user', confirmButtonColor: '#dc2626' })
  if (!result.isConfirmed) return
  actionId.value = `delete-${user.id}`
  try { await userService.deleteUser(user.id, { reason: result.value?.trim() || undefined }); await Swal.fire({ icon: 'success', title: 'User deleted', timer: 1200, showConfirmButton: false }); await fetchUsers(users.value.length === 1 && page.value > 1 ? page.value - 1 : page.value) }
  catch (err) { await Swal.fire({ icon: 'error', title: 'Delete failed', text: err.message }) }
  finally { actionId.value = '' }
}

async function resetFilters() {
  suppressFilterWatch.value = true
  window.clearTimeout(searchTimer)
  Object.assign(filters, { search: '', email: '', phone: '', role: '', status: '', verification_status: '', city: '', state: '', registration_from: '', registration_to: '', sort_by: 'createdAt', sort_direction: 'desc', per_page: 15 })
  try { await fetchUsers(1) } finally { suppressFilterWatch.value = false }
}

watch(() => [filters.search, filters.email, filters.phone, filters.city, filters.state, filters.registration_from, filters.registration_to], () => { if (suppressFilterWatch.value) return; window.clearTimeout(searchTimer); searchTimer = window.setTimeout(() => fetchUsers(1), 450) })
watch(() => [filters.role, filters.status, filters.verification_status, filters.per_page], () => { if (!suppressFilterWatch.value) fetchUsers(1) })
watch(() => route.query.search, (value) => { const next = String(value || ''); if (next !== filters.search) filters.search = next })
onMounted(() => fetchUsers(page.value))
onBeforeUnmount(() => window.clearTimeout(searchTimer))
</script>

<style scoped>
.user-management-page {
  max-width: 100%;
  overflow-x: hidden;
}

.users-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
  border: 1px solid #dbe5f1;
  border-radius: 12px;
  background: #12263f;
  color: #fff;
}

.users-kicker {
  display: inline-block;
  margin-bottom: 8px;
  color: #a7f3d0;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.users-hero h4 {
  color: #fff;
}

.users-hero p {
  max-width: 760px;
  color: rgba(255,255,255,.76);
}

.users-hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.summary-card {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e5edf6;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.03);
}

.summary-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  flex: 0 0 46px;
  border-radius: 12px;
  font-size: 22px;
}

.result-pill,
.role-pill,
.id-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}

.filter-search {
  grid-column: span 2;
}

.search-control {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid #d9e0ea;
  border-radius: 10px;
  background: #fff;
}

.search-control input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
}

.filter-input,
.date-control .form-control {
  min-width: 0;
  min-height: 44px;
  border-radius: 10px;
}

.date-control {
  min-width: 0;
}

.date-control span {
  display: block;
  margin-bottom: 5px;
  color: #64748b;
  font-size: 11px;
}

.table-loading {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #dbe7ff;
  border-radius: 10px;
  background: #f4f8ff;
  color: #315ed1;
  font-size: 12px;
}

.user-table {
  min-width: 1120px;
}

.user-table th {
  padding: 13px 15px;
  color: #64748b;
  font-size: 11px;
  text-transform: uppercase;
  background: #f8fafc;
  white-space: nowrap;
}

.user-table td {
  padding: 13px 15px;
  vertical-align: middle;
  border-color: #eef2f7;
}

.user-table tbody tr {
  transition: background .15s ease;
}

.user-table tbody tr:hover {
  background: #f8fbff;
}

.sort-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-transform: inherit;
  white-space: nowrap;
}

.user-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 230px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  overflow: hidden;
  flex: 0 0 42px;
  border-radius: 12px;
  color: #fff;
  background: #315ed1;
  font-weight: 700;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-link {
  display: inline-block;
  color: #1d4ed8;
  font-weight: 700;
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}

.contact-stack {
  display: grid;
  gap: 3px;
  min-width: 220px;
}

.contact-stack small {
  color: #64748b;
}

.contact-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.contact-cell span {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1199px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .users-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .users-hero-actions,
  .users-hero-actions .btn {
    width: 100%;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-search {
    grid-column: auto;
  }
}

:global([data-theme=dark]) .summary-card,
:global([data-theme=dark]) .search-control {
  background: #182233;
  border-color: #334155;
}

:global([data-theme=dark]) .user-table th {
  background: #111827;
}

:global([data-theme=dark]) .user-table td {
  border-color: #263244;
}
</style>
