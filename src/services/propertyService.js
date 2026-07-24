import api, { adminPath, buildQuery, toFormData, unwrap } from './api'

const base = '/admin/properties'

export const getProperties = async (params = {}) => unwrap(await api.get(adminPath(base), { params: buildQuery(params) }))
export const getStatistics = async () => unwrap(await api.get(adminPath(`${base}/statistics`)))
export const getProperty = async (id) => unwrap(await api.get(adminPath(`${base}/${id}`)))
export const updateProperty = async (id, payload) => unwrap(await api.put(adminPath(`${base}/${id}`), payload))
export const updateStatus = async (id, payload) => unwrap(await api.patch(adminPath(`${base}/${id}/status`), payload))
export const updateApproval = async (id, payload) => unwrap(await api.patch(adminPath(`${base}/${id}/approval`), payload))
export const approveProperty = async (id, payload = {}) => unwrap(await api.patch(adminPath(`${base}/${id}/approve`), payload))
export const rejectProperty = async (id, payload) => unwrap(await api.patch(adminPath(`${base}/${id}/reject`), payload))
export const archiveProperty = async (id, payload = {}) => unwrap(await api.patch(adminPath(`${base}/${id}/archive`), payload))
export const featureProperty = async (id, payload) => unwrap(await api.patch(adminPath(`${base}/${id}/feature`), payload))
export const deleteProperty = async (id) => unwrap(await api.delete(adminPath(`${base}/${id}`)))
export const getPropertyMedia = async (id) => unwrap(await api.get(adminPath(`${base}/${id}/media`)))
export const uploadPropertyPhotos = async (id, files, payload = {}) => {
  const form = toFormData(payload)
  Array.from(files || []).forEach((file) => form.append('files[]', file))
  return unwrap(await api.post(adminPath(`${base}/${id}/media`), form, { headers: { 'Content-Type': 'multipart/form-data' } }))
}
export const updatePropertyPhoto = async (id, mediaId, payload) => unwrap(await api.patch(adminPath(`${base}/${id}/media/${mediaId}`), payload))
export const deletePropertyPhoto = async (id, mediaId) => unwrap(await api.delete(adminPath(`${base}/${id}/media/${mediaId}`)))
export const getPropertyAnalytics = async (id) => unwrap(await api.get(adminPath(`${base}/${id}/analytics`)))
export const getPropertyOwner = async (id) => unwrap(await api.get(adminPath(`${base}/${id}/owner`)))
export const getPropertyTimeline = async (id) => unwrap(await api.get(adminPath(`${base}/${id}/timeline`)))

export default { getProperties, getStatistics, getProperty, updateProperty, updateStatus, updateApproval, approveProperty, rejectProperty, archiveProperty, featureProperty, deleteProperty, getPropertyMedia, uploadPropertyPhotos, updatePropertyPhoto, deletePropertyPhoto, getPropertyAnalytics, getPropertyOwner, getPropertyTimeline }
