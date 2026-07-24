<template>
  <span :class="badgeClass" class="verification-badge">
    <iconify-icon :icon="badgeIcon" class="verification-icon"></iconify-icon>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { statusIcon } from '@/utils/feetaIcons'

const props = defineProps({
  status: { type: String, default: '' },
})

const normalized = computed(() => String(props.status || 'unknown').toLowerCase())
const label = computed(() => normalized.value.replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
const badgeIcon = computed(() => statusIcon(normalized.value))
const badgeClass = computed(() => {
  if (normalized.value === 'verified') return 'is-success'
  if (['pending', 'submitted'].includes(normalized.value)) return 'is-warning'
  if (normalized.value === 'rejected') return 'is-danger'
  return 'is-muted'
})
</script>

<style scoped>
.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.verification-icon { font-size: 14px; }
.is-success { color: #15803d; background: #ecfdf3; border-color: #bbf7d0; }
.is-warning { color: #a16207; background: #fffbeb; border-color: #fde68a; }
.is-danger { color: #b91c1c; background: #fff1f2; border-color: #fecdd3; }
.is-muted { color: #475569; background: #f1f5f9; border-color: #cbd5e1; }
</style>
