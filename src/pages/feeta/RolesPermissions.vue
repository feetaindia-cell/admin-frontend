<template>
  <div class="dashboard-main-body access-page">
    <section class="access-header" aria-labelledby="access-title">
      <div class="access-header__title">
        <span class="access-header__icon" aria-hidden="true">
          <iconify-icon icon="ri:shield-user-line"></iconify-icon>
        </span>
        <div>
          <h1 id="access-title">{{ title }}</h1>
          <p>{{ isPermissions ? 'Review every permission available across FEETA modules.' : 'Create roles and choose exactly which features each role can access.' }}</p>
        </div>
      </div>
    </section>

    <div v-if="error" class="access-alert" role="alert">
      <iconify-icon icon="ri:error-warning-line" aria-hidden="true"></iconify-icon>
      <span>{{ error }}</span>
    </div>

    <LoadingState v-if="loading" :message="`Loading ${title.toLowerCase()}...`" />

    <template v-else-if="isPermissions">
      <section class="access-summary-grid" aria-label="Permission summary">
        <article class="access-stat">
          <span><iconify-icon icon="ri:folder-shield-2-line"></iconify-icon></span>
          <div>
            <strong>{{ permissionGroups.length }}</strong>
            <p>Modules</p>
          </div>
        </article>
        <article class="access-stat">
          <span><iconify-icon icon="ri:key-2-line"></iconify-icon></span>
          <div>
            <strong>{{ totalPermissions }}</strong>
            <p>Permissions</p>
          </div>
        </article>
      </section>

      <section v-for="group in permissionGroups" :key="group.module" class="permission-module-card">
        <div class="permission-module-card__header">
          <div class="permission-module-title">
            <span aria-hidden="true"><iconify-icon :icon="moduleIcon(group.module)"></iconify-icon></span>
            <div>
              <h2>{{ moduleLabel(group.module) }}</h2>
              <p>{{ group.permissions.length }} available permissions</p>
            </div>
          </div>
          <span class="permission-count">{{ group.permissions.length }}</span>
        </div>
        <div class="permission-grid">
          <article v-for="permission in group.permissions" :key="permission.id" class="permission-card">
            <span class="permission-card__icon" aria-hidden="true">
              <iconify-icon icon="ri:shield-check-line"></iconify-icon>
            </span>
            <div>
              <h3>{{ permission.name }}</h3>
              <p>{{ permission.description || 'No description' }}</p>
            </div>
          </article>
        </div>
      </section>
      <EmptyState v-if="!permissionGroups.length" icon="ri:shield-keyhole-line" title="No permissions found" message="No permission records are available." />
    </template>

    <section v-else class="roles-card">
      <div class="roles-card__header">
        <div>
          <h2>Roles</h2>
          <p>Control access by assigning module permissions to each role.</p>
        </div>
        <button v-if="auth.isSuperAdmin()" type="button" class="access-primary-btn" @click="openCreate">
          <iconify-icon icon="ri:add-line" aria-hidden="true"></iconify-icon>
          Create Role
        </button>
      </div>

      <div class="access-summary-grid access-summary-grid--roles" aria-label="Role summary">
        <article class="access-stat">
          <span><iconify-icon icon="ri:admin-line"></iconify-icon></span>
          <div>
            <strong>{{ roles.length }}</strong>
            <p>Total roles</p>
          </div>
        </article>
        <article class="access-stat">
          <span><iconify-icon icon="ri:checkbox-circle-line"></iconify-icon></span>
          <div>
            <strong>{{ activeRoles }}</strong>
            <p>Active roles</p>
          </div>
        </article>
        <article class="access-stat">
          <span><iconify-icon icon="ri:key-2-line"></iconify-icon></span>
          <div>
            <strong>{{ totalRolePermissions }}</strong>
            <p>Assigned permissions</p>
          </div>
        </article>
      </div>

      <div class="roles-table-wrap">
        <table class="roles-table">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Role Type</th>
              <th>Status</th>
              <th>Permissions</th>
              <th>Admins</th>
              <th class="manage-cell">Manage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id" class="manage-row">
              <td>
                <div class="role-cell">
                  <span class="role-avatar" aria-hidden="true">{{ roleInitials(role.name) }}</span>
                  <div>
                    <strong>{{ role.name }}</strong>
                    <p>{{ role.description || 'No description added' }}</p>
                  </div>
                </div>
              </td>
              <td><span class="role-type-pill">{{ role.role_type?.name || '-' }}</span></td>
              <td>
                <span :class="['access-status-pill', Number(role.status) === 1 ? 'is-active' : 'is-inactive']">
                  <iconify-icon :icon="Number(role.status) === 1 ? 'ri:checkbox-circle-line' : 'ri:pause-circle-line'" aria-hidden="true"></iconify-icon>
                  {{ Number(role.status) === 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td><span class="metric-pill">{{ role.permissions_count ?? role.permissions?.length ?? 0 }}</span></td>
              <td><span class="metric-pill">{{ role.admins_count ?? role.users_count ?? 0 }}</span></td>
              <td class="manage-cell"><button type="button" class="manage-row-button" @click="openRoleManage(role)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-if="!roles.length" icon="ri:admin-line" title="No roles found" message="Create a role to configure feature access." />
    </section>

    <div v-if="dialogOpen" class="role-dialog-backdrop" @click.self="closeDialog">
      <div class="role-dialog" role="dialog" aria-modal="true" :aria-label="dialogTitle">
        <div class="role-dialog__header">
          <div>
            <h2>{{ dialogTitle }}</h2>
            <p>{{ viewOnly ? 'Review role settings and assigned permissions.' : 'Configure role identity, status and module access.' }}</p>
          </div>
          <button type="button" class="role-dialog__close" aria-label="Close dialog" @click="closeDialog">
            <iconify-icon icon="ri:close-line"></iconify-icon>
          </button>
        </div>

        <div class="role-dialog__body">
          <div v-if="dialogError" class="access-alert" role="alert">
            <iconify-icon icon="ri:error-warning-line" aria-hidden="true"></iconify-icon>
            <span>{{ dialogError }}</span>
          </div>

          <section class="role-form-card">
            <div class="role-form-grid">
              <div class="access-field access-field--wide">
                <label for="role-name">Role Name</label>
                <div :class="['access-input-wrap', { 'has-error': formErrors.name }]">
                  <iconify-icon icon="ri:shield-user-line" aria-hidden="true"></iconify-icon>
                  <input id="role-name" v-model="form.name" :disabled="viewOnly" maxlength="100" />
                </div>
                <div v-if="formErrors.name" class="access-field-error">{{ formErrors.name[0] }}</div>
              </div>
              <div class="access-field">
                <label for="role-type">Role Type</label>
                <div :class="['access-input-wrap', { 'has-error': formErrors.role_type_id }]">
                  <iconify-icon icon="ri:price-tag-3-line" aria-hidden="true"></iconify-icon>
                  <select id="role-type" v-model="form.role_type_id" :disabled="viewOnly">
                    <option v-for="type in roleTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                  </select>
                </div>
                <div v-if="formErrors.role_type_id" class="access-field-error">{{ formErrors.role_type_id[0] }}</div>
              </div>
              <div class="access-field access-field--wide">
                <label for="role-description">Description</label>
                <textarea id="role-description" v-model="form.description" :disabled="viewOnly" rows="3"></textarea>
              </div>
              <div class="access-field">
                <label for="role-status">Status</label>
                <div class="access-input-wrap">
                  <span :class="['status-dot', Number(form.status) === 1 ? 'is-active' : 'is-inactive']" aria-hidden="true"></span>
                  <select id="role-status" v-model.number="form.status" :disabled="viewOnly">
                    <option :value="1">Active</option>
                    <option :value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section class="permission-picker">
            <div class="permission-picker__header">
              <div>
                <h2>Feature Permissions</h2>
                <p>{{ selectedPermissions.length }} of {{ allPermissionIds.length }} selected</p>
              </div>
              <label v-if="!viewOnly" class="access-toggle">
                <input type="checkbox" :checked="allSelected" @change="toggleAll($event.target.checked)" />
                <span>Select all</span>
              </label>
            </div>

            <div v-for="group in permissionGroups" :key="group.module" class="permission-group">
              <div class="permission-group__header">
                <div class="permission-module-title">
                  <span aria-hidden="true"><iconify-icon :icon="moduleIcon(group.module)"></iconify-icon></span>
                  <div>
                    <h3>{{ moduleLabel(group.module) }}</h3>
                    <p>{{ group.permissions.length }} permissions</p>
                  </div>
                </div>
                <label v-if="!viewOnly" class="access-toggle access-toggle--sm">
                  <input type="checkbox" :checked="groupSelected(group)" @change="toggleGroup(group, $event.target.checked)" />
                  <span>Select module</span>
                </label>
              </div>
              <div class="permission-check-grid">
                <label v-for="permission in group.permissions" :key="permission.id" class="permission-check">
                  <input v-model="selectedPermissions" type="checkbox" :value="permission.id" :disabled="viewOnly" />
                  <span class="permission-check__box" aria-hidden="true">
                    <iconify-icon icon="ri:check-line"></iconify-icon>
                  </span>
                  <span>
                    <strong>{{ permission.name }}</strong>
                    <small>{{ permission.description || 'No description' }}</small>
                  </span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div class="role-dialog__footer">
          <button type="button" class="access-secondary-btn" @click="closeDialog">{{ viewOnly ? 'Close' : 'Cancel' }}</button>
          <button v-if="!viewOnly" type="button" class="access-primary-btn" :disabled="saving" @click="saveRole">
            <iconify-icon :icon="saving ? 'ri:loader-4-line' : 'ri:save-line'" :class="{ 'is-spinning': saving }" aria-hidden="true"></iconify-icon>
            {{ saving ? 'Saving...' : 'Save Role' }}
          </button>
        </div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedRole?.name" :subtitle="selectedRole?.description || selectedRole?.role_type?.name || ''">
      <button v-if="selectedRole" type="button" @click="openView(selectedRole)"><iconify-icon icon="ri:eye-line" /> View role</button>
      <button v-if="selectedRole && canModify(selectedRole)" type="button" @click="openEdit(selectedRole)"><iconify-icon icon="ri:edit-line" /> Edit role</button>
      <button v-if="selectedRole && canModify(selectedRole)" type="button" class="text-danger" @click="removeRole(selectedRole)"><iconify-icon icon="ri:delete-bin-line" /> Delete role</button>
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
import permissionService from '@/services/permissionService'
import roleService from '@/services/roleService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const roles = ref([])
const permissionGroups = ref([])
const loading = ref(true)
const error = ref('')
const dialogOpen = ref(false)
const dialogMode = ref('create')
const manageOpen = ref(false)
const selectedRole = ref(null)
const currentRoleId = ref(null)
const selectedPermissions = ref([])
const saving = ref(false)
const dialogError = ref('')
const formErrors = ref({})
const form = reactive({ name: '', role_type_id: '', description: '', status: 1 })

const isPermissions = computed(() => route.path.includes('permissions'))
const title = computed(() => isPermissions.value ? 'Permissions' : 'Roles')
const viewOnly = computed(() => dialogMode.value === 'view')
const dialogTitle = computed(() => dialogMode.value === 'create' ? 'Create Role' : dialogMode.value === 'edit' ? 'Edit Role' : 'Role Details')
const allPermissionIds = computed(() => permissionGroups.value.flatMap((group) => group.permissions.map((permission) => permission.id)))
const allSelected = computed(() => allPermissionIds.value.length > 0 && allPermissionIds.value.every((id) => selectedPermissions.value.includes(id)))
const totalPermissions = computed(() => permissionGroups.value.reduce((sum, group) => sum + group.permissions.length, 0))
const activeRoles = computed(() => roles.value.filter((role) => Number(role.status) === 1).length)
const totalRolePermissions = computed(() => roles.value.reduce((sum, role) => sum + Number(role.permissions_count ?? role.permissions?.length ?? 0), 0))
const roleTypes = computed(() => {
  const types = new Map()
  roles.value.forEach((role) => {
    const type = role.role_type
    if (type?.id && type.code !== 'super_admin') types.set(type.id, type)
  })
  return [...types.values()]
})

function moduleLabel(module) {
  const labels = {
    admins: 'Admin Management', news: 'News Management', master_property: 'Master Property',
    agents: 'Agent Management', users: 'User Management', properties: 'Property Management',
    payments: 'Payments', credits: 'Credits', roles: 'Roles', permissions: 'Permissions',
    activity_logs: 'Activity Logs', settings: 'Settings',
  }
  return labels[module] || String(module).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function moduleIcon(module) {
  const icons = {
    admins: 'ri:admin-line',
    news: 'ri:newspaper-line',
    master_property: 'ri:building-4-line',
    agents: 'ri:user-star-line',
    users: 'ri:user-3-line',
    properties: 'ri:home-4-line',
    payments: 'ri:bank-card-line',
    credits: 'ri:wallet-3-line',
    roles: 'ri:shield-user-line',
    permissions: 'ri:shield-keyhole-line',
    activity_logs: 'ri:history-line',
    settings: 'ri:settings-3-line',
  }
  return icons[module] || 'ri:shield-check-line'
}

function roleInitials(name) {
  return String(name || 'Role')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'R'
}

function canModify(role) {
  return auth.isSuperAdmin() && role.role_type?.code !== 'super_admin' && Number(role.id) !== 1
}

function resetForm() {
  Object.assign(form, { name: '', role_type_id: roleTypes.value[0]?.id || '', description: '', status: 1 })
  selectedPermissions.value = []
  currentRoleId.value = null
  dialogError.value = ''
  formErrors.value = {}
}

function openCreate() {
  resetForm()
  dialogMode.value = 'create'
  dialogOpen.value = true
}

function openRoleManage(role) {
  selectedRole.value = role
  manageOpen.value = true
}

async function openRole(role, mode) {
  dialogError.value = ''
  formErrors.value = {}
  try {
    const detail = await roleService.get(role.id)
    currentRoleId.value = role.id
    Object.assign(form, {
      name: detail.name || '',
      role_type_id: detail.role_type?.id || '',
      description: detail.description || '',
      status: Number(detail.status),
    })
    selectedPermissions.value = (detail.permissions || []).map((permission) => permission.id)
    dialogMode.value = mode
    dialogOpen.value = true
  } catch (err) {
    error.value = err.message
  }
}

const openEdit = (role) => openRole(role, 'edit')
const openView = (role) => openRole(role, 'view')
const closeDialog = () => { dialogOpen.value = false }

function groupSelected(group) {
  return group.permissions.length > 0 && group.permissions.every((permission) => selectedPermissions.value.includes(permission.id))
}

function toggleGroup(group, checked) {
  const ids = group.permissions.map((permission) => permission.id)
  selectedPermissions.value = checked
    ? [...new Set([...selectedPermissions.value, ...ids])]
    : selectedPermissions.value.filter((id) => !ids.includes(id))
}

function toggleAll(checked) {
  selectedPermissions.value = checked ? [...allPermissionIds.value] : []
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    if (isPermissions.value) {
      permissionGroups.value = await permissionService.list()
      return
    }
    const [rolePayload, permissions] = await Promise.all([roleService.list({ per_page: 100 }), permissionService.list()])
    roles.value = Array.isArray(rolePayload) ? rolePayload : rolePayload?.data || []
    permissionGroups.value = Array.isArray(permissions) ? permissions : permissions?.data || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function saveRole() {
  saving.value = true
  dialogError.value = ''
  formErrors.value = {}
  try {
    const payload = {
      name: form.name.trim(),
      role_type_id: Number(form.role_type_id),
      description: form.description || null,
      status: Number(form.status),
      permission_ids: selectedPermissions.value,
    }
    if (dialogMode.value === 'create') {
      await roleService.create(payload)
    } else {
      await roleService.update(currentRoleId.value, payload)
      await roleService.syncPermissions(currentRoleId.value, selectedPermissions.value)
    }
    closeDialog()
    await loadData()
    await Swal.fire({ icon: 'success', title: 'Role saved', timer: 1200, showConfirmButton: false })
  } catch (err) {
    dialogError.value = err.message
    formErrors.value = err.errors || {}
  } finally {
    saving.value = false
  }
}

async function removeRole(role) {
  const result = await Swal.fire({
    title: 'Delete role?',
    text: `${role.name} can only be deleted when no admins are assigned.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
  })
  if (!result.isConfirmed) return
  try {
    await roleService.remove(role.id)
    await loadData()
  } catch (err) {
    await Swal.fire('Unable to delete role', err.message, 'error')
  }
}

watch(() => route.path, loadData)
onMounted(loadData)
</script>

<style scoped>
.access-page {
  --access-primary: #487fff;
  --access-primary-dark: #2f65e9;
  --access-bg: #f6f8fc;
  --access-text: #111827;
  --access-muted: #64748b;
  --access-border: rgba(148, 163, 184, .22);
  --access-shadow: 0 10px 28px rgba(15, 23, 42, .055);
  background: var(--access-bg);
}

.access-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.access-header__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.access-header__icon,
.permission-module-title > span,
.access-stat > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--access-primary);
  background: linear-gradient(145deg, #fff, #eef4ff);
}

.access-header__icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border: 1px solid rgba(72, 127, 255, .16);
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(72, 127, 255, .1);
}

.access-header__icon iconify-icon { font-size: 22px; }
.access-header h1 {
  margin: 0;
  color: var(--access-text);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 700;
}

.access-header p {
  margin: 4px 0 0;
  color: var(--access-muted);
  font-size: 14px;
  line-height: 1.45;
}

.access-alert {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 10px 14px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #b91c1c;
  background: #fef2f2;
  font-size: 14px;
}

.access-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.access-summary-grid--roles {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.access-stat {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--access-border);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--access-shadow);
}

.access-stat > span {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 12px;
}

.access-stat strong {
  display: block;
  color: var(--access-text);
  font-size: 20px;
  line-height: 1.2;
  font-weight: 750;
}

.access-stat p {
  margin: 2px 0 0;
  color: var(--access-muted);
  font-size: 12px;
}

.roles-card,
.permission-module-card,
.role-dialog,
.role-form-card,
.permission-picker {
  border: 1px solid var(--access-border);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--access-shadow);
}

.roles-card {
  overflow: hidden;
}

.roles-card__header,
.permission-module-card__header,
.role-dialog__header,
.role-dialog__footer,
.permission-picker__header,
.permission-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.roles-card__header {
  padding: 18px 20px;
  border-bottom: 1px solid #eef2f7;
}

.roles-card__header h2,
.permission-module-card__header h2,
.role-dialog__header h2,
.permission-picker__header h2,
.role-form-card h2 {
  margin: 0;
  color: var(--access-text);
  font-size: 18px;
  line-height: 1.35;
  font-weight: 700;
}

.roles-card__header p,
.permission-module-card__header p,
.role-dialog__header p,
.permission-picker__header p,
.permission-group__header p {
  margin: 3px 0 0;
  color: var(--access-muted);
  font-size: 13px;
  line-height: 1.45;
}

.roles-card .access-summary-grid {
  margin: 16px 20px;
}

.roles-table-wrap {
  margin: 0 8px 8px;
  overflow-x: auto;
  border: 1px solid #eef2f7;
  border-radius: 14px;
}

.roles-table {
  width: 100%;
  min-width: 820px;
  border-collapse: separate;
  border-spacing: 0;
}

.roles-table thead th {
  padding: 12px 16px;
  border-bottom: 1px solid #e8edf4;
  color: #475569;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 750;
}

.roles-table tbody td {
  height: 72px;
  padding: 10px 16px;
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
}

.roles-table tbody tr {
  transition: background-color .16s ease;
}

.roles-table tbody tr:hover {
  background: rgba(72, 127, 255, .045);
}

.roles-table tbody tr:last-child td {
  border-bottom: 0;
}

.role-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.role-avatar {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  border-radius: 12px;
  color: #1d4ed8;
  background: #eff6ff;
  font-size: 13px;
  font-weight: 800;
}

.role-cell strong {
  display: block;
  color: var(--access-text);
  font-size: 14px;
  font-weight: 750;
}

.role-cell p {
  max-width: 360px;
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--access-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-type-pill,
.metric-pill,
.permission-count,
.access-status-pill {
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 750;
}

.role-type-pill { color: #475569; }
.metric-pill { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }
.permission-count { color: #1d4ed8; background: #eff6ff; border-color: #dbeafe; }
.access-status-pill.is-active { color: #15803d; background: #ecfdf3; border-color: #bbf7d0; }
.access-status-pill.is-inactive { color: #64748b; background: #f8fafc; border-color: #e2e8f0; }

.access-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.access-action-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 50%;
  background: #fff;
  transition: transform .16s ease, box-shadow .16s ease, background-color .16s ease;
}

.access-action-btn:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 18px rgba(15, 23, 42, .08);
}

.access-action-btn.is-view { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }
.access-action-btn.is-edit { color: #16a34a; background: #f0fdf4; border-color: #dcfce7; }
.access-action-btn.is-delete { color: #dc2626; background: #fef2f2; border-color: #fee2e2; }

.access-primary-btn,
.access-secondary-btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  transition: transform .16s ease, box-shadow .16s ease, background-color .16s ease;
}

.access-primary-btn {
  border: 1px solid transparent;
  color: #fff;
  background: linear-gradient(135deg, var(--access-primary), var(--access-primary-dark));
  box-shadow: 0 8px 18px rgba(72, 127, 255, .22);
}

.access-primary-btn:hover:not(:disabled) {
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(72, 127, 255, .26);
}

.access-primary-btn:disabled {
  cursor: not-allowed;
  opacity: .75;
}

.access-secondary-btn {
  border: 1px solid #e2e8f0;
  color: #475569;
  background: #fff;
}

.access-secondary-btn:hover {
  color: #1f2937;
  background: #f8fafc;
  transform: translateY(-1px);
}

.permission-module-card {
  margin-bottom: 16px;
  padding: 18px;
}

.permission-module-card__header {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eef2f7;
}

.permission-module-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.permission-module-title > span {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 12px;
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.permission-card {
  min-height: 92px;
  display: flex;
  gap: 10px;
  padding: 14px;
  border: 1px solid #e8edf4;
  border-radius: 14px;
  background: #fff;
  transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
}

.permission-card:hover {
  transform: translateY(-1px);
  border-color: rgba(72, 127, 255, .28);
  box-shadow: 0 10px 24px rgba(15, 23, 42, .06);
}

.permission-card__icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 30px;
  border-radius: 10px;
  color: #2563eb;
  background: #eff6ff;
}

.permission-card h3 {
  margin: 0;
  color: var(--access-text);
  font-size: 14px;
  line-height: 1.35;
  font-weight: 750;
}

.permission-card p {
  margin: 4px 0 0;
  color: var(--access-muted);
  font-size: 12px;
  line-height: 1.45;
}

.role-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1060;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 16px;
  overflow-y: auto;
  background: rgba(15, 23, 42, .58);
  backdrop-filter: blur(6px);
}

.role-dialog {
  width: min(1040px, 100%);
  max-height: calc(100vh - 64px);
  display: flex;
  overflow: hidden;
  flex-direction: column;
}

.role-dialog__header,
.role-dialog__footer {
  flex: 0 0 auto;
  padding: 18px 22px;
  border-bottom: 1px solid #eef2f7;
}

.role-dialog__footer {
  justify-content: flex-end;
  border-top: 1px solid #eef2f7;
  border-bottom: 0;
  background: #f8fafc;
}

.role-dialog__body {
  overflow-y: auto;
  padding: 20px;
}

.role-dialog__close {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  color: #475569;
  background: #fff;
  transition: transform .16s ease, background-color .16s ease;
}

.role-dialog__close:hover {
  background: #f8fafc;
  transform: scale(1.04);
}

.role-form-card {
  margin-bottom: 16px;
  padding: 18px;
}

.role-form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
}

.access-field--wide {
  min-width: 0;
}

.access-field label {
  display: inline-flex;
  margin-bottom: 7px;
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
}

.access-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  transition: border-color .16s ease, box-shadow .16s ease;
}

.access-input-wrap:focus-within,
.access-field textarea:focus {
  border-color: rgba(72, 127, 255, .62);
  box-shadow: 0 0 0 3px rgba(72, 127, 255, .14);
}

.access-input-wrap.has-error {
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, .1);
}

.access-input-wrap > iconify-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 17px;
  pointer-events: none;
}

.access-input-wrap input,
.access-input-wrap select {
  width: 100%;
  min-height: 42px;
  border: 0;
  outline: 0;
  color: #111827;
  background: transparent;
  font-size: 14px;
}

.access-input-wrap input,
.access-input-wrap select {
  padding: 0 14px 0 42px;
}

.status-dot {
  position: absolute;
  left: 16px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  pointer-events: none;
}

.status-dot.is-active { background: #22c55e; }
.status-dot.is-inactive { background: #94a3b8; }

.access-field textarea {
  width: 100%;
  min-height: 92px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: 0;
  resize: vertical;
  color: #111827;
  font-size: 14px;
  line-height: 1.5;
}

.access-field-error {
  margin-top: 6px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
}

.permission-picker {
  overflow: hidden;
}

.permission-picker__header {
  padding: 18px 20px;
  border-bottom: 1px solid #eef2f7;
  background: #fbfdff;
}

.access-toggle {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #2563eb;
  background: #eff6ff;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
}

.access-toggle--sm {
  min-height: 32px;
  font-size: 12px;
}

.access-toggle input {
  width: 16px;
  height: 16px;
  accent-color: var(--access-primary);
}

.permission-group {
  padding: 18px 20px;
  border-bottom: 1px solid #eef2f7;
}

.permission-group:last-child {
  border-bottom: 0;
}

.permission-group__header {
  margin-bottom: 12px;
}

.permission-group__header h3 {
  margin: 0;
  color: var(--access-text);
  font-size: 15px;
  line-height: 1.35;
  font-weight: 750;
}

.permission-check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.permission-check {
  position: relative;
  min-height: 64px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e8edf4;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
}

.permission-check:hover {
  border-color: rgba(72, 127, 255, .3);
  background: #fbfdff;
}

.permission-check input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.permission-check__box {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 22px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  color: #fff;
  background: #fff;
  transition: background-color .16s ease, border-color .16s ease;
}

.permission-check input:checked + .permission-check__box {
  border-color: transparent;
  background: var(--access-primary);
}

.permission-check input:focus-visible + .permission-check__box {
  box-shadow: 0 0 0 3px rgba(72, 127, 255, .18);
}

.permission-check input:disabled + .permission-check__box {
  opacity: .7;
}

.permission-check strong {
  display: block;
  color: var(--access-text);
  font-size: 13px;
  line-height: 1.35;
}

.permission-check small {
  display: block;
  margin-top: 3px;
  color: var(--access-muted);
  font-size: 12px;
  line-height: 1.4;
}

.is-spinning {
  animation: access-spin .8s linear infinite;
}

@keyframes access-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1199px) {
  .permission-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 991px) {
  .access-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .access-summary-grid,
  .access-summary-grid--roles,
  .role-form-grid,
  .permission-check-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575px) {
  .access-header h1 { font-size: 22px; }
  .access-header__icon {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
  }

  .roles-card__header,
  .permission-module-card__header,
  .role-dialog__header,
  .role-dialog__footer,
  .permission-picker__header,
  .permission-group__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .permission-grid { grid-template-columns: 1fr; }
  .permission-module-card,
  .role-form-card,
  .permission-group,
  .permission-picker__header {
    padding: 16px;
  }

  .role-dialog-backdrop { padding: 16px 10px; }
  .role-dialog { max-height: calc(100vh - 32px); }
  .role-dialog__body { padding: 14px; }
  .role-dialog__footer .access-primary-btn,
  .role-dialog__footer .access-secondary-btn,
  .roles-card__header .access-primary-btn {
    width: 100%;
  }
}
</style>
