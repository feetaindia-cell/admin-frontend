import api, { adminPath, unwrap } from './api'

const normalizeLogin = (payload) => {
  const token = payload?.token || payload?.access_token || payload?.plain_text_token || payload?.data?.token
  const admin = payload?.admin || payload?.user || payload?.data?.admin || payload?.data?.user || null
  const permissions = payload?.permissions || payload?.data?.permissions || admin?.permissions || []
  return { token, admin, permissions }
}

export async function login(credentials) {
  const payload = unwrap(await api.post(adminPath('/admin/auth/login'), credentials))
  return normalizeLogin(payload)
}

export async function logout() {
  return unwrap(await api.post(adminPath('/admin/auth/logout')))
}

export async function me() {
  const payload = unwrap(await api.get(adminPath('/admin/auth/profile')))
  return payload?.admin || payload?.user || payload
}

export async function updateProfile(payload) {
  const response = unwrap(await api.patch(adminPath('/admin/auth/profile'), payload))
  return response?.admin || response?.user || response
}

export async function profileLocationOptions(stateId = null) {
  return unwrap(await api.get(adminPath('/admin/auth/profile/location-options'), {
    params: stateId ? { state_id: stateId } : {},
  }))
}

export async function permissions() {
  const payload = unwrap(await api.get(adminPath('/admin/auth/me/permissions')))
  return payload?.permissions || payload || []
}

export default { login, logout, me, updateProfile, profileLocationOptions, permissions }
