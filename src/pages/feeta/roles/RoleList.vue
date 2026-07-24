<template>
  <div class="dashboard-main-body">
<div v-if="error" class="alert alert-danger">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading roles..." />
    <div v-else class="card radius-12">
      <div class="card-header bg-base py-16 px-24 d-flex align-items-center justify-content-between">
        <div>
          <h6 class="mb-1">Roles</h6>
          <p class="text-secondary-light text-sm mb-0">Control access by assigning module permissions to each role.</p>
        </div>
        <router-link v-if="auth.hasPermission('role.create')" to="/roles/create" class="btn btn-primary-600">
          <iconify-icon icon="ri:add-line" class="me-6" /> Create Role
        </router-link>
      </div>
      <div class="card-body p-24">
        <div class="table-responsive">
          <table class="table bordered-table sm-table mb-0">
            <thead><tr><th>Role Name</th><th>Role Type</th><th>Status</th><th>Permissions</th><th>Admins</th><th class="manage-cell">Manage</th></tr></thead>
            <tbody>
              <tr v-for="role in roles" :key="role.id" class="manage-row">
                <td><div class="fw-semibold">{{ role.name }}</div><div class="text-secondary-light text-xs">{{ role.description || '-' }}</div></td>
                <td>{{ role.role_type?.name || '-' }}</td>
                <td><StatusBadge :status="Number(role.status) === 1 ? 'active' : 'inactive'" /></td>
                <td>{{ role.permissions_count ?? role.permissions?.length ?? 0 }}</td>
                <td>{{ role.admins_count ?? role.users_count ?? 0 }}</td>
                <td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(role)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!roles.length" icon="ri:admin-line" title="No roles found" message="Create a role to configure admin access." />
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedRole?.name" :subtitle="selectedRole?.description || selectedRole?.role_type?.name || ''">
      <router-link v-if="selectedRole" :to="`/roles/${selectedRole.id}`"><iconify-icon icon="ri:eye-line" /> View role</router-link>
      <router-link v-if="selectedRole && canEdit(selectedRole)" :to="`/roles/${selectedRole.id}/edit`"><iconify-icon icon="ri:edit-line" /> Edit role</router-link>
      <button v-if="selectedRole && canDelete(selectedRole)" type="button" class="text-danger" @click="remove(selectedRole)"><iconify-icon icon="ri:delete-bin-line" /> Delete role</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import roleService from '@/services/roleService'
import { useAuthStore } from '@/stores/auth'
import { isProtectedRole, normalizeList } from './rolePermissions'

const auth = useAuthStore()
const roles = ref([])
const loading = ref(true)
const error = ref('')
const manageOpen = ref(false)
const selectedRole = ref(null)
const canEdit = (role) => auth.hasPermission('role.update') && !isProtectedRole(role)
const canDelete = (role) => auth.hasPermission('role.delete') && !isProtectedRole(role)
function openManage(role) {
  selectedRole.value = role
  manageOpen.value = true
}

async function load() {
  loading.value = true
  try {
    roles.value = normalizeList(await roleService.getRoles({ per_page: 100 }))
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
async function remove(role) {
  const result = await Swal.fire({ title: 'Delete role?', text: `${role.name} must not be assigned to any admin.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' })
  if (!result.isConfirmed) return
  try {
    await roleService.deleteRole(role.id)
    await load()
  } catch (err) {
    await Swal.fire('Unable to delete role', err.message, 'error')
  }
}
onMounted(load)
</script>

<style scoped>
.action-button { width: 38px; height: 38px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
</style>
