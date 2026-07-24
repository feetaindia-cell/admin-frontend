<template>
  <slot v-if="allowed" />
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  permission: { type: String, default: '' },
  permissions: { type: Array, default: () => [] },
})

const auth = useAuthStore()
const allowed = computed(() => {
  if (props.permission) return auth.hasPermission(props.permission)
  return auth.hasAnyPermission(props.permissions)
})
</script>
