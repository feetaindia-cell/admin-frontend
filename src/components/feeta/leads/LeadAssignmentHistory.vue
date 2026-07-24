<template>
  <div class="history-list">
    <div v-if="items.length" class="table-responsive">
      <table class="table history-table mb-0">
        <thead><tr><th>Agent</th><th>Assigned By</th><th>Status</th><th>Notes</th><th>Assigned Date</th></tr></thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><div class="fw-semibold">{{ safeValue(item.agent?.name) }}</div><div class="history-meta"><span>{{ safeValue(item.agent?.phone) }}</span><span>{{ safeValue(item.agent?.email) }}</span></div></td>
            <td><div class="fw-medium">{{ safeValue(item.assigned_by_admin?.name) }}</div><div class="text-secondary-light text-xs">{{ safeValue(item.assigned_by_admin?.email) }}</div></td>
            <td><LeadStatusBadge :status="item.status" /></td>
            <td>{{ safeValue(item.notes) }}</td>
            <td>{{ formatDate(item.created_at, true) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState v-else icon="ri:history-line" title="No assignment history" message="Assignments will appear here after an agent is assigned." />
  </div>
</template>

<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
import LeadStatusBadge from './LeadStatusBadge.vue'
import { formatDate, safeValue } from '@/utils/finance'

defineProps({ items: { type: Array, default: () => [] } })
</script>

<style scoped>
.history-table{min-width:760px}.history-table th{padding:13px 16px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;background:#f8fafc;white-space:nowrap}.history-table td{padding:15px 16px;vertical-align:middle;border-color:#edf1f5;font-size:12px}.history-table tbody tr:last-child td{border-bottom:0}.history-table tbody tr:hover{background:#f8fbff}.history-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:3px;color:#7c889b;font-size:10px}.history-meta span+span::before{content:'/';margin-inline-end:6px;color:#c2cad5}:global([data-theme=dark]) .history-table th{background:#111827}:global([data-theme=dark]) .history-table td{border-color:#263244}
</style>
