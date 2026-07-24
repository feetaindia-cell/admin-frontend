import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const SHOW_DELAY_MS = 260
const MIN_VISIBLE_MS = 360
const MAX_VISIBLE_MS = 8000
let sequence = 0

export const useLoadingStore = defineStore('loading', () => {
  const activeRequests = ref(0)
  const activeRoutes = ref(0)
  const visible = ref(false)
  const message = ref('Loading FEETA Admin...')
  const shownAt = ref(0)
  const requestIds = new Set()
  const routeIds = new Set()
  let showTimer = null
  let hideTimer = null
  let maximumTimer = null

  const hasWork = computed(() => activeRequests.value + activeRoutes.value > 0)
  const isLoading = computed(() => visible.value)

  function clearTimer(timer) {
    if (timer) window.clearTimeout(timer)
  }

  function syncCounts() {
    activeRequests.value = requestIds.size
    activeRoutes.value = routeIds.size
  }

  function notifyTimeout() {
    window.dispatchEvent(new CustomEvent('feeta:loading-timeout', {
      detail: { message: 'This is taking longer than expected.' },
    }))
  }

  function forceHide(notify = false) {
    requestIds.clear()
    routeIds.clear()
    syncCounts()
    clearTimer(showTimer)
    clearTimer(hideTimer)
    clearTimer(maximumTimer)
    showTimer = null
    hideTimer = null
    maximumTimer = null
    visible.value = false
    shownAt.value = 0
    if (notify) notifyTimeout()
  }

  function show() {
    showTimer = null
    if (!hasWork.value || visible.value) return
    visible.value = true
    shownAt.value = Date.now()
    clearTimer(maximumTimer)
    maximumTimer = window.setTimeout(() => forceHide(true), MAX_VISIBLE_MS)
  }

  function scheduleShow(nextMessage) {
    if (nextMessage) message.value = nextMessage
    clearTimer(hideTimer)
    hideTimer = null
    if (visible.value || showTimer) return
    showTimer = window.setTimeout(show, SHOW_DELAY_MS)
  }

  function scheduleHide() {
    if (hasWork.value) return
    clearTimer(showTimer)
    showTimer = null
    clearTimer(maximumTimer)
    maximumTimer = null
    const elapsed = Date.now() - shownAt.value
    const remaining = visible.value ? Math.max(0, MIN_VISIBLE_MS - elapsed) : 0
    clearTimer(hideTimer)
    hideTimer = window.setTimeout(() => {
      hideTimer = null
      if (!hasWork.value) {
        visible.value = false
        shownAt.value = 0
      }
    }, remaining)
  }

  function begin(collection, kind, nextMessage) {
    const id = `${kind}-${Date.now()}-${++sequence}`
    collection.add(id)
    syncCounts()
    scheduleShow(nextMessage)
    return id
  }

  function finish(collection, id) {
    if (id) collection.delete(id)
    else {
      const first = collection.values().next().value
      if (first) collection.delete(first)
    }
    syncCounts()
    scheduleHide()
  }

  function startRequest(nextMessage = 'Loading FEETA Admin...') {
    return begin(requestIds, 'request', nextMessage)
  }

  function finishRequest(id) {
    finish(requestIds, id)
  }

  function startRoute(nextMessage = 'Opening page...') {
    return begin(routeIds, 'route', nextMessage)
  }

  function finishRoute(id) {
    finish(routeIds, id)
  }

  function reset() {
    forceHide(false)
  }

  return { activeRequests, activeRoutes, hasWork, isLoading, message, startRequest, finishRequest, startRoute, finishRoute, reset }
})
