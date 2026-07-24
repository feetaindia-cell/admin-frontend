import api, { adminPath, buildQuery, unwrap } from './api'

const base = '/admin/payments'

export const getPayments = async (params = {}) => unwrap(await api.get(adminPath(base), { params: buildQuery(params) }))
export const getPayment = async (id) => unwrap(await api.get(adminPath(`${base}/${id}`)))
export const getStatistics = async () => unwrap(await api.get(adminPath(`${base}/statistics`)))
export const getTimeline = async (id) => unwrap(await api.get(adminPath(`${base}/${id}/timeline`)))
export const getInvoice = async (id) => unwrap(await api.get(adminPath(`${base}/${id}/invoice`)))
export const retrySync = async (id) => unwrap(await api.post(adminPath(`${base}/${id}/sync`)))
export const retryInvoiceSync = async (id) => unwrap(await api.post(adminPath(`${base}/${id}/invoice-sync`)))

export default { getPayments, getPayment, getStatistics, getTimeline, getInvoice, retrySync, retryInvoiceSync }
