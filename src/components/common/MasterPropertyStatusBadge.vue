<template>
  <span :class="['px-12 py-4 radius-4 fw-medium text-sm', badgeClass]">{{ status || '-' }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: { type: String, default: '' } })
const badgeClass = computed(() => ({
  Active: 'bg-success-focus text-success-600',
  Inactive: 'bg-warning-focus text-warning-600',
  Deleted: 'bg-danger-focus text-danger-600',
}[props.status] || 'bg-neutral-200 text-neutral-600'))
</script>
