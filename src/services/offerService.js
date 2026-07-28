import api, { adminPath, buildQuery, unwrap } from './api'

const base = '/admin/offers'

export const getOffers = async (params = {}) => unwrap(await api.get(adminPath(base), { params: buildQuery(params) }))
export const getOfferStatistics = async (params = {}) => unwrap(await api.get(adminPath(`${base}/statistics`), { params: buildQuery(params) }))

export default { getOffers, getOfferStatistics }
