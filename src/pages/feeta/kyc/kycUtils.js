export const statusLabel = (status) => {
  const value = String(status || '').replaceAll('_', ' ')
  return value ? value.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown'
}

export const statusClass = (status) => {
  const value = String(status || '').toLowerCase()
  if (value === 'verified') return 'bg-success-focus text-success-600 border border-success-200'
  if (['rejected'].includes(value)) return 'bg-danger-100 text-danger-600 border border-danger-200'
  if (['pending', 'submitted'].includes(value)) return 'bg-warning-100 text-warning-700 border border-warning-200'
  return 'bg-neutral-200 text-neutral-600 border border-neutral-400'
}

export const kycStatusParam = {
  pending: 'pending',
  submitted: 'submitted',
  verified: 'verified',
  rejected: 'rejected',
}

export function normalizeList(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data || []
  return { rows, meta: payload?.meta || { total: rows.length, current_page: 1, per_page: rows.length || 15 } }
}

export function agentName(item = {}) {
  return item.agent?.name || [item.agent?.first_name, item.agent?.last_name].filter(Boolean).join(' ') || `Agent #${item.agent_id || item.id}`
}
