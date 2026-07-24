import api, { adminPath, buildQuery, unwrap } from './api'

export async function list(params = {}) {
  return unwrap(await api.get(adminPath('/admin/admins'), { params: buildQuery(params) }))
}

export async function get(id) {
  return unwrap(await api.get(adminPath(`/admin/admins/${id}`)))
}

export async function create(payload) {
  return unwrap(await api.post(adminPath('/admin/admins'), payload))
}

export async function update(id, payload) {
  return unwrap(await api.put(adminPath(`/admin/admins/${id}`), payload))
}

export async function remove(id) {
  return unwrap(await api.delete(adminPath(`/admin/admins/${id}`)))
}

export async function updateStatus(id, status) {
  return unwrap(await api.patch(adminPath(`/admin/admins/${id}/status`), { status }))
}

export async function assignRole(id, role_id) {
  return unwrap(await api.patch(adminPath(`/admin/admins/${id}/role`), { role_id }))
}

export default { list, get, create, update, remove, updateStatus, assignRole }
