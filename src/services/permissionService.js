import api, { adminPath, buildQuery, unwrap } from './api'

export async function list(params = {}) {
  return unwrap(await api.get(adminPath('/admin/permissions'), { params: buildQuery(params) }))
}

export const getPermissions = list
export const getGroupedPermissions = list

export default { list, getPermissions, getGroupedPermissions }
