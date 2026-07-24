import api, { adminPath, buildQuery, unwrap } from './api'

const getList = async (resource, params = {}) => unwrap(await api.get(adminPath(`/admin/${resource}`), { params: buildQuery(params) }))
const getOne = async (resource, id) => unwrap(await api.get(adminPath(`/admin/${resource}/${id}`)))
const createOne = async (resource, payload) => unwrap(await api.post(adminPath(`/admin/${resource}`), payload))
const updateOne = async (resource, id, payload) => unwrap(await api.put(adminPath(`/admin/${resource}/${id}`), payload))
const removeOne = async (resource, id) => unwrap(await api.delete(adminPath(`/admin/${resource}/${id}`)))
const restoreOne = async (resource, id) => unwrap(await api.patch(adminPath(`/admin/${resource}/${id}/restore`)))
const updateStatusOne = async (resource, id, status) => unwrap(await api.patch(adminPath(`/admin/${resource}/${id}/status`), { status }))

export const getCities = (params) => getList('cities', params)
export const getCity = (id) => getOne('cities', id)
export const createCity = (payload) => createOne('cities', payload)
export const updateCity = (id, payload) => updateOne('cities', id, payload)
export const deleteCity = (id) => removeOne('cities', id)
export const restoreCity = (id) => restoreOne('cities', id)
export const updateCityStatus = (id, status) => updateStatusOne('cities', id, status)
export const getStates = (params) => getList('states', params)
export const getState = (id) => getOne('states', id)
export const createState = (payload) => createOne('states', payload)
export const updateState = (id, payload) => updateOne('states', id, payload)
export const deleteState = (id) => removeOne('states', id)
export const restoreState = (id) => restoreOne('states', id)
export const updateStateStatus = (id, status) => updateStatusOne('states', id, status)

export const getLocalities = (params) => getList('localities', params)
export const getLocality = (id) => getOne('localities', id)
export const createLocality = (payload) => createOne('localities', payload)
export const updateLocality = (id, payload) => updateOne('localities', id, payload)
export const deleteLocality = (id) => removeOne('localities', id)
export const restoreLocality = (id) => restoreOne('localities', id)
export const updateLocalityStatus = (id, status) => updateStatusOne('localities', id, status)
export const getLocationStateOptions = async () => unwrap(await api.get(adminPath('/admin/states/options')))
export const getLocationCityOptions = async (params = {}) => unwrap(await api.get(adminPath('/admin/localities/cities'), { params: buildQuery(params) }))

export async function getAllCities(params = {}) {
  if (!Object.keys(params).length) return getLocationCityOptions()

  const firstPage = await getCities({ per_page: 100, sort_by: 'name', sort_direction: 'asc', ...params, page: 1 })
  const data = Array.isArray(firstPage) ? firstPage : firstPage?.data || []
  const lastPage = firstPage?.meta?.last_page || 1

  if (lastPage <= 1) return data

  const remaining = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => getCities({ per_page: 100, sort_by: 'name', sort_direction: 'asc', ...params, page: index + 2 })),
  )

  return [
    ...data,
    ...remaining.flatMap((page) => Array.isArray(page) ? page : page?.data || []),
  ]
}

export async function getAllStates(params = {}) {
  if (!Object.keys(params).length) return getLocationStateOptions()

  const firstPage = await getStates({ per_page: 100, sort_by: 'name', sort_direction: 'asc', ...params, page: 1 })
  const data = Array.isArray(firstPage) ? firstPage : firstPage?.data || []
  const lastPage = firstPage?.meta?.last_page || 1

  if (lastPage <= 1) return data

  const remaining = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => getStates({ per_page: 100, sort_by: 'name', sort_direction: 'asc', ...params, page: index + 2 })),
  )

  return [
    ...data,
    ...remaining.flatMap((page) => Array.isArray(page) ? page : page?.data || []),
  ]
}

export default {
  getStates,
  getState,
  createState,
  updateState,
  deleteState,
  restoreState,
  updateStateStatus,
  getCities,
  getCity,
  createCity,
  updateCity,
  deleteCity,
  restoreCity,
  updateCityStatus,
  getLocalities,
  getLocality,
  createLocality,
  updateLocality,
  deleteLocality,
  restoreLocality,
  updateLocalityStatus,
  getLocationStateOptions,
  getLocationCityOptions,
  getAllCities,
  getAllStates,
}
