<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading role permissions..." />
    <div v-else class="card radius-12">
      <div class="card-body p-24">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <form @submit.prevent="submit">
          <div class="row">
            <div class="col-lg-7 mb-20">
              <label class="form-label fw-semibold">Role Name <span class="text-danger">*</span></label>
              <input v-model="form.name" class="form-control radius-8" maxlength="100" />
              <div v-if="errors.name" class="text-danger text-sm mt-1">{{ errors.name[0] }}</div>
            </div>
            <div class="col-lg-5 mb-20">
              <label class="form-label fw-semibold">Role Type <span class="text-danger">*</span></label>
              <select v-model="form.role_type_id" class="form-select radius-8">
                <option value="">Select role type</option>
                <option v-for="type in roleTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
              </select>
              <div v-if="errors.role_type_id" class="text-danger text-sm mt-1">{{ errors.role_type_id[0] }}</div>
            </div>
            <div class="col-lg-8 mb-20">
              <label class="form-label fw-semibold">Description</label>
              <textarea v-model="form.description" class="form-control radius-8" rows="3"></textarea>
            </div>
            <div class="col-lg-4 mb-20">
              <label class="form-label fw-semibold">Status</label>
              <select v-model.number="form.status" class="form-select radius-8">
                <option :value="1">Active</option>
                <option :value="0">Inactive</option>
              </select>
            </div>
          </div>

          <div class="permission-toolbar border-bottom pb-16 mb-16">
            <div>
              <h6 class="mb-1">Permission Assignment</h6>
              <p class="text-secondary-light text-sm mb-0">{{ selected.length }} of {{ permissionIds.length }} permissions selected.</p>
            </div>
            <label class="permission-search">
              <iconify-icon icon="ri:search-line" />
              <input v-model.trim="search" type="search" class="form-control" placeholder="Search permissions" />
            </label>
            <div class="d-flex align-items-center gap-12 flex-wrap">
              <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="!selected.length" @click="toggleAll(false)">Clear All</button>
              <label class="form-check d-flex align-items-center gap-8 mb-0">
                <input class="form-check-input" type="checkbox" :checked="allSelected" @change="toggleAll($event.target.checked)" />
                <span class="form-check-label fw-semibold">Select All</span>
              </label>
            </div>
          </div>

          <div v-for="group in filteredGroups" :key="group.module" class="border radius-8 p-16 mb-16 permission-card">
            <div class="d-flex align-items-center justify-content-between mb-12">
              <h6 class="mb-0">{{ moduleLabel(group.module) }}</h6>
              <label class="form-check d-flex align-items-center gap-8">
                <input class="form-check-input" type="checkbox" :checked="groupSelected(group)"
                  @change="toggleGroup(group, $event.target.checked)" />
                <span class="form-check-label">Select All</span>
              </label>
            </div>
            <div class="row g-2">
              <label v-for="permission in group.permissions" :key="permission.id" class="col-xl-4 col-md-6 permission-option">
                <input v-model="selected" class="form-check-input" type="checkbox" :value="permission.id" />
                <span>
                  <span class="d-block fw-medium">{{ permissionLabel(permission) }}</span>
                  <span class="text-secondary-light text-xs">{{ permission.name }}</span>
                </span>
              </label>
            </div>
          </div>

          <EmptyState v-if="!filteredGroups.length" icon="ri:shield-keyhole-line" title="No permissions found" :message="search ? 'No permissions match your search.' : 'Permission records are not available.'" />
          <button v-if="error" type="button" class="btn btn-sm btn-outline-danger mb-16" @click="load">Retry loading permissions</button>
          <div class="d-flex justify-content-end gap-3 mt-24">
            <router-link to="/roles" class="btn btn-outline-secondary">Cancel</router-link>
            <button type="submit" class="btn btn-primary-600" :disabled="saving">
              {{ saving ? 'Saving...' : isEdit ? 'Update Role' : 'Save Role' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import permissionService from '@/services/permissionService'
import roleService from '@/services/roleService'
import { groupPermissionModules, moduleLabel, normalizeList, permissionLabel } from './rolePermissions'

const props = defineProps({ mode: { type: String, default: 'create' } })
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => props.mode === 'edit')
const form = reactive({ name: '', role_type_id: '', description: '', status: 1 })
const groups = ref([])
const roles = ref([])
const selected = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const errors = ref({})
const search = ref('')
const roleTypes = computed(() => {
  const types = new Map()
  roles.value.forEach((role) => {
    if (role.role_type?.id && role.role_type.code !== 'super_admin') types.set(role.role_type.id, role.role_type)
  })
  return [...types.values()]
})
const permissionIds = computed(() => groups.value.flatMap((group) => group.permissions.map((permission) => permission.id)))
const allSelected = computed(() => permissionIds.value.length > 0 && permissionIds.value.every((id) => selected.value.includes(id)))
const filteredGroups = computed(() => {
  const query = search.value.toLowerCase()
  if (!query) return groups.value

  return groups.value
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) => [
        moduleLabel(group.module), permission.name, permission.description, permissionLabel(permission),
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))),
    }))
    .filter((group) => group.permissions.length)
})

function groupSelected(group) {
  return group.permissions.length > 0 && group.permissions.every((permission) => selected.value.includes(permission.id))
}
function toggleGroup(group, checked) {
  const ids = group.permissions.map((permission) => permission.id)
  selected.value = checked ? [...new Set([...selected.value, ...ids])] : selected.value.filter((id) => !ids.includes(id))
}
function toggleAll(checked) {
  selected.value = checked ? [...permissionIds.value] : []
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [rolePayload, permissionPayload] = await Promise.all([
      roleService.getRoles({ per_page: 100 }),
      permissionService.getGroupedPermissions(),
    ])
    roles.value = normalizeList(rolePayload)
    groups.value = groupPermissionModules(permissionPayload)
    if (!isEdit.value) {
      form.role_type_id = roleTypes.value[0]?.id || ''
      return
    }
    const role = await roleService.getRole(route.params.id)
    if (role.role_type?.code === 'super_admin') return router.replace(`/roles/${route.params.id}`)
    Object.assign(form, {
      name: role.name || '',
      role_type_id: role.role_type?.id || '',
      description: role.description || '',
      status: Number(role.status),
    })
    selected.value = (role.permissions || []).map((permission) => permission.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function submit() {
  saving.value = true
  error.value = ''
  errors.value = {}
  const payload = {
    name: form.name.trim(),
    role_type_id: Number(form.role_type_id),
    description: form.description || null,
    status: Number(form.status),
  }
  try {
    let roleId = route.params.id
    if (isEdit.value) {
      await roleService.updateRole(route.params.id, payload)
    } else {
      const created = await roleService.createRole(payload)
      roleId = created?.id
    }
    if (roleId) {
      await roleService.syncRolePermissions(roleId, selected.value)
    }
    await Swal.fire({ icon: 'success', title: isEdit.value ? 'Role updated' : 'Role created', timer: 1200, showConfirmButton: false })
    router.push('/roles')
  } catch (err) {
    error.value = err.message
    errors.value = err.errors || {}
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.permission-option { display: flex; gap: 10px; padding: 12px 16px 12px 38px; border-radius: 8px; }
.permission-option:hover { background: #f5f8ff; }
.permission-toolbar { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(240px, 360px) auto; align-items: center; gap: 16px; }
.permission-search { position: relative; display: block; }
.permission-search iconify-icon { position: absolute; left: 13px; top: 50%; z-index: 1; transform: translateY(-50%); color: var(--text-secondary-light); }
.permission-search .form-control { padding-left: 38px; }
.permission-card { overflow: hidden; }
@media (max-width: 991px) { .permission-toolbar { grid-template-columns: 1fr; align-items: stretch; } }
</style>
