<template>
  <div class="dashboard-main-body">
<div v-if="error" class="alert alert-danger">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading permissions..." />
    <template v-else>
      <div v-for="group in groups" :key="group.module" class="card radius-12 mb-16">
        <div class="card-header bg-base px-24 py-16">
          <h6 class="mb-0">{{ moduleLabel(group.module) }} <span class="text-secondary-light text-sm">({{ group.permissions.length }})</span></h6>
        </div>
        <div class="card-body p-24">
          <div class="row g-3">
            <div v-for="permission in group.permissions" :key="permission.id" class="col-xl-4 col-md-6">
              <div class="border radius-8 p-16 h-100">
                <div class="fw-semibold">{{ permissionLabel(permission) }}</div>
                <div class="text-primary-600 text-xs mt-4">{{ permission.name }}</div>
                <div class="text-secondary-light text-sm mt-6">{{ permission.description || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmptyState v-if="!groups.length" icon="ri:shield-keyhole-line" title="No permissions found" message="No permission records are available." />
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import permissionService from '@/services/permissionService'
import { moduleLabel, normalizeList, permissionLabel } from '../roles/rolePermissions'

const groups = ref([])
const loading = ref(true)
const error = ref('')
onMounted(async () => {
  try {
    groups.value = normalizeList(await permissionService.getGroupedPermissions())
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
