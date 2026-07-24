import api, { adminPath, buildQuery, unwrap } from './api'

const base = '/admin/kyc'

export const getSubmissions = async (params = {}) => unwrap(await api.get(adminPath(base), { params: buildQuery(params) }))
export const getStatistics = async () => unwrap(await api.get(adminPath(`${base}/statistics`)))
export const getSubmission = async (id) => unwrap(await api.get(adminPath(`${base}/${id}`)))
export const getAgentKyc = async (agentId) => unwrap(await api.get(adminPath(`${base}/agents/${agentId}`)))
export const getHistory = async (id) => unwrap(await api.get(adminPath(`${base}/${id}/history`)))
export const approve = async (id, payload = {}) => unwrap(await api.patch(adminPath(`${base}/${id}/approve`), payload))
export const reject = async (id, payload) => unwrap(await api.patch(adminPath(`${base}/${id}/reject`), payload))
export const addRemark = async (id, payload) => unwrap(await api.post(adminPath(`${base}/${id}/remarks`), payload))

export default {
  getSubmissions,
  getStatistics,
  getSubmission,
  getAgentKyc,
  getHistory,
  approve,
  reject,
  addRemark,
}
