import api, { adminPath, buildQuery, publicPath, toFormData, unwrap } from './api'

const serializeNews = (payload) => {
  if (payload.featured_image instanceof File) {
    return toFormData(payload)
  }
  return payload
}

export async function list(params = {}) {
  return unwrap(await api.get(adminPath('/admin/news'), { params: buildQuery(params) }))
}

export async function latest(params = { per_page: 10 }) {
  return unwrap(await api.get(publicPath('/news'), { params: buildQuery(params) }))
}

export async function publicDetail(slug) {
  return unwrap(await api.get(publicPath(`/news/${slug}`)))
}

export async function get(id) {
  return unwrap(await api.get(adminPath(`/admin/news/${id}`)))
}

export async function create(payload) {
  return unwrap(await api.post(adminPath('/admin/news'), serializeNews(payload)))
}

export async function update(id, payload) {
  const body = serializeNews(payload)
  if (body instanceof FormData) {
    body.append('_method', 'PUT')
    return unwrap(await api.post(adminPath(`/admin/news/${id}`), body))
  }
  return unwrap(await api.put(adminPath(`/admin/news/${id}`), body))
}

export async function remove(id) {
  return unwrap(await api.delete(adminPath(`/admin/news/${id}`)))
}

export async function publish(id) {
  return unwrap(await api.patch(adminPath(`/admin/news/${id}/publish`)))
}

export async function archive(id) {
  return unwrap(await api.patch(adminPath(`/admin/news/${id}/archive`)))
}

export async function draft(id) {
  return unwrap(await api.patch(adminPath(`/admin/news/${id}/draft`)))
}

export default {
  list,
  latest,
  publicDetail,
  get,
  create,
  update,
  remove,
  publish,
  archive,
  draft,
}
