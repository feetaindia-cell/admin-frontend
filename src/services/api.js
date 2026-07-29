import axios from 'axios'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@/stores/loading'

const TOKEN_KEY = 'feeta_admin_token'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const APP_BASE_URL = import.meta.env.BASE_URL || '/'
const ADMIN_BASE_RE = /\/admin\/?$/i
const isAdminBaseUrl = ADMIN_BASE_RE.test(API_BASE_URL)

if (import.meta.env.DEV) {
  console.debug('[api] Base URL:', API_BASE_URL)
}

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL environment variable.')
}

export class ApiError extends Error {
  constructor(message, response = null) {
    super(message)
    this.name = 'ApiError'
    this.status = response?.status
    this.data = response?.data
    this.errors = response?.data?.errors || {}
    this.field = response?.data?.field
    this.code = response?.data?.code || 'REQUEST_FAILED'
    this.errorCode = this.code
  }
}

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY)
export const setAuthToken = (token) => token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY)
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY)

function appRouteFromLocation() {
  const appBase = APP_BASE_URL.replace(/\/?$/, '/')
  const appBasePath = appBase.replace(/\/$/, '')
  const currentPath = `${window.location.pathname}${window.location.search}`
  return currentPath.startsWith(appBasePath)
    ? currentPath.slice(appBasePath.length) || '/'
    : currentPath
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

const errorToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
})

function apiMessageFrom(response, error) {
  const payload = response?.data
  if (payload && typeof payload === 'object' && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if (error?.code === 'ECONNABORTED') {
    return 'The request took too long. Please try again.'
  }

  if (!response) {
    return 'Unable to connect to the server. Please check your connection and try again.'
  }

  return 'Something went wrong. Please try again.'
}

function rejectApiResponse(response, error = null) {
  const message = apiMessageFrom(response, error)
  const apiError = new ApiError(message, response)

  if (response?.data?.success === false && message && response?.config?.metadata?.showErrorModal !== false) {
    errorToast.fire({
      icon: 'error',
      title: message,
    })
  }

  return Promise.reject(apiError)
}

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const loading = useLoadingStore()
  const globalLoading = config.metadata?.globalLoading !== false && config.metadata?.background !== true
  config.metadata = { ...(config.metadata || {}), globalLoading }
  if (globalLoading) {
    config.metadata.loadingId = loading.startRequest(config.metadata.loadingMessage || 'Loading FEETA Admin...')
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

api.interceptors.response.use(
  (response) => {
    if (response?.config?.metadata?.globalLoading) {
      const loading = useLoadingStore()
      loading.finishRequest(response.config.metadata.loadingId)
    }
    if (response?.data?.success === false) {
      return rejectApiResponse(response)
    }
    return response
  },
  (error) => {
    if (error?.config?.metadata?.globalLoading) {
      const loading = useLoadingStore()
      loading.finishRequest(error.config.metadata.loadingId)
    }
    const response = error.response

    if (response?.status === 401) {
      useLoadingStore().reset()
      clearAuthToken()
      localStorage.removeItem('feeta_admin')
      localStorage.removeItem('feeta_admin_permissions')
      const loginPath = `${APP_BASE_URL.replace(/\/?$/, '/')}sign-in`
      if (window.location.pathname !== loginPath) {
        window.location.assign(`${loginPath}?redirect=${encodeURIComponent(appRouteFromLocation())}`)
      }
    }

    return rejectApiResponse(response, error)
  },
)

export function adminPath(path) {
  if (!isAdminBaseUrl) return path
  return path.replace(/^\/admin(?=\/|$)/, '') || '/'
}

export function publicPath(path) {
  if (!isAdminBaseUrl) return path
  const publicBaseUrl = API_BASE_URL.replace(ADMIN_BASE_RE, '')
  return `${publicBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export function unwrap(response) {
  const payload = response?.data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    if ('meta' in payload || 'links' in payload || 'total' in payload) {
      return payload
    }
    return payload.data
  }
  return payload
}

export function buildQuery(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

export function toFormData(data) {
  const form = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    form.append(key, value)
  })
  return form
}

export default api
