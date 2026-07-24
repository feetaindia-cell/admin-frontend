import api, { adminPath, buildQuery, unwrap } from './api'

export async function list(params = {}) {
  return unwrap(await api.get(adminPath('/admin/roles'), { params: buildQuery(params) }))
}

export async function get(id) {
  return unwrap(await api.get(adminPath(`/admin/roles/${id}`)))
}

export async function create(payload) {
  return unwrap(await api.post(adminPath('/admin/roles'), payload))
}

export async function update(id, payload) {
  return unwrap(await api.put(adminPath(`/admin/roles/${id}`), payload))
}

export async function remove(id) {
  return unwrap(await api.delete(adminPath(`/admin/roles/${id}`)))
}

export async function syncPermissions(id, permission_ids) {
  return unwrap(await api.put(adminPath(`/admin/roles/${id}/permissions`), { permission_ids }))
}

export const getRoles = list
export const getRole = get
export const createRole = create
export const updateRole = update
export const deleteRole = remove
export const syncRolePermissions = syncPermissions

export default {
  list, get, create, update, remove, syncPermissions,
  getRoles, getRole, createRole, updateRole, deleteRole, syncRolePermissions,
}
