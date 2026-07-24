<template>
  <div class="dashboard-main-body">
<div v-if="error" class="alert alert-danger">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading role..." />
    <template v-else-if="role">
      <div class="card radius-12 mb-20">
        <div class="card-body p-24 d-flex align-items-start justify-content-between gap-3">
          <div>
            <h5 class="mb-6">{{ role.name }}</h5>
            <p class="text-secondary-light mb-10">{{ role.description || 'No description' }}</p>
            <div class="d-flex gap-3 align-items-center">
              <span class="badge bg-primary-100 text-primary-600">{{ role.role_type?.name }}</span>
              <StatusBadge :status="Number(role.status) === 1 ? 'active' : 'inactive'" />
              <span class="text-sm">{{ role.permissions?.length || 0 }} permissions</span>
            </div>
          </div>
          <router-link v-if="auth.hasPermission('role.update') && !isProtectedRole(role)" :to="`/roles/${role.id}/edit`" class="btn btn-primary-600">
            <iconify-icon icon="ri:edit-line" class="me-6" /> Edit Role
          </router-link>
        </div>
      </div>
      <div v-for="group in grouped" :key="group.module" class="card radius-12 mb-16">
        <div class="card-header bg-base px-24 py-16"><h6 class="mb-0">{{ moduleLabel(group.module) }}</h6></div>
        <div class="card-body p-24">
          <div class="row g-3">
            <div v-for="permission in group.permissions" :key="permission.id" class="col-xl-4 col-md-6">
              <div class="border radius-8 p-16 h-100">
                <div class="fw-semibold">{{ permissionLabel(permission) }}</div>
                <div class="text-secondary-light text-xs mt-4">{{ permission.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-if="!role.permissions?.length" icon="ri:shield-keyhole-line" title="No permissions assigned" message="This role currently has no feature access." />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import roleService from '@/services/roleService'
import { useAuthStore } from '@/stores/auth'
import { isProtectedRole, moduleLabel, permissionLabel } from './rolePermissions'

const route = useRoute()
const auth = useAuthStore()
const role = ref(null)
const loading = ref(true)
const error = ref('')
const grouped = computed(() => {
  const groups = new Map()
  ;(role.value?.permissions || []).forEach((permission) => {
    if (!groups.has(permission.module)) groups.set(permission.module, [])
    groups.get(permission.module).push(permission)
  })
  return [...groups].map(([module, permissions]) => ({ module, permissions }))
})
onMounted(async () => {
  try {
    role.value = await roleService.getRole(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
