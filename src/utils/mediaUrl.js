const PUBLIC_MEDIA_URL = import.meta.env.VITE_PUBLIC_MEDIA_URL || ''
const ABSOLUTE_URL_RE = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i
const INLINE_URL_RE = /^(?:data|blob):/i
const UPLOAD_PATH_RE = /(?:^|\/)uploads?\//i
const NEWS_PATH_RE = /(?:^|\/)(?:storage\/(?:app\/public\/)?)?news\/(.+)$/i
const PROPERTY_PHOTO_PATH_RE = /(?:^|\/)(?:(?:storage\/)?property-media\/photos|uploads\/photos)\/(.+)$/i

function joinUrl(base, path) {
  if (!base) return path
  return `${base.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`
}

function pathnameFromUrl(value) {
  if (!ABSOLUTE_URL_RE.test(value)) return value

  try {
    return new URL(value).pathname
  } catch {
    return value
  }
}

function normalizeMediaPath(value, type = '') {
  const normalized = pathnameFromUrl(value).replace(/\\/g, '/').replace(/^\/+/, '')
  const normalizedType = String(type || '').toLowerCase()
  const newsMatch = normalized.match(NEWS_PATH_RE)
  const propertyPhotoMatch = normalized.match(PROPERTY_PHOTO_PATH_RE)
  const uploadMatch = normalized.match(UPLOAD_PATH_RE)

  if (newsMatch) {
    return `storage/news/${newsMatch[1].replace(/^\/+/, '')}`
  }

  if (propertyPhotoMatch) {
    return `uploads/photos/${propertyPhotoMatch[1].replace(/^\/+/, '')}`
  }

  if (normalizedType === 'news' && !normalized.includes('/')) {
    return `storage/news/${normalized}`
  }

  if (normalizedType === 'property' && !normalized.includes('/')) {
    return `uploads/photos/${normalized}`
  }

  if (uploadMatch) {
    return normalized.slice(uploadMatch.index).replace(/^\/+/, '')
  }

  return null
}

export function mediaUrl(value, fallback = '', type = '') {
  if (!value) return fallback

  const raw = String(value).trim()
  if (!raw) return fallback
  if (INLINE_URL_RE.test(raw)) return raw

  const mediaPath = normalizeMediaPath(raw, type)

  if (mediaPath) {
    return joinUrl(PUBLIC_MEDIA_URL, mediaPath)
  }

  if (ABSOLUTE_URL_RE.test(raw)) return raw

  return raw
}

export const newsMediaUrl = (value, fallback = '') => mediaUrl(value, fallback, 'news')
export const propertyMediaUrl = (value, fallback = '') => mediaUrl(value, fallback, 'property')

export default mediaUrl
