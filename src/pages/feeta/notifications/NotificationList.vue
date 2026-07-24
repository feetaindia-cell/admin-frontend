<template>
  <div class="dashboard-main-body notification-page">
    <section class="notification-hero" aria-labelledby="notification-title">
      <span class="notification-hero__icon" aria-hidden="true">
        <iconify-icon icon="lucide:bell"></iconify-icon>
      </span>
      <div>
        <h1 id="notification-title">Notifications</h1>
        <p>{{ unreadCount }} unread alerts out of {{ total }} total.</p>
      </div>
    </section>

    <div v-if="error" class="notification-alert" role="alert">
      <iconify-icon icon="ri:error-warning-line"></iconify-icon>
      {{ error }}
    </div>

    <section class="notification-toolbar" aria-label="Notification controls">
      <label class="notification-control">
        <span>Show</span>
        <select v-model.number="filters.per_page" class="form-select" aria-label="Notifications per page" @change="loadNotifications(1)">
          <option v-for="size in [10, 15, 25, 50]" :key="size" :value="size">{{ size }} per page</option>
        </select>
      </label>

      <button type="button" class="notification-refresh" :disabled="loading" @click="loadNotifications(page)">
        <iconify-icon icon="ri:refresh-line"></iconify-icon>
        Refresh
      </button>
    </section>

    <section class="notification-list-card">
      <div v-if="loading" class="notification-skeleton-list" role="status" aria-live="polite" aria-busy="true">
        <article v-for="row in 5" :key="row" class="notification-skeleton-row">
          <span class="notification-skeleton notification-skeleton__icon"></span>
          <span class="notification-skeleton-block">
            <span class="notification-skeleton notification-skeleton__title"></span>
            <span class="notification-skeleton notification-skeleton__line"></span>
          </span>
          <span class="notification-skeleton notification-skeleton__badge"></span>
        </article>
      </div>

      <template v-else>
        <div v-if="notifications.length" class="notification-list">
          <article v-for="item in notifications" :key="notificationKey(item)" :class="['notification-item', { 'is-unread': !isRead(item) }]">
            <span class="notification-item__icon" aria-hidden="true">
              <iconify-icon :icon="typeIcon(item)"></iconify-icon>
            </span>

            <div class="notification-item__content">
              <div class="notification-item__header">
                <h2>{{ notificationTitle(item) }}</h2>
                <span :class="['notification-status', isRead(item) ? 'is-read' : 'is-new']">
                  {{ isRead(item) ? 'Read' : 'Unread' }}
                </span>
              </div>
              <p>{{ notificationBody(item) }}</p>
              <div class="notification-meta">
                <span v-if="item.type || item.alert_type || item.category">
                  <iconify-icon icon="ri:price-tag-3-line"></iconify-icon>
                  {{ titleCase(item.type || item.alert_type || item.category) }}
                </span>
                <span>
                  <iconify-icon icon="ri:time-line"></iconify-icon>
                  {{ formatDate(item.created_at || item.createdAt || item.date) }}
                </span>
              </div>
            </div>

            <button v-if="!isRead(item) && notificationId(item)" type="button" class="notification-read-btn" :disabled="actionId === notificationId(item)" @click="markAsRead(item)">
              <iconify-icon icon="ri:check-line"></iconify-icon>
              Mark read
            </button>
          </article>
        </div>

        <EmptyState
          v-else
          icon="lucide:bell-off"
          title="No notifications"
          message="There are no admin alerts to show right now."
          refresh-label="Refresh"
          @refresh="loadNotifications(1)"
        />

        <Pagination
          v-if="totalPages > 1 || total > notifications.length"
          :currentPage="page"
          :totalPages="totalPages"
          :startIndex="startIndex"
          :endIndex="endIndex"
          :totalItems="total"
          @page-changed="loadNotifications"
        />
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Pagination from '@/components/pagination/index.vue'
import notificationService from '@/services/notificationService'

const notifications = ref([])
const loading = ref(false)
const error = ref('')
const actionId = ref(null)
const page = ref(1)
const total = ref(0)
const unreadCount = ref(0)
const filters = reactive({ per_page: 10 })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / Number(filters.per_page))))
const startIndex = computed(() => total.value ? (page.value - 1) * Number(filters.per_page) : 0)
const endIndex = computed(() => Math.min(startIndex.value + notifications.value.length, total.value))

function normalize(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || payload?.alerts || payload?.notifications || []
  const meta = payload?.meta || {}
  return {
    items,
    total: meta.total ?? payload?.total ?? items.length,
    unread: meta.unread_count ?? payload?.unread_count ?? items.filter((item) => !isRead(item)).length,
  }
}

function notificationKey(item) {
  return notificationId(item) || `${item.type || 'alert'}-${item.created_at || item.title || item.message}`
}

function notificationId(item) {
  return item.id || item.alert_id || item.notification_id
}

function isRead(item) {
  if (item.is_read !== undefined) return Boolean(item.is_read)
  if (item.read !== undefined) return Boolean(item.read)
  return Boolean(item.read_at || item.readAt)
}

function notificationTitle(item) {
  return item.title || item.heading || item.subject || titleCase(item.type || item.alert_type || 'Notification')
}

function notificationBody(item) {
  return item.body || item.message || item.description || item.data?.message || 'No details available.'
}

function typeIcon(item) {
  const value = String(item.type || item.alert_type || item.category || '').toLowerCase()
  if (value.includes('lead')) return 'lucide:contact'
  if (value.includes('payment')) return 'lucide:credit-card'
  if (value.includes('property') || value.includes('listing')) return 'lucide:building-2'
  if (value.includes('news')) return 'lucide:newspaper'
  return 'lucide:bell'
}

function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Notification'
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function loadNotifications(nextPage = 1) {
  loading.value = true
  error.value = ''
  page.value = nextPage
  try {
    const result = normalize(await notificationService.list({ page: nextPage, per_page: filters.per_page }))
    notifications.value = result.items
    total.value = result.total
    unreadCount.value = result.unread
  } catch (err) {
    notifications.value = []
    total.value = 0
    unreadCount.value = 0
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function markAsRead(item) {
  const id = notificationId(item)
  if (!id) return
  actionId.value = id
  try {
    await notificationService.markRead(id)
    await loadNotifications(page.value)
  } catch (err) {
    error.value = err.message
  } finally {
    actionId.value = null
  }
}

onMounted(loadNotifications)
</script>

<style scoped>
.notification-page {
  --notification-primary: #2563eb;
  --notification-ink: #0f172a;
  --notification-muted: #64748b;
  --notification-line: #e2e8f0;
  background: #f6f8fc;
}

.notification-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.notification-hero__icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  flex: 0 0 46px;
  border: 1px solid #dbeafe;
  border-radius: 50%;
  color: var(--notification-primary);
  background: #eff6ff;
  font-size: 22px;
}

.notification-hero h1 {
  margin: 0;
  color: var(--notification-ink);
  font-size: 24px;
  font-weight: 750;
  letter-spacing: 0;
}

.notification-hero p {
  margin: 4px 0 0;
  color: var(--notification-muted);
  font-size: 14px;
}

.notification-alert {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  color: #b91c1c;
  background: #fff1f2;
  font-size: 14px;
  font-weight: 650;
}

.notification-toolbar,
.notification-list-card {
  border: 1px solid rgba(148, 163, 184, .24);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, .055);
}

.notification-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px;
}

.notification-control {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
  margin: 0;
}

.notification-control span {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.notification-control .form-select {
  min-height: 40px;
  border-color: var(--notification-line);
  border-radius: 10px;
  font-size: 14px;
}

.notification-refresh,
.notification-read-btn {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 750;
  transition: transform .15s ease, background-color .15s ease, border-color .15s ease;
}

.notification-refresh {
  padding: 0 14px;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  background: #eff6ff;
}

.notification-refresh:hover:not(:disabled),
.notification-read-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.notification-list-card {
  padding: 8px;
}

.notification-list {
  display: grid;
  gap: 8px;
}

.notification-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid #e8edf4;
  border-radius: 12px;
  background: #fff;
}

.notification-item.is-unread {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.notification-item__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--notification-primary);
  background: #eff6ff;
  font-size: 19px;
}

.notification-item__content {
  min-width: 0;
}

.notification-item__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.notification-item h2 {
  margin: 0;
  color: var(--notification-ink);
  font-size: 15px;
  font-weight: 750;
  letter-spacing: 0;
}

.notification-item p {
  margin: 5px 0 7px;
  color: #475569;
  font-size: 13px;
  line-height: 1.45;
}

.notification-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--notification-muted);
  font-size: 12px;
  font-weight: 650;
}

.notification-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.notification-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.notification-status.is-new {
  color: #1d4ed8;
  background: #dbeafe;
}

.notification-status.is-read {
  color: #475569;
  background: #f1f5f9;
}

.notification-read-btn {
  padding: 0 12px;
  border: 1px solid #bbf7d0;
  color: #15803d;
  background: #ecfdf3;
}

.notification-read-btn:disabled,
.notification-refresh:disabled {
  cursor: not-allowed;
  opacity: .65;
}

.notification-skeleton-list {
  display: grid;
  gap: 8px;
}

.notification-skeleton-row {
  display: grid;
  grid-template-columns: 42px 1fr 90px;
  gap: 12px;
  align-items: center;
  padding: 14px;
}

.notification-skeleton-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-skeleton {
  display: block;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf1f7 20%, #f8fafc 45%, #e8eef6 70%);
  background-size: 240% 100%;
  animation: notification-shimmer 1.25s ease-in-out infinite;
}

.notification-skeleton__icon {
  width: 42px;
  height: 42px;
}

.notification-skeleton__title {
  width: 48%;
  height: 14px;
}

.notification-skeleton__line {
  width: 86%;
  height: 11px;
}

.notification-skeleton__badge {
  width: 84px;
  height: 28px;
}

@keyframes notification-shimmer {
  to { background-position: -240% 0; }
}

@media (max-width: 767px) {
  .notification-item {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .notification-read-btn {
    grid-column: 1 / -1;
    width: 100%;
  }

  .notification-toolbar > * {
    width: 100%;
  }
}
</style>
