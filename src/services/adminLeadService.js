import api, { adminPath, buildQuery, unwrap } from './api'

const leadBase = '/admin/leads'
const agentBase = '/admin/agents'

function requireLeadId(leadId) {
  if (leadId === null || leadId === undefined || leadId === '') {
    throw new Error('A valid lead ID is required.')
  }
  return leadId
}

export const getLeads = async (params = {}) => unwrap(await api.get(adminPath(leadBase), { params: buildQuery(params) }))
export const getLeadDetail = async (leadId) => unwrap(await api.get(adminPath(`${leadBase}/${requireLeadId(leadId)}`)))
export const getLeadAssignments = async (leadId) => unwrap(await api.get(adminPath(`${leadBase}/${requireLeadId(leadId)}/assignments`)))
export const getVerifiedAgents = async (params = {}) => unwrap(await api.get(adminPath(`${agentBase}/verified`), { params: buildQuery(params) }))
export const assignLeadAgent = async (leadId, payload) => unwrap(await api.post(adminPath(`${leadBase}/${requireLeadId(leadId)}/assign`), payload))
export const reassignLeadAgent = async (leadId, payload) => unwrap(await api.post(adminPath(`${leadBase}/${requireLeadId(leadId)}/reassign`), payload))
export const updateLeadStatus = async (leadId, payload) => unwrap(await api.patch(adminPath(`${leadBase}/${requireLeadId(leadId)}/status`), payload))

export default {
  getLeads,
  getLeadDetail,
  getLeadAssignments,
  getVerifiedAgents,
  assignLeadAgent,
  reassignLeadAgent,
  updateLeadStatus,
}
