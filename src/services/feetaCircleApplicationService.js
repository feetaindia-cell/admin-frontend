import api, { adminPath, buildQuery, unwrap } from './api'

const base = '/admin/feeta-circle/applications'

function requireApplicationId(applicationId) {
  if (applicationId === null || applicationId === undefined || applicationId === '') {
    throw new Error('A valid application ID is required.')
  }
  return applicationId
}

export const list = async (params = {}) => unwrap(await api.get(adminPath(base), { params: buildQuery(params) }))
export const show = async (applicationId) => unwrap(await api.get(adminPath(`${base}/${requireApplicationId(applicationId)}`)))
export const review = async (applicationId, status) => unwrap(await api.patch(
  adminPath(`${base}/${requireApplicationId(applicationId)}/review`),
  { status },
))

export default { list, show, review }
