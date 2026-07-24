<template>
  <span :class="classes" class="status-badge   radius-20 fw-semibold text-xs text-capitalize">
    <iconify-icon :icon="icon" class="status-icon"></iconify-icon>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { statusIcon } from '@/utils/feetaIcons'

const props = defineProps({
  status: { type: String, default: '' },
})

const label = computed(() => props.status || 'unknown')
const icon = computed(() => statusIcon(props.status))
const classes = computed(() => {
  const status = String(props.status).toLowerCase()
  if (['active', 'published', 'verified', 'sold', 'rented', 'paid'].includes(status)) return 'is-success'
  if (['draft', 'pending', 'submitted', 'processing'].includes(status)) return 'is-warning'
  if (['blocked', 'rejected', 'failed', 'deleted'].includes(status)) return 'is-danger'
  if (['archived', 'inactive'].includes(status)) return 'is-muted'
  return 'bg-neutral-200 text-neutral-600 border border-neutral-400'
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  padding: 5px 11px;
  align-items: center;
  gap: 7px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.status-icon {
  font-size: 14px;
}

.is-success { color: #15803d; background: #ecfdf3; border-color: #bbf7d0; }
.is-warning { color: #a16207; background: #fffbeb; border-color: #fde68a; }
.is-danger { color: #b91c1c; background: #fff1f2; border-color: #fecdd3; }
.is-muted { color: #475569; background: #f1f5f9; border-color: #cbd5e1; }
</style>
