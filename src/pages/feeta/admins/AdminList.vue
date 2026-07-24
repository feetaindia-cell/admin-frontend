<template>
  <div class="dashboard-main-body admin-list-page">
    <section class="admin-hero" aria-labelledby="admin-list-title">
      <div class="admin-hero__title">
        <span class="admin-hero__icon" aria-hidden="true">
          <iconify-icon icon="ri:shield-user-line"></iconify-icon>
        </span>
        <div>
          <h1 id="admin-list-title">Admin Management</h1>
          <p>Manage administrators, permissions, access levels and system security from one place.</p>
        </div>
      </div>
      <div class="admin-hero-art" aria-hidden="true">
        <span class="admin-hero-art__orb admin-hero-art__orb--one"></span>
        <span class="admin-hero-art__orb admin-hero-art__orb--two"></span>
        <div class="admin-hero-art__shield">
          <iconify-icon icon="ri:shield-star-line"></iconify-icon>
        </div>
        <div class="admin-hero-art__users">
          <span><iconify-icon icon="ri:user-3-line"></iconify-icon></span>
          <span><iconify-icon icon="ri:user-settings-line"></iconify-icon></span>
          <span><iconify-icon icon="ri:user-star-line"></iconify-icon></span>
        </div>
        <i class="admin-hero-art__sparkle admin-hero-art__sparkle--one"></i>
        <i class="admin-hero-art__sparkle admin-hero-art__sparkle--two"></i>
      </div>
</section>

    <div v-if="error" class="admin-alert" role="alert">
      <iconify-icon icon="ri:error-warning-line"></iconify-icon>
      {{ error }}
    </div>

    <section class="admin-stat-grid" aria-label="Admin summary">
      <article v-for="stat in adminStats" :key="stat.label" class="admin-stat-card">
        <span :class="['admin-stat-card__icon', stat.tone]" aria-hidden="true">
          <iconify-icon :icon="stat.icon"></iconify-icon>
        </span>
        <div>
          <strong>{{ stat.value }}</strong>
          <h2>{{ stat.label }}</h2>
          <p>{{ stat.caption }}</p>
        </div>
      </article>
    </section>

    <section class="admin-toolbar-card" aria-label="Admin filters">
      <div class="admin-toolbar">
        <form class="admin-search" role="search" @submit.prevent>
          <iconify-icon icon="ri:search-line" aria-hidden="true"></iconify-icon>
          <input v-model="filters.search" type="search" placeholder="Search administrators..." aria-label="Search administrators" />
          <button v-if="filters.search" type="button" class="admin-search__clear" aria-label="Clear search" @click="clearFilter('search')">
            <iconify-icon icon="ri:close-line"></iconify-icon>
          </button>
        </form>

        <label class="admin-control">
          <span><iconify-icon icon="ri:pulse-line"></iconify-icon> Status</span>
          <select v-model="filters.status" class="form-select" aria-label="Filter by status" @change="setPage(1)">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <label v-if="roles.length" class="admin-control">
          <span><iconify-icon icon="ri:shield-keyhole-line"></iconify-icon> Role</span>
          <select v-model="filters.role_id" class="form-select" aria-label="Filter by role" @change="setPage(1)">
            <option value="">All roles</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
        </label>

        <router-link v-if="auth.hasPermission('admin.create')" to="/admins/create" class="admin-add-btn" aria-label="Add new admin">
          <iconify-icon icon="ri:add-line"></iconify-icon>
          Add New Admin
        </router-link>
      </div>
      <div v-if="loading" class="admin-toolbar-skeleton" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div v-if="activeFilterChips.length" class="admin-filter-chips">
        <div class="admin-filter-chips__list">
          <span class="admin-filter-chips__label">Filters ({{ activeFilterChips.length }})</span>
          <button v-for="chip in activeFilterChips" :key="chip.key" type="button" class="admin-filter-chip" @click="clearFilter(chip.key)">
            <iconify-icon :icon="chip.icon" aria-hidden="true"></iconify-icon>
            {{ chip.label }}
            <iconify-icon icon="ri:close-line" aria-hidden="true"></iconify-icon>
          </button>
        </div>
        <button type="button" class="admin-clear-filters" @click="clearAllFilters">Clear all filters</button>
      </div>
    </section>

    <section class="admin-data-card">
      <LoadingState v-if="loading" message="Loading admins..." :rows="6" />

      <template v-else>
        <div v-if="admins.length" class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th scope="col">S.L</th>
                <th scope="col">Admin</th>
                <th scope="col">Phone</th>
                <th scope="col">Role</th>
                <th scope="col" class="text-center">Status</th>
                <th scope="col" class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(admin, index) in admins" :key="admin.id" class="manage-row">
                <td class="admin-index">{{ startIndex + index + 1 }}</td>
                <td>
                  <div class="admin-identity">
                    <span class="admin-avatar">
                      {{ getInitials(admin) }}
                      <i :class="['admin-avatar__status', statusMeta(admin.status).class]"></i>
                    </span>
                    <span>
                      <strong>{{ admin.name || 'Unnamed Admin' }}</strong>
                      <small>{{ admin.email || 'No email available' }}</small>
                      <em>{{ adminRole(admin) }}</em>
                    </span>
                  </div>
                </td>
                <td>
                  <span class="admin-phone">
                    <iconify-icon icon="ri:phone-line"></iconify-icon>
                    {{ admin.phone || '-' }}
                  </span>
                </td>
                <td>
                  <span :class="['admin-role-badge', roleBadgeClass(adminRole(admin))]">
                    <iconify-icon :icon="roleIcon(adminRole(admin))"></iconify-icon>
                    {{ adminRole(admin) }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="['admin-status-pill', statusMeta(admin.status).class]">
                    <iconify-icon :icon="statusMeta(admin.status).icon"></iconify-icon>
                    {{ statusMeta(admin.status).label }}
                  </span>
                </td>
                <td class="manage-cell">
                  <button type="button" class="manage-row-button" @click="openManage(admin)"><iconify-icon icon="lucide:settings" /> Manage</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="admin-mobile-list">
            <article v-for="admin in admins" :key="`mobile-${admin.id}`" class="admin-mobile-card" title="Manage" @click="openManage(admin)">
              <div class="admin-mobile-card__head">
                <div class="admin-identity">
                  <span class="admin-avatar">
                    {{ getInitials(admin) }}
                    <i :class="['admin-avatar__status', statusMeta(admin.status).class]"></i>
                  </span>
                  <span>
                    <strong>{{ admin.name || 'Unnamed Admin' }}</strong>
                    <small>{{ admin.email || 'No email available' }}</small>
                    <em>{{ adminRole(admin) }}</em>
                  </span>
                </div>
                <span :class="['admin-status-pill', statusMeta(admin.status).class]">
                  <iconify-icon :icon="statusMeta(admin.status).icon"></iconify-icon>
                  {{ statusMeta(admin.status).label }}
                </span>
              </div>
              <div class="admin-mobile-card__meta">
                <span :class="['admin-role-badge', roleBadgeClass(adminRole(admin))]">
                  <iconify-icon :icon="roleIcon(adminRole(admin))"></iconify-icon>
                  {{ adminRole(admin) }}
                </span>
                <span class="admin-phone">
                  <iconify-icon icon="ri:phone-line"></iconify-icon>
                  {{ admin.phone || '-' }}
                </span>
              </div>
            </article>
          </div>
        </div>

        <EmptyState
          v-else
          icon="ri:shield-user-line"
          title="No administrators found"
          message="Create your first administrator."
          :action-label="auth.hasPermission('admin.create') ? 'Create Admin' : ''"
          :action-to="auth.hasPermission('admin.create') ? '/admins/create' : ''"
          action-icon="ri:add-line"
        />

        <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="setPage" />
      </template>
    </section>
    <RowManageDialog v-model="manageOpen" :title="selectedAdmin?.name || 'Unnamed Admin'" :subtitle="selectedAdmin ? selectedAdmin.email || `#${selectedAdmin.id}` : ''">
      <router-link v-if="selectedAdmin" :to="`/admins/${selectedAdmin.id}`"><iconify-icon icon="majesticons:eye-line" /> View details</router-link>
      <router-link v-if="selectedAdmin && auth.hasPermission('admin.update')" :to="`/admins/${selectedAdmin.id}/edit`"><iconify-icon icon="ri:edit-line" /> Edit admin</router-link>
      <button v-if="selectedAdmin && auth.hasPermission('admin.delete') && !isSelf(selectedAdmin)" type="button" class="text-danger" :disabled="actionId === selectedAdmin.id" @click="deleteAdmin(selectedAdmin)"><iconify-icon icon="ri:delete-bin-line" /> Delete admin</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import Pagination from '@/components/pagination/index.vue'
import adminService from '@/services/adminService'
import roleService from '@/services/roleService'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const allAdmins = ref([])
const roles = ref([])
const loading = ref(false)
const error = ref('')
const actionId = ref(null)
const manageOpen = ref(false)
const selectedAdmin = ref(null)
const page = ref(1)
const perPage = 10
const allAdminsRequestLimit = 1000
const filters = reactive({ search: String(route.query.search || ''), status: '', role_id: '' })

const filteredAdmins = computed(() => {
  const search = filters.search.trim().toLowerCase()
  const status = String(filters.status || '').toLowerCase()
  const roleId = String(filters.role_id || '')

  return allAdmins.value.filter((admin) => {
    const searchable = [
      admin.name,
      admin.email,
      admin.phone,
      adminRole(admin),
    ].filter(Boolean).join(' ').toLowerCase()

    const matchesSearch = !search || searchable.includes(search)
    const matchesStatus = !status || String(admin.status || '').toLowerCase() === status
    const matchesRole = !roleId || String(admin.role?.id ?? admin.role_id ?? '') === roleId

    return matchesSearch && matchesStatus && matchesRole
  })
})
const total = computed(() => filteredAdmins.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))
const startIndex = computed(() => total.value ? (page.value - 1) * perPage : 0)
const admins = computed(() => filteredAdmins.value.slice(startIndex.value, startIndex.value + perPage))
const endIndex = computed(() => Math.min(startIndex.value + admins.value.length, total.value))
const activeAdmins = computed(() => allAdmins.value.filter((admin) => String(admin.status || '').toLowerCase() === 'active').length)
const superAdmins = computed(() => allAdmins.value.filter((admin) => String(adminRole(admin)).toLowerCase().includes('super')).length)
const adminStats = computed(() => [
  { label: 'Total Admins', value: allAdmins.value.length, caption: 'All registered administrators', icon: 'ri:user-3-line', tone: 'is-blue' },
  { label: 'Active', value: activeAdmins.value, caption: 'Currently active administrators', icon: 'ri:checkbox-circle-line', tone: 'is-green' },
  { label: 'Roles', value: roles.value.length, caption: 'Permission groups', icon: 'ri:shield-keyhole-line', tone: 'is-indigo' },
  { label: 'Super Admin', value: superAdmins.value, caption: 'Full access administrators', icon: 'ri:vip-crown-line', tone: 'is-orange' },
])
const activeFilterChips = computed(() => {
  const chips = []
  if (filters.search) chips.push({ key: 'search', icon: 'ri:search-line', label: `Search: ${filters.search}` })
  if (filters.status) chips.push({ key: 'status', icon: 'ri:pulse-line', label: `Status: ${statusMeta(filters.status).label}` })
  if (filters.role_id) chips.push({ key: 'role_id', icon: 'ri:shield-keyhole-line', label: `Role: ${selectedRoleName(filters.role_id)}` })
  return chips
})

function normalize(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || []
  return { items, total: payload?.meta?.total ?? payload?.total ?? items.length }
}

function setPage(nextPage = 1) {
  page.value = Math.min(Math.max(Number(nextPage) || 1, 1), totalPages.value)
}

async function fetchAdmins() {
  loading.value = true
  error.value = ''
  try {
    const payload = normalize(await adminService.list({ per_page: allAdminsRequestLimit }))
    allAdmins.value = payload.items
    setPage(1)
  } catch (err) {
    allAdmins.value = []
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  try {
    const payload = normalize(await roleService.list())
    roles.value = payload.items.filter((role) => Number(role.status) === 1)
  } catch {
    roles.value = []
  }
}

function isSelf(admin) {
  return Number(admin.id) === Number(auth.admin?.id)
}

function adminRole(admin) {
  return admin.role?.name || admin.role_name || '-'
}

function getInitials(admin) {
  const source = String(admin.name || admin.email || 'Admin').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

function roleBadgeClass(roleName) {
  const role = String(roleName).toLowerCase()
  if (role.includes('super')) return 'is-super'
  if (role.includes('system')) return 'is-system'
  if (role.includes('property')) return 'is-property'
  if (role.includes('faq')) return 'is-faq'
  return 'is-default'
}

function roleIcon(roleName) {
  const role = String(roleName).toLowerCase()
  if (role.includes('super')) return 'ri:vip-crown-line'
  if (role.includes('system')) return 'ri:settings-3-line'
  if (role.includes('property')) return 'ri:building-4-line'
  if (role.includes('faq')) return 'ri:questionnaire-line'
  return 'ri:shield-keyhole-line'
}

function statusMeta(status) {
  const value = String(status || 'unknown').toLowerCase()
  if (value === 'active') return { label: 'Active', icon: 'ri:check-line', class: 'is-active' }
  if (value === 'suspended') return { label: 'Suspended', icon: 'ri:forbid-2-line', class: 'is-suspended' }
  if (value === 'inactive') return { label: 'Inactive', icon: 'ri:pause-line', class: 'is-inactive' }
  return { label: value || 'Unknown', icon: 'ri:question-line', class: 'is-inactive' }
}

function selectedRoleName(roleId) {
  return roles.value.find((role) => String(role.id) === String(roleId))?.name || 'Selected role'
}

function clearFilter(key) {
  filters[key] = ''
  setPage(1)
}

function clearAllFilters() {
  filters.search = ''
  filters.status = ''
  filters.role_id = ''
  setPage(1)
}

function openManage(admin) {
  selectedAdmin.value = admin
  manageOpen.value = true
}

async function deleteAdmin(admin) {
  if (actionId.value) return
  const result = await Swal.fire({ title: 'Delete admin?', text: `${admin.name} will be status-deleted and active sessions may be revoked.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' })
  if (!result.isConfirmed) return
  actionId.value = admin.id
  try {
    await adminService.remove(admin.id)
    await Swal.fire({ icon: 'success', title: 'Admin deleted', timer: 1200, showConfirmButton: false })
    await fetchAdmins()
  } catch (err) {
    await Swal.fire('Delete failed', err.message, 'error')
  } finally {
    actionId.value = null
  }
}

watch(() => filters.search, () => setPage(1))
watch(() => route.query.search, (value) => {
  const nextSearch = String(value || '')
  if (nextSearch !== filters.search) filters.search = nextSearch
})
onMounted(() => {
  fetchAdmins()
  loadRoles()
})
</script>

<style scoped>
.admin-list-page {
  --admin-primary: #487fff;
  --admin-primary-dark: #2f65e9;
  --admin-bg: #f6f8fc;
  --admin-text: #111827;
  --admin-muted: #64748b;
  --admin-border: rgba(148, 163, 184, .2);
  --admin-shadow: 0 18px 48px rgba(15, 23, 42, .075);
  background: var(--admin-bg);
}

.admin-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.admin-hero__title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-hero__icon {
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 56px;
  border: 1px solid rgba(72, 127, 255, .16);
  border-radius: 18px;
  color: var(--admin-primary);
  background: linear-gradient(145deg, #ffffff, #eef4ff);
  box-shadow: 0 12px 28px rgba(72, 127, 255, .13);
}

.admin-hero__icon iconify-icon { font-size: 28px; }
.admin-hero h1 {
  margin: 0;
  color: var(--admin-text);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: 0;
}

.admin-hero p {
  margin: 7px 0 0;
  color: var(--admin-muted);
  font-size: 15px;
}
.admin-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #fecdd3;
  border-radius: 14px;
  color: #b91c1c;
  background: #fff1f2;
  font-size: 14px;
  font-weight: 600;
}

.admin-toolbar-card,
.admin-data-card {
  border: 1px solid var(--admin-border);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--admin-shadow);
}

.admin-toolbar-card {
  position: relative;
  margin-bottom: 20px;
  padding: 18px;
}

.admin-toolbar {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 14px;
}

.admin-control {
  display: flex;
  flex: 0 1 168px;
  flex-direction: column;
  gap: 7px;
  min-width: 148px;
  margin: 0;
}

.admin-control--entries { flex-basis: 142px; min-width: 132px; }
.admin-control span {
  color: #475569;
  font-size: 13px;
  font-weight: 650;
}

.admin-control .form-select {
  min-height: 48px;
  border-color: #e2e8f0;
  border-radius: 14px;
  color: #334155;
  background-color: #fff;
  font-size: 14px;
}

.admin-search {
  position: relative;
  flex: 2 1 340px;
  min-width: 280px;
}

.admin-search iconify-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  color: #94a3b8;
  font-size: 18px;
  transform: translateY(-50%);
}

.admin-search input {
  width: 100%;
  min-height: 48px;
  padding: 0 18px 0 46px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  color: #1f2937;
  background: #fff;
  font-size: 14px;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.admin-search input:focus {
  border-color: rgba(72, 127, 255, .7);
  box-shadow: 0 0 0 4px rgba(72, 127, 255, .14);
  outline: 0;
}

.admin-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 48px;
  margin-left: auto;
  padding: 0 20px;
  border: 0;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark));
  box-shadow: 0 12px 26px rgba(72, 127, 255, .28);
  font-size: 14px;
  font-weight: 700;
  transition: transform .18s ease, box-shadow .18s ease;
}

.admin-add-btn:hover {
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(72, 127, 255, .34);
}

.admin-toolbar-skeleton {
  display: grid;
  grid-template-columns: 140px minmax(240px, 1fr) 160px 160px;
  gap: 14px;
  margin-top: 16px;
}

.admin-toolbar-skeleton span,
.admin-data-card :deep(.skeleton) {
  background: linear-gradient(90deg, #edf1f7 20%, #f8fafc 45%, #e8eef6 70%);
  background-size: 240% 100%;
  animation: admin-shimmer 1.25s ease-in-out infinite;
}

.admin-toolbar-skeleton span {
  height: 12px;
  border-radius: 999px;
}

.admin-data-card {
  padding: 8px;
}

.admin-table-wrap {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
}

.admin-table {
  width: 100%;
  min-width: 880px;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgba(226, 232, 240, .9);
  border-radius: 14px;
  background: #fff;
}

.admin-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 16px 18px;
  border-bottom: 1px solid #e8edf4;
  color: #334155;
  background: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.admin-table tbody td {
  padding: 18px;
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
}

.admin-table tbody tr {
  transition: background-color .18s ease, transform .18s ease;
}

.admin-table tbody tr:hover { background: rgba(72, 127, 255, .055); }
.admin-table tbody tr:last-child td { border-bottom: 0; }
.admin-index {
  color: #64748b;
  font-weight: 700;
}

.admin-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.admin-avatar {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  border: 1px solid rgba(72, 127, 255, .18);
  border-radius: 50%;
  color: #2854bf;
  background: linear-gradient(145deg, #eef4ff, #ffffff);
  font-size: 13px;
  font-weight: 800;
}

.admin-identity strong {
  display: block;
  color: #111827;
  font-size: 14px;
  font-weight: 700;
}

.admin-identity small {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 13px;
}

.admin-phone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  white-space: nowrap;
}

.admin-phone iconify-icon { color: #94a3b8; font-size: 17px; }

.admin-role-badge,
.admin-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 6px 11px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.admin-role-badge iconify-icon,
.admin-status-pill iconify-icon { font-size: 15px; }
.admin-role-badge.is-super { color: #b45309; background: #fff7ed; border-color: #fed7aa; }
.admin-role-badge.is-system { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
.admin-role-badge.is-property { color: #4338ca; background: #eef2ff; border-color: #c7d2fe; }
.admin-role-badge.is-faq { color: #7e22ce; background: #faf5ff; border-color: #e9d5ff; }
.admin-role-badge.is-default { color: #475569; background: #f8fafc; border-color: #e2e8f0; }
.admin-status-pill.is-active { color: #15803d; background: #ecfdf3; border-color: #bbf7d0; }
.admin-status-pill.is-inactive { color: #475569; background: #f1f5f9; border-color: #cbd5e1; }
.admin-status-pill.is-suspended { color: #b91c1c; background: #fff1f2; border-color: #fecdd3; }

.admin-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.admin-action-btn {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 50%;
  background: #fff;
  font-size: 18px;
  transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease;
}

.admin-action-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 10px 20px rgba(15, 23, 42, .1);
}

.admin-action-btn:disabled {
  cursor: not-allowed;
  opacity: .62;
  transform: none;
}

.admin-action-btn.is-view { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }
.admin-action-btn.is-edit { color: #16a34a; background: #f0fdf4; border-color: #dcfce7; }
.admin-action-btn.is-delete { color: #dc2626; background: #fef2f2; border-color: #fee2e2; }
.admin-action-btn.is-more { color: #475569; background: #f8fafc; border-color: #e2e8f0; }
.admin-action-menu { min-width: 172px; padding: 8px; }
.admin-action-menu .dropdown-item {
  min-height: 38px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
}

.admin-mobile-list { display: none; }

.admin-mobile-card {
  border: 1px solid #e8edf4;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, .055);
  transition: transform .18s ease, box-shadow .18s ease;
}

.admin-mobile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, .08);
}

.admin-mobile-card__head,
.admin-mobile-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.admin-mobile-card__head {
  padding: 16px;
  border-bottom: 1px solid #eef2f7;
}

.admin-mobile-card__meta {
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 14px 16px;
}

.admin-actions--mobile {
  justify-content: flex-start;
  padding: 0 16px 16px;
}

.admin-data-card :deep(.loading-state) {
  margin: 10px;
  border-radius: 16px;
  box-shadow: none;
}

.admin-data-card :deep(.empty-state) {
  margin: 10px;
  border-radius: 16px;
}

.admin-data-card :deep(.pagination) .page-link {
  min-width: 36px;
  min-height: 36px;
  border: 1px solid #e2e8f0 !important;
  border-radius: 11px !important;
  background: #fff !important;
  color: #475569 !important;
  box-shadow: 0 4px 10px rgba(15, 23, 42, .04);
}

.admin-data-card :deep(.pagination) .bg-primary-600 {
  border-color: transparent !important;
  color: #fff !important;
  background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark)) !important;
  box-shadow: 0 10px 20px rgba(72, 127, 255, .24);
}

@keyframes admin-shimmer {
  to { background-position: -240% 0; }
}

@media (max-width: 1199px) {
  .admin-add-btn { margin-left: 0; }
}

@media (max-width: 991px) {
  .admin-hero {
    align-items: flex-start;
    flex-direction: column;
  }
.admin-toolbar > * { flex: 1 1 220px; }
  .admin-search { min-width: 220px; }
  .admin-add-btn { flex: 1 1 220px; }
}

@media (max-width: 767px) {
  .admin-list-page { padding-top: 4px; }
  .admin-hero h1 { font-size: 22px; }
  .admin-hero__icon {
    width: 50px;
    height: 50px;
    flex-basis: 50px;
    border-radius: 16px;
  }

  .admin-toolbar-card { padding: 14px; }
  .admin-toolbar > *,
  .admin-search,
  .admin-add-btn {
    width: 100%;
    min-width: 0;
    flex: 1 1 100%;
  }

  .admin-toolbar-skeleton { grid-template-columns: 1fr; }
  .admin-data-card { padding: 10px; }
  .admin-table { display: none; }
  .admin-mobile-list {
    display: grid;
    gap: 12px;
  }

  .admin-mobile-card__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-identity small {
    max-width: 230px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* Premium Admin Management redesign */
.admin-list-page {
  --admin-primary: #2563eb;
  --admin-primary-dark: #4f46e5;
  --admin-secondary: #7c3aed;
  --admin-bg: #f8fafc;
  --admin-text: #0f172a;
  --admin-muted: #64748b;
  --admin-border: rgba(148, 163, 184, .22);
  --admin-glass: rgba(255, 255, 255, .78);
  --admin-shadow: 0 20px 60px rgba(15, 23, 42, .08);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(circle at 8% 10%, rgba(37, 99, 235, .14), transparent 28%),
    radial-gradient(circle at 88% 4%, rgba(124, 58, 237, .12), transparent 30%),
    linear-gradient(180deg, #f8faff 0%, #f4f8fd 100%);
}

.admin-list-page::before,
.admin-list-page::after {
  position: absolute;
  z-index: -1;
  content: "";
  pointer-events: none;
}

.admin-list-page::before {
  inset: 0;
  opacity: .3;
  background-image:
    linear-gradient(rgba(15, 23, 42, .035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, .035) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, .8), transparent 70%);
}

.admin-list-page::after {
  width: 360px;
  height: 360px;
  right: -120px;
  top: 220px;
  border-radius: 999px;
  background: rgba(79, 70, 229, .1);
  filter: blur(48px);
}

.admin-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 340px) auto;
  align-items: center;
  gap: 22px;
  min-height: 172px;
  margin-bottom: 18px;
  padding: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .74);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .86), rgba(255, 255, 255, .62)),
    radial-gradient(circle at 78% 18%, rgba(37, 99, 235, .16), transparent 34%);
  box-shadow: var(--admin-shadow);
  backdrop-filter: blur(18px);
  animation: admin-fade-up .28s ease both;
}

.admin-hero__title {
  align-items: center;
  gap: 16px;
}

.admin-hero__icon {
  width: 58px;
  height: 58px;
  flex-basis: 58px;
  border-color: rgba(37, 99, 235, .2);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(255, 255, 255, .96), rgba(219, 234, 254, .82));
  box-shadow: 0 20px 44px rgba(37, 99, 235, .18), inset 0 1px 0 rgba(255, 255, 255, .9);
}

.admin-hero__icon iconify-icon { font-size: 28px; }

.admin-hero h1 {
  font-size: 32px;
  line-height: 1.16;
  font-weight: 780;
  letter-spacing: 0;
}

.admin-hero p {
  max-width: 620px;
  margin-top: 8px;
  font-size: 15px;
  line-height: 1.55;
}

.admin-hero-art {
  position: relative;
  min-height: 126px;
}

.admin-hero-art__orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(.1px);
}

.admin-hero-art__orb--one {
  width: 142px;
  height: 142px;
  right: 70px;
  top: -8px;
  background: linear-gradient(135deg, rgba(37, 99, 235, .92), rgba(124, 58, 237, .78));
  box-shadow: 0 30px 70px rgba(37, 99, 235, .24);
}

.admin-hero-art__orb--two {
  width: 84px;
  height: 84px;
  right: 14px;
  bottom: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, .92), rgba(219, 234, 254, .74));
  border: 1px solid rgba(255, 255, 255, .8);
}

.admin-hero-art__shield {
  position: absolute;
  right: 112px;
  top: 24px;
  width: 76px;
  height: 76px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .48);
  border-radius: 24px;
  color: #fff;
  background: rgba(255, 255, 255, .16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .35);
  backdrop-filter: blur(10px);
}

.admin-hero-art__shield iconify-icon { font-size: 42px; }

.admin-hero-art__users {
  position: absolute;
  right: 8px;
  bottom: 16px;
  display: flex;
  align-items: center;
}

.admin-hero-art__users span {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: -10px;
  border: 2px solid rgba(255, 255, 255, .86);
  border-radius: 50%;
  color: #2563eb;
  background: rgba(255, 255, 255, .84);
  box-shadow: 0 12px 26px rgba(15, 23, 42, .12);
}

.admin-hero-art__sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #f59e0b;
  box-shadow: 0 0 0 6px rgba(245, 158, 11, .14);
}

.admin-hero-art__sparkle--one { top: 14px; right: 52px; }
.admin-hero-art__sparkle--two { right: 212px; bottom: 20px; background: #22c55e; box-shadow: 0 0 0 6px rgba(34, 197, 94, .12); }
.admin-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.admin-stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 104px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, .78);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, .82), rgba(255, 255, 255, .58));
  box-shadow: 0 18px 45px rgba(15, 23, 42, .06);
  backdrop-filter: blur(16px);
  transition: transform .22s ease, box-shadow .22s ease;
  animation: admin-fade-up .32s ease both;
}

.admin-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 80px rgba(37, 99, 235, .12);
}

.admin-stat-card__icon {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 46px;
  border-radius: 16px;
  font-size: 22px;
}

.admin-stat-card__icon.is-blue { color: #2563eb; background: #eff6ff; }
.admin-stat-card__icon.is-green { color: #16a34a; background: #ecfdf3; }
.admin-stat-card__icon.is-indigo { color: #4f46e5; background: #eef2ff; }
.admin-stat-card__icon.is-orange { color: #d97706; background: #fff7ed; }

.admin-stat-card strong {
  display: block;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.1;
  font-weight: 800;
}

.admin-stat-card h2 {
  margin: 4px 0 0;
  color: #1e293b;
  font-size: 14px;
  line-height: 1.25;
  font-weight: 760;
}

.admin-stat-card p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
}

.admin-toolbar-card,
.admin-data-card {
  border-color: rgba(255, 255, 255, .78);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, .86), rgba(255, 255, 255, .68));
  box-shadow: var(--admin-shadow);
  backdrop-filter: blur(18px);
}

.admin-toolbar-card {
  padding: 24px;
}

.admin-toolbar {
  gap: 16px;
}

.admin-control span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 750;
}

.admin-control .form-select,
.admin-search input {
  min-height: 50px;
  border-color: rgba(203, 213, 225, .72);
  border-radius: 16px;
  background-color: rgba(248, 250, 252, .74);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .72);
}

.admin-control .form-select:hover,
.admin-search input:hover {
  border-color: rgba(37, 99, 235, .28);
}

.admin-control .form-select:focus,
.admin-search input:focus {
  border-color: rgba(37, 99, 235, .62);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, .12);
}

.admin-search input { padding-right: 44px; }

.admin-search__clear {
  position: absolute;
  right: 9px;
  top: 50%;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #64748b;
  background: rgba(226, 232, 240, .6);
  transform: translateY(-50%);
  transition: background-color .18s ease, transform .18s ease;
}

.admin-search__clear:hover {
  color: #2563eb;
  background: #dbeafe;
  transform: translateY(-50%) scale(1.04);
}

.admin-add-btn {
  min-height: 50px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  box-shadow: 0 18px 38px rgba(37, 99, 235, .26);
}

.admin-filter-chips {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, .72);
}

.admin-filter-chips__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}

.admin-filter-chips__label {
  color: #64748b;
  font-size: 13px;
  font-weight: 760;
}

.admin-filter-chip {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #1d4ed8;
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  font-size: 13px;
  font-weight: 700;
  transition: transform .18s ease, box-shadow .18s ease;
}

.admin-filter-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(37, 99, 235, .1);
}

.admin-clear-filters {
  border: 0;
  color: #2563eb;
  background: transparent;
  font-size: 13px;
  font-weight: 760;
}

.admin-table-wrap {
  padding: 4px;
}

.admin-table {
  overflow: hidden;
  border-color: rgba(226, 232, 240, .74);
  border-radius: 20px;
  background: rgba(255, 255, 255, .84);
}

.admin-table thead th {
  padding: 16px 20px;
  border-bottom: 0;
  color: #475569;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, .94), rgba(241, 245, 249, .84)),
    linear-gradient(90deg, #2563eb, #7c3aed);
  box-shadow: inset 0 -2px 0 rgba(37, 99, 235, .12);
  font-size: 14px;
  font-weight: 800;
}

.admin-table tbody td {
  height: 84px;
  padding: 16px 20px;
}

.admin-table tbody tr {
  transition: background-color .22s ease, box-shadow .22s ease, transform .22s ease;
}

.admin-table tbody tr:hover {
  position: relative;
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 18px 44px rgba(37, 99, 235, .08);
  transform: translateY(-1px);
}

.admin-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  flex-basis: 48px;
  border: 2px solid rgba(255, 255, 255, .82);
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 14px 28px rgba(37, 99, 235, .18);
}

.admin-avatar__status {
  position: absolute;
  right: -1px;
  bottom: 1px;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: #94a3b8;
}

.admin-avatar__status.is-active { background: #22c55e; }
.admin-avatar__status.is-suspended { background: #ef4444; }

.admin-identity strong {
  font-size: 15px;
  font-weight: 780;
}

.admin-identity em {
  display: block;
  margin-top: 3px;
  color: #94a3b8;
  font-size: 12px;
  font-style: normal;
  font-weight: 650;
}

.admin-phone iconify-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #2563eb;
  background: #eff6ff;
}

.admin-role-badge,
.admin-status-pill {
  min-height: 34px;
  padding: 7px 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7);
}

.admin-status-pill.is-active {
  position: relative;
  padding-left: 13px;
}

.admin-status-pill.is-active::before {
  width: 8px;
  height: 8px;
  content: "";
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 rgba(34, 197, 94, .45);
  animation: admin-pulse 1.6s infinite;
}

.admin-action-btn {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, .76);
  backdrop-filter: blur(10px);
}

.admin-data-card :deep(.pagination) .page-link {
  min-width: 38px;
  min-height: 38px;
  border-radius: 999px !important;
  transition: transform .18s ease, box-shadow .18s ease;
}

.admin-data-card :deep(.pagination) .page-link:hover {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 10px 22px rgba(37, 99, 235, .1);
}

.admin-data-card :deep(.pagination) .bg-primary-600 {
  background: linear-gradient(135deg, #2563eb, #4f46e5) !important;
}

@keyframes admin-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes admin-pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, .45); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@media (max-width: 1199px) {
  .admin-hero {
    grid-template-columns: minmax(0, 1fr) 260px;
  }
.admin-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 991px) {
  .admin-hero {
    display: flex;
  }

  .admin-hero-art {
    display: none;
  }
}

@media (max-width: 767px) {
  .admin-hero {
    min-height: 0;
    padding: 18px;
    border-radius: 20px;
  }

  .admin-hero h1 {
    font-size: 24px;
  }

  .admin-stat-grid {
    grid-template-columns: 1fr;
  }

  .admin-filter-chips {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
