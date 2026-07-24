<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading admin..." />
    <div v-else-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <div v-else class="card radius-12">
      <div class="card-body p-24">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-24">
          <div>
            <h5 class="mb-4">{{ admin.name }}</h5>
            <p class="text-secondary-light mb-0">{{ admin.email }}</p>
          </div>
          <StatusBadge :status="admin.status" />
        </div>
        <div class="row gy-3">
          <div class="col-md-6"><strong>Phone:</strong> {{ admin.phone || '-' }}</div>
          <div class="col-md-6"><strong>Role:</strong> {{ admin.role?.name || admin.role_name || '-' }}</div>
          <div class="col-md-6"><strong>Last Login:</strong> {{ admin.last_login_at || '-' }}</div>
          <div class="col-md-6"><strong>Last IP:</strong> {{ admin.last_ip || '-' }}</div>
        </div>
        <div class="mt-24 d-flex gap-2">
          <router-link to="/admins" class="btn btn-outline-primary-600 d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:arrow-left-line"></iconify-icon>Back</router-link>
          <router-link v-if="auth.hasPermission('admin.update')" :to="`/admins/${admin.id}/edit`" class="btn btn-primary-600 d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:edit-line"></iconify-icon>Edit</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import adminService from '@/services/adminService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const admin = ref({})
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    admin.value = await adminService.get(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
