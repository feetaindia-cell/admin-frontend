import api, { buildQuery, publicPath, unwrap } from './api'

export async function getUsers(params = {}) {
  return unwrap(await api.get(publicPath('/users'), { params: buildQuery(params) }))
}

export async function getUser(id) {
  return unwrap(await api.get(publicPath(`/users/${id}`)))
}

export async function updateUser(id, payload) {
  return unwrap(await api.patch(publicPath(`/users/${id}`), payload))
}

export async function updateStatus(id, payload) {
  return unwrap(await api.patch(publicPath(`/users/${id}/status`), payload))
}

export async function updateVerification(id, payload) {
  return unwrap(await api.patch(publicPath(`/users/${id}/verification`), payload))
}

export async function deleteUser(id, payload = {}) {
  return unwrap(await api.delete(publicPath(`/users/${id}`), { data: payload }))
}

export default {
  getUsers,
  getUser,
  updateUser,
  updateStatus,
  updateVerification,
  deleteUser,
}
