import api, { adminPath, buildQuery, unwrap } from './api'

export async function getAgents(params = {}) {
  return unwrap(await api.get(adminPath('/admin/agents'), { params: buildQuery(params) }))
}

export async function getAgent(id) {
  return unwrap(await api.get(adminPath(`/admin/agents/${id}`)))
}

export async function updateAgent(id, payload) {
  return unwrap(await api.put(adminPath(`/admin/agents/${id}`), payload))
}

export async function updateAgentStatus(id, payload) {
  return unwrap(await api.patch(adminPath(`/admin/agents/${id}/status`), payload))
}

export async function updateAgentVerification(id, payload) {
  return unwrap(await api.patch(adminPath(`/admin/agents/${id}/verification`), payload))
}

export async function getAgentProperties(agentId, params = {}) {
  return unwrap(await api.get(adminPath(`/admin/agents/${agentId}/properties`), { params: buildQuery(params) }))
}

export async function getAgentProperty(agentId, propertyId) {
  return unwrap(await api.get(adminPath(`/admin/agents/${agentId}/properties/${propertyId}`)))
}

export async function updateAgentProperty(agentId, propertyId, payload) {
  return unwrap(await api.put(adminPath(`/admin/agents/${agentId}/properties/${propertyId}`), payload))
}

export async function updateAgentPropertyStatus(agentId, propertyId, payload) {
  return unwrap(await api.patch(adminPath(`/admin/agents/${agentId}/properties/${propertyId}/status`), payload))
}

export async function deleteAgentProperty(agentId, propertyId) {
  return unwrap(await api.delete(adminPath(`/admin/agents/${agentId}/properties/${propertyId}`)))
}

export async function getAgentKyc(agentId) {
  return unwrap(await api.get(adminPath(`/admin/agents/${agentId}/kyc`)))
}

export async function getAgentWallet(agentId) {
  return unwrap(await api.get(adminPath(`/admin/agents/${agentId}/wallet`)))
}

export async function getAgentTransactions(agentId, params = {}) {
  return unwrap(await api.get(adminPath(`/admin/agents/${agentId}/transactions`), { params: buildQuery(params) }))
}

export async function getAgentActivity(agentId, params = {}) {
  return unwrap(await api.get(adminPath(`/admin/agents/${agentId}/activity`), { params: buildQuery(params) }))
}

export default {
  getAgents,
  getAgent,
  updateAgent,
  updateAgentStatus,
  updateAgentVerification,
  getAgentProperties,
  getAgentProperty,
  updateAgentProperty,
  updateAgentPropertyStatus,
  deleteAgentProperty,
  getAgentKyc,
  getAgentWallet,
  getAgentTransactions,
  getAgentActivity,
}
