import api, { adminPath, buildQuery, unwrap } from './api'

const base = '/admin/credits'

export const getWallets = async (params = {}) => unwrap(await api.get(adminPath(base), { params: buildQuery(params) }))
export const getStatistics = async () => unwrap(await api.get(adminPath(`${base}/statistics`)))
export const getWallet = async (agentId) => unwrap(await api.get(adminPath(`${base}/${agentId}`)))
export const getTransactions = async (agentId, params = {}) => unwrap(await api.get(adminPath(`${base}/${agentId}/transactions`), { params: buildQuery(params) }))
export const getManualTransfers = async (params = {}) => unwrap(await api.get(adminPath(`${base}/manual-transfers`), { params: buildQuery(params) }))
export const getManualTransfer = async (id) => unwrap(await api.get(adminPath(`${base}/manual-transfers/${id}`)))

function trim(value) {
  return String(value || '').trim()
}

function creditPayload(payload = {}) {
  const amount = Number(payload.amount ?? payload.credits)
  const reason = trim(payload.reason)
  const remarks = trim(payload.remarks)
  const description = [reason, remarks].filter(Boolean).join(': ')

  return {
    credits: amount,
    remarks: description || remarks,
    ...(payload.reference_id ? { reference_id: payload.reference_id } : {}),
  }
}

function rejectPayload(payload = {}) {
  const reason = trim(payload.reason)
  const remarks = trim(payload.remarks)
  return {
    remarks: [reason, remarks].filter(Boolean).join(': ') || remarks,
  }
}

export const approveTransfer = async (id, payload) => unwrap(await api.patch(adminPath(`${base}/manual-transfers/${id}/approve`), payload))
export const rejectTransfer = async (id, payload) => unwrap(await api.patch(adminPath(`${base}/manual-transfers/${id}/reject`), rejectPayload(payload)))
export const addCredits = async (agentId, payload) => unwrap(await api.post(adminPath(`${base}/${agentId}/add`), creditPayload(payload)))
export const deductCredits = async (agentId, payload) => unwrap(await api.post(adminPath(`${base}/${agentId}/deduct`), creditPayload(payload)))

export default { getWallets, getStatistics, getWallet, getTransactions, getManualTransfers, getManualTransfer, approveTransfer, rejectTransfer, addCredits, deductCredits }
