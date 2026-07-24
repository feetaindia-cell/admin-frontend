import api, { adminPath, buildQuery, unwrap } from './api'

const base = '/admin/master-properties'
const getList = async (resource, params = {}) => unwrap(await api.get(adminPath(`${base}/${resource}`), { params: buildQuery(params) }))
const getOne = async (resource, id) => unwrap(await api.get(adminPath(`${base}/${resource}/${id}`)))
const createOne = async (resource, payload) => unwrap(await api.post(adminPath(`${base}/${resource}`), payload))
const updateOne = async (resource, id, payload) => unwrap(await api.put(adminPath(`${base}/${resource}/${id}`), payload))
const updateStatus = async (resource, id, status) => unwrap(await api.patch(adminPath(`${base}/${resource}/${id}/status`), { status }))
const removeOne = async (resource, id) => unwrap(await api.delete(adminPath(`${base}/${resource}/${id}`)))
const isFile = (value) => typeof File !== 'undefined' && value instanceof File
const appendIfPresent = (form, key, value) => {
  if (value === undefined || value === null || value === '') return
  form.append(key, value)
}

const componentJsonPayload = (payload = {}) => {
  const body = {}
  if (payload.child_id !== undefined && payload.child_id !== null && payload.child_id !== '') body.child_id = payload.child_id
  if (payload.name !== undefined && payload.name !== null) body.name = payload.name
  if (payload.status !== undefined && payload.status !== null && payload.status !== '') body.status = payload.status
  return body
}

const componentFormData = (payload = {}, method = null) => {
  const form = new FormData()
  if (method) form.append('_method', method)
  appendIfPresent(form, 'child_id', payload.child_id)
  appendIfPresent(form, 'name', payload.name)
  appendIfPresent(form, 'status', payload.status)
  if (isFile(payload.icon)) form.append('icon', payload.icon)
  if (payload.remove_icon === true) form.append('remove_icon', '1')
  return form
}

export const getTree = async () => unwrap(await api.get(adminPath(`${base}/tree`)))

export const getCategories = (params) => getList('categories', params)
export const getCategory = (id) => getOne('categories', id)
export const createCategory = (payload) => createOne('categories', payload)
export const updateCategory = (id, payload) => updateOne('categories', id, payload)
export const updateCategoryStatus = (id, status) => updateStatus('categories', id, status)
export const deleteCategory = (id) => removeOne('categories', id)

export const getChildren = (params) => getList('children', params)
export const getChild = (id) => getOne('children', id)
export const createChild = (payload) => createOne('children', payload)
export const updateChild = (id, payload) => updateOne('children', id, payload)
export const updateChildStatus = (id, status) => updateStatus('children', id, status)
export const deleteChild = (id) => removeOne('children', id)

export const getComponents = (params) => getList('components', params)
export const getComponent = (id) => getOne('components', id)
export const createComponent = async (payload) => {
  if (isFile(payload?.icon)) {
    return unwrap(await api.post(adminPath(`${base}/components`), componentFormData(payload)))
  }

  return createOne('components', componentJsonPayload(payload))
}
export const updateComponent = async (id, payload) => {
  const hasNewIcon = isFile(payload?.icon)
  const shouldRemoveIcon = payload?.remove_icon === true

  if (hasNewIcon || shouldRemoveIcon) {
    const form = componentFormData(payload, 'PUT')
    return unwrap(await api.post(adminPath(`${base}/components/${id}`), form))
  }

  return updateOne('components', id, componentJsonPayload(payload))
}
export const updateComponentStatus = (id, status) => updateStatus('components', id, status)
export const deleteComponent = (id) => removeOne('components', id)

export const getOptions = (params) => getList('options', params)
export const getOption = (id) => getOne('options', id)
export const createOption = (payload) => createOne('options', payload)
export const updateOption = (id, payload) => updateOne('options', id, payload)
export const updateOptionStatus = (id, status) => updateStatus('options', id, status)
export const deleteOption = (id) => removeOne('options', id)

export default {
  getTree,
  getCategories, getCategory, createCategory, updateCategory, updateCategoryStatus, deleteCategory,
  getChildren, getChild, createChild, updateChild, updateChildStatus, deleteChild,
  getComponents, getComponent, createComponent, updateComponent, updateComponentStatus, deleteComponent,
  getOptions, getOption, createOption, updateOption, updateOptionStatus, deleteOption,
}
