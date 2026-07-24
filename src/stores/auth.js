import { defineStore } from 'pinia'
import authService from '@/services/authService'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/services/api'
import {
  hasAllPermissions as checkAllPermissions,
  hasAnyPermission as checkAnyPermission,
  hasPermission as checkPermission,
  isSuperAdmin as checkSuperAdmin,
  normalizePermissions,
} from '@/utils/permissions'

const ADMIN_KEY = 'feeta_admin'
const PERMISSIONS_KEY = 'feeta_admin_permissions'

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getAuthToken(),
    admin: readJson(ADMIN_KEY, null),
    permissions: readJson(PERMISSIONS_KEY, []),
    loading: false,
    sessionChecked: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    roleName: (state) => state.admin?.role?.name || state.admin?.role_name || state.admin?.role || 'Admin',
  },
  actions: {
    persist() {
      setAuthToken(this.token)
      if (this.admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(this.admin))
      else localStorage.removeItem(ADMIN_KEY)
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(this.permissions))
    },
    clear() {
      this.token = null
      this.admin = null
      this.permissions = []
      this.sessionChecked = false
      clearAuthToken()
      localStorage.removeItem(ADMIN_KEY)
      localStorage.removeItem(PERMISSIONS_KEY)
    },
    async login(credentials) {
      this.loading = true
      try {
        const result = await authService.login(credentials)
        if (!result.token) throw new Error('Login response did not include an access token.')
        this.token = result.token
        this.admin = result.admin || null
        this.permissions = normalizePermissions(result.permissions || result.admin?.permissions)
        this.persist()
        await this.loadProfile()
        await this.loadPermissions()
        this.sessionChecked = true
        return result
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        if (this.token) await authService.logout()
      } finally {
        this.clear()
      }
    },
    async loadProfile() {
      if (!this.token) return null
      this.admin = await authService.me()
      const profilePermissions = normalizePermissions(this.admin?.permissions)
      if (profilePermissions.length) this.permissions = profilePermissions
      this.persist()
      return this.admin
    },
    async loadPermissions() {
      if (!this.token) return []
      this.permissions = normalizePermissions(await authService.permissions())
      this.persist()
      return this.permissions
    },
    async updateProfile(payload) {
      if (!this.token) return null
      this.admin = await authService.updateProfile(payload)
      const profilePermissions = normalizePermissions(this.admin?.permissions)
      if (profilePermissions.length) this.permissions = profilePermissions
      this.persist()
      return this.admin
    },
    async refreshPermissions() {
      return this.loadPermissions()
    },
    async ensureSession() {
      if (!this.token) return false
      if (this.sessionChecked) return true

      try {
        await this.loadProfile()
        await this.loadPermissions()
        this.sessionChecked = true
        return true
      } catch (error) {
        if (error?.status === 401) {
          this.clear()
        }
        throw error
      }
    },
    hasPermission(permission) {
      if (!permission) return true
      if (this.isSuperAdmin()) return true
      return checkPermission(this.permissions, permission)
    },
    hasAnyPermission(permissions = []) {
      if (!permissions.length) return true
      if (this.isSuperAdmin()) return true
      return checkAnyPermission(this.permissions, permissions)
    },
    hasAllPermissions(permissions = []) {
      if (this.isSuperAdmin()) return true
      return checkAllPermissions(this.permissions, permissions)
    },
    isSuperAdmin() {
      return checkSuperAdmin(this.admin)
    },
  },
})
