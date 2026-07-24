import api, { adminPath, buildQuery, publicPath, unwrap } from './api'

export const getPolicyGroups = async () => unwrap(await api.get(adminPath('/admin/policies/groups')))

export const getPolicyGroupSections = async (policyType, params = {}) => unwrap(await api.get(
  adminPath(`/admin/policies/groups/${encodeURIComponent(policyType)}`),
  { params: buildQuery(params) },
))

export const getPolicySection = async (id) => unwrap(await api.get(adminPath(`/admin/policies/sections/${id}`)))

export const createPolicySection = async (policyType, payload) => unwrap(await api.post(
  adminPath(`/admin/policies/groups/${encodeURIComponent(policyType)}/sections`),
  payload,
))

export const updatePolicySection = async (id, payload) => unwrap(await api.put(adminPath(`/admin/policies/sections/${id}`), payload))
export const updatePolicySectionStatus = async (id, payload) => unwrap(await api.patch(adminPath(`/admin/policies/sections/${id}/status`), payload))
export const reorderPolicySections = async (policyType, payload) => unwrap(await api.patch(
  adminPath(`/admin/policies/groups/${encodeURIComponent(policyType)}/reorder`),
  payload,
))
export const deletePolicySection = async (id) => unwrap(await api.delete(adminPath(`/admin/policies/sections/${id}`)))
export const getPublicPolicy = async (policyType) => unwrap(await api.get(publicPath(`/policies/${encodeURIComponent(policyType)}`)))

export default {
  getPolicyGroups,
  getPolicyGroupSections,
  getPolicySection,
  createPolicySection,
  updatePolicySection,
  updatePolicySectionStatus,
  reorderPolicySections,
  deletePolicySection,
  getPublicPolicy,
}
