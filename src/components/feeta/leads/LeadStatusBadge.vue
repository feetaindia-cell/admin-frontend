<template>
  <span :class="classes" class="lead-status-badge">
    <iconify-icon :icon="icon" />
    {{ titleCase(status || 'unknown') }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { titleCase } from '@/utils/finance'

const props = defineProps({
  status: { type: String, default: '' },
  overdue: { type: Boolean, default: false },
})

const normalized = computed(() => String(props.status || '').toLowerCase())
const icon = computed(() => {
  if (props.overdue) return 'lucide:alarm-clock'
  if (normalized.value === 'completed') return 'lucide:circle-check'
  if (normalized.value === 'assigned') return 'lucide:user-check'
  if (normalized.value === 'in_progress') return 'lucide:loader-circle'
  if (['cancelled', 'expired'].includes(normalized.value)) return 'lucide:circle-x'
  return 'lucide:clock-3'
})
const classes = computed(() => {
  if (props.overdue) return 'is-danger'
  if (normalized.value === 'pending') return 'is-warning'
  if (normalized.value === 'assigned') return 'is-info'
  if (normalized.value === 'in_progress') return 'is-primary'
  if (normalized.value === 'completed') return 'is-success'
  if (['cancelled', 'expired'].includes(normalized.value)) return 'is-danger'
  return 'is-muted'
})
</script>

<style scoped>
.lead-status-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border:1px solid transparent;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;text-transform:capitalize}.is-warning{color:#a16207;background:#fffbeb;border-color:#fde68a}.is-info{color:#0369a1;background:#f0f9ff;border-color:#bae6fd}.is-primary{color:#315ed1;background:#edf3ff;border-color:#c7d7fe}.is-success{color:#15803d;background:#ecfdf3;border-color:#bbf7d0}.is-danger{color:#b91c1c;background:#fff1f2;border-color:#fecdd3}.is-muted{color:#475569;background:#f1f5f9;border-color:#cbd5e1}
</style>
