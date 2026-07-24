import api, { adminPath, buildQuery, publicPath, unwrap } from './api'

export const getSections = async (params = {}) => unwrap(await api.get(adminPath('/admin/faqs/sections'), { params: buildQuery(params) }))
export const getSection = async (id) => unwrap(await api.get(adminPath(`/admin/faqs/sections/${id}`)))
export const createSection = async (payload) => unwrap(await api.post(adminPath('/admin/faqs/sections'), payload))
export const updateSection = async (id, payload) => unwrap(await api.put(adminPath(`/admin/faqs/sections/${id}`), payload))
export const updateSectionStatus = async (id, payload) => unwrap(await api.patch(adminPath(`/admin/faqs/sections/${id}/status`), payload))
export const deleteSection = async (id) => unwrap(await api.delete(adminPath(`/admin/faqs/sections/${id}`)))

export const getItems = async (params = {}) => unwrap(await api.get(adminPath('/admin/faqs/items'), { params: buildQuery(params) }))
export const getItem = async (id) => unwrap(await api.get(adminPath(`/admin/faqs/items/${id}`)))
export const createItem = async (payload) => unwrap(await api.post(adminPath('/admin/faqs/items'), payload))
export const updateItem = async (id, payload) => unwrap(await api.put(adminPath(`/admin/faqs/items/${id}`), payload))
export const updateItemStatus = async (id, payload) => unwrap(await api.patch(adminPath(`/admin/faqs/items/${id}/status`), payload))
export const deleteItem = async (id) => unwrap(await api.delete(adminPath(`/admin/faqs/items/${id}`)))
export const reorderItems = async (payload) => unwrap(await api.patch(adminPath('/admin/faqs/items/reorder'), payload))

export const getFaqTree = async (params = {}) => unwrap(await api.get(adminPath('/admin/faqs/tree'), { params: buildQuery(params) }))
export const getPublicFaqs = async (params = {}) => unwrap(await api.get(publicPath('/faqs'), { params: buildQuery(params) }))
export const getPublicSections = async (params = {}) => unwrap(await api.get(publicPath('/faqs/sections'), { params: buildQuery(params) }))
export const getPublicSectionBySlug = async (slug) => unwrap(await api.get(publicPath(`/faqs/sections/${slug}`)))

export default {
  getSections, getSection, createSection, updateSection, updateSectionStatus, deleteSection,
  getItems, getItem, createItem, updateItem, updateItemStatus, deleteItem, reorderItems,
  getFaqTree, getPublicFaqs, getPublicSections, getPublicSectionBySlug,
}
