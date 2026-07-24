import api, { adminPath, buildQuery, unwrap } from './api'

const ALERTS_PATH = '/admin/alerts'

export async function list(params = {}) {
  return unwrap(await api.get(adminPath(ALERTS_PATH), { params: buildQuery(params) }))
}

export async function unreadCount() {
  return unwrap(await api.get(adminPath(`${ALERTS_PATH}/unread-count`), { metadata: { background: true } }))
}

export async function markRead(id) {
  return unwrap(await api.patch(adminPath(`${ALERTS_PATH}/${id}/read`)))
}

export default {
  list,
  unreadCount,
  markRead,
}
