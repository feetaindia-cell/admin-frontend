<template>
  <div class="dashboard-main-body news-list-page">
    <section class="news-hero" aria-labelledby="news-list-title">
      <div class="news-hero__title">
        <span class="news-hero__icon" aria-hidden="true">
          <iconify-icon icon="ri:newspaper-line"></iconify-icon>
        </span>
        <div>
          <h1 id="news-list-title">News Management</h1>
          <p>Create, publish, organize and manage platform news and announcements.</p>
        </div>
      </div>
    </section>

    <div v-if="error" class="news-alert" role="alert">
      <iconify-icon icon="ri:error-warning-line"></iconify-icon>
      {{ error }}
    </div>

    <section class="news-toolbar-card" aria-label="News filters">
      <div class="news-toolbar">
        <label class="news-control news-control--entries">
          <span>Show</span>
          <select v-model="filters.per_page" class="form-select" aria-label="Show entries" @change="fetchNews(1)">
            <option v-for="n in [10, 15, 20]" :key="n" :value="n">{{ n }} entries</option>
          </select>
        </label>

        <form class="news-search" role="search" @submit.prevent="fetchNews(1)">
          <iconify-icon icon="ri:search-line" aria-hidden="true"></iconify-icon>
          <input v-model="filters.search" type="search" placeholder="Search by title, description or keyword..." aria-label="Search news" />
          <button v-if="filters.search" type="button" class="news-search__clear" aria-label="Clear search" @click="filters.search = ''">
            <iconify-icon icon="ri:close-line"></iconify-icon>
          </button>
        </form>

        <label class="news-control">
          <span>Status</span>
          <select v-model="filters.status" class="form-select" aria-label="Filter by status" @change="fetchNews(1)">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label class="news-control">
          <span>Visibility</span>
          <select v-model="filters.visibility" class="form-select" aria-label="Filter by visibility" @change="fetchNews(1)">
            <option value="">All visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>

        <router-link v-if="auth.hasPermission('news.create')" to="/news/create" class="news-add-btn" aria-label="Add news">
          <iconify-icon icon="ri:add-line"></iconify-icon>
          Add News
        </router-link>
      </div>
      <div v-if="loading" class="news-toolbar-skeleton" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
    </section>

    <section class="news-data-card">
      <div v-if="loading" class="news-skeleton-list" role="status" aria-live="polite" aria-busy="true">
        <article v-for="row in 5" :key="row" class="news-skeleton-row">
          <span class="news-skeleton news-skeleton__image"></span>
          <span class="news-skeleton-block">
            <span class="news-skeleton news-skeleton__title"></span>
            <span class="news-skeleton news-skeleton__line"></span>
            <span class="news-skeleton news-skeleton__meta"></span>
          </span>
          <span class="news-skeleton news-skeleton__badge"></span>
          <span class="news-skeleton news-skeleton__badge"></span>
          <span class="news-skeleton-actions">
            <span class="news-skeleton news-skeleton__button"></span>
            <span class="news-skeleton news-skeleton__button"></span>
            <span class="news-skeleton news-skeleton__button"></span>
          </span>
        </article>
      </div>

      <template v-else>
        <div v-if="posts.length" class="news-table-wrap">
          <table class="news-table">
            <thead>
              <tr>
                <th scope="col">S.L</th>
                <th scope="col">News</th>
                <th scope="col">Visibility</th>
                <th scope="col" class="text-center">Status</th>
                <th scope="col" class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(post, index) in posts" :key="post.id" class="manage-row">
                <td class="news-index">{{ startIndex + index + 1 }}</td>
                <td>
                  <div class="news-content-cell">
                    <img v-if="newsImage(post)" :src="newsImage(post)" class="news-thumb" :alt="`${post.title || 'News'} thumbnail`" />
                    <span v-else class="news-thumb news-thumb--empty" aria-hidden="true">
                      <iconify-icon icon="ri:image-line"></iconify-icon>
                    </span>
                    <div class="news-info">
                      <div class="news-title-row">
                        <h2>{{ post.title || 'Untitled news' }}</h2>
                        <span v-if="post.category?.name || post.category_name" class="news-category">{{ post.category?.name || post.category_name }}</span>
                      </div>
                      <p>{{ newsDescription(post) }}</p>
                      <span class="news-date">
                        <iconify-icon icon="ri:calendar-line"></iconify-icon>
                        {{ newsDate(post) }}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['news-visibility-badge', visibilityMeta(post.visibility).class]">
                    <iconify-icon :icon="visibilityMeta(post.visibility).icon"></iconify-icon>
                    {{ visibilityMeta(post.visibility).label }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="['news-status-badge', statusMeta(post.status).class]">
                    <iconify-icon :icon="statusMeta(post.status).icon"></iconify-icon>
                    {{ statusMeta(post.status).label }}
                  </span>
                </td>
                <td class="manage-cell">
                  <button type="button" class="manage-row-button" @click="openManage(post)"><iconify-icon icon="lucide:settings" /> Manage</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="news-mobile-list">
            <article v-for="post in posts" :key="`mobile-${post.id}`" class="news-mobile-card" title="Manage" @click="openManage(post)">
              <div class="news-mobile-card__media">
                <img v-if="newsImage(post)" :src="newsImage(post)" class="news-thumb" :alt="`${post.title || 'News'} thumbnail`" />
                <span v-else class="news-thumb news-thumb--empty" aria-hidden="true">
                  <iconify-icon icon="ri:image-line"></iconify-icon>
                </span>
                <div>
                  <h2>{{ post.title || 'Untitled news' }}</h2>
                  <span class="news-date">
                    <iconify-icon icon="ri:calendar-line"></iconify-icon>
                    {{ newsDate(post) }}
                  </span>
                </div>
              </div>
              <p>{{ newsDescription(post) }}</p>
              <div class="news-mobile-card__badges">
                <span :class="['news-status-badge', statusMeta(post.status).class]">
                  <iconify-icon :icon="statusMeta(post.status).icon"></iconify-icon>
                  {{ statusMeta(post.status).label }}
                </span>
                <span :class="['news-visibility-badge', visibilityMeta(post.visibility).class]">
                  <iconify-icon :icon="visibilityMeta(post.visibility).icon"></iconify-icon>
                  {{ visibilityMeta(post.visibility).label }}
                </span>
              </div>
            </article>
          </div>
        </div>

        <EmptyState
          v-else
          icon="ri:newspaper-line"
          :title="filters.search ? 'No News Found' : 'No News Found'"
          :message="filters.search ? 'No news articles match your search.' : 'Create your first news article to keep users informed.'"
          :action-label="auth.hasPermission('news.create') ? 'Create News' : ''"
          :action-to="auth.hasPermission('news.create') ? '/news/create' : ''"
          action-icon="ri:add-line"
        />

        <Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="fetchNews" />
      </template>
    </section>
    <RowManageDialog v-model="manageOpen" :title="selectedPost?.title || 'Untitled news'" :subtitle="selectedPost ? statusMeta(selectedPost.status).label : ''">
      <router-link v-if="selectedPost" :to="`/news/${selectedPost.id}`"><iconify-icon icon="majesticons:eye-line" /> View details</router-link>
      <router-link v-if="selectedPost && auth.hasPermission('news.update')" :to="`/news/${selectedPost.id}/edit`"><iconify-icon icon="ri:edit-line" /> Edit news</router-link>
      <button v-if="selectedPost && auth.hasPermission('news.publish') && selectedPost.status !== 'published'" type="button" :disabled="actionId === selectedPost.id" @click="changeStatus(selectedPost, 'publish')"><iconify-icon icon="ri:send-plane-line" /> Publish</button>
      <button v-if="selectedPost && auth.hasPermission('news.archive') && selectedPost.status !== 'archived'" type="button" :disabled="actionId === selectedPost.id" @click="changeStatus(selectedPost, 'archive')"><iconify-icon icon="ri:archive-line" /> Archive</button>
      <button v-if="selectedPost && auth.hasPermission('news.update') && selectedPost.status !== 'draft'" type="button" :disabled="actionId === selectedPost.id" @click="changeStatus(selectedPost, 'draft')"><iconify-icon icon="ri:draft-line" /> Move to draft</button>
      <button v-if="selectedPost && auth.hasPermission('news.delete')" type="button" class="text-danger" :disabled="actionId === selectedPost.id" @click="deletePost(selectedPost)"><iconify-icon icon="ri:delete-bin-line" /> Delete news</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import Pagination from '@/components/pagination/index.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import newsService from '@/services/newsService'
import { useAuthStore } from '@/stores/auth'
import { newsMediaUrl } from '@/utils/mediaUrl'

const auth = useAuthStore()
const route = useRoute()
const posts = ref([])
const loading = ref(false)
const error = ref('')
const actionId = ref(null)
const manageOpen = ref(false)
const selectedPost = ref(null)
const page = ref(1)
const total = ref(0)
const filters = reactive({ search: String(route.query.search || ''), status: '', visibility: '', per_page: 10 })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / Number(filters.per_page))))
const startIndex = computed(() => total.value ? (page.value - 1) * Number(filters.per_page) : 0)
const endIndex = computed(() => Math.min(startIndex.value + posts.value.length, total.value))

function normalize(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || []
  return { items, total: payload?.meta?.total ?? payload?.total ?? items.length }
}

function newsImage(post) {
  return newsMediaUrl(post.thumbnail_url || post.thumbnail || post.featured_image_url || post.featured_image || post.image_url || post.image || '')
}

function newsDescription(post) {
  return post.short_description || post.excerpt || post.description || 'No description available.'
}

function newsDate(post) {
  const value = post.published_at || post.publish_date || post.created_at || post.updated_at
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function statusMeta(status) {
  const value = String(status || 'draft').toLowerCase()
  if (value === 'published') return { label: 'Published', icon: 'ri:check-line', class: 'is-published' }
  if (value === 'archived') return { label: 'Archived', icon: 'ri:archive-line', class: 'is-archived' }
  if (value === 'scheduled') return { label: 'Scheduled', icon: 'ri:calendar-schedule-line', class: 'is-scheduled' }
  return { label: value || 'Draft', icon: 'ri:draft-line', class: 'is-draft' }
}

function visibilityMeta(visibility) {
  const value = String(visibility || 'private').toLowerCase()
  if (value === 'public') return { label: 'Public', icon: 'ri:global-line', class: 'is-public' }
  if (value === 'featured') return { label: 'Featured', icon: 'ri:sparkling-line', class: 'is-featured' }
  if (value === 'internal') return { label: 'Internal', icon: 'ri:building-2-line', class: 'is-internal' }
  return { label: value || 'Private', icon: 'ri:lock-line', class: 'is-private' }
}

function openManage(post) {
  selectedPost.value = post
  manageOpen.value = true
}

async function fetchNews(nextPage = 1) {
  loading.value = true
  error.value = ''
  try {
    page.value = nextPage
    const payload = normalize(await newsService.list({ ...filters, page: nextPage }))
    posts.value = payload.items
    total.value = payload.total
  } catch (err) {
    posts.value = []
    total.value = 0
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function changeStatus(post, action) {
  const labels = { publish: 'Publish', archive: 'Archive', draft: 'Move to draft' }
  const helperText = action === 'publish' ? 'Publishing may notify users/agents.' : post.title
  const result = await Swal.fire({ title: `${labels[action]} news?`, text: helperText, icon: action === 'publish' ? 'warning' : 'question', showCancelButton: true, confirmButtonText: labels[action] })
  if (!result.isConfirmed) return
  actionId.value = post.id
  try {
    await newsService[action](post.id)
    await Swal.fire({ icon: 'success', title: `${labels[action]} complete`, timer: 1200, showConfirmButton: false })
    await fetchNews(page.value)
  } catch (err) {
    await Swal.fire(`${labels[action]} failed`, err.message, 'error')
  } finally {
    actionId.value = null
  }
}

async function deletePost(post) {
  const result = await Swal.fire({ title: 'Delete news?', text: post.title, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' })
  if (!result.isConfirmed) return
  actionId.value = post.id
  try {
    await newsService.remove(post.id)
    await Swal.fire({ icon: 'success', title: 'News deleted', timer: 1200, showConfirmButton: false })
    await fetchNews(page.value)
  } catch (err) {
    await Swal.fire('Delete failed', err.message, 'error')
  } finally {
    actionId.value = null
  }
}

watch(() => filters.search, () => fetchNews(1))
watch(() => route.query.search, (value) => {
  const nextSearch = String(value || '')
  if (nextSearch !== filters.search) filters.search = nextSearch
})
onMounted(fetchNews)
</script>

<style scoped>
.news-list-page {
  --news-primary: #487fff;
  --news-primary-dark: #2f65e9;
  --news-bg: #f6f8fc;
  --news-text: #111827;
  --news-muted: #64748b;
  --news-border: rgba(148, 163, 184, .2);
  --news-shadow: 0 18px 48px rgba(15, 23, 42, .075);
  background: var(--news-bg);
}

.news-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  animation: news-in .22s ease both;
}

.news-hero__title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.news-hero__icon {
  width: 52px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 52px;
  border: 1px solid rgba(72, 127, 255, .16);
  border-radius: 50%;
  color: var(--news-primary);
  background: linear-gradient(145deg, #ffffff, #eef4ff);
  box-shadow: 0 12px 28px rgba(72, 127, 255, .13);
}

.news-hero__icon iconify-icon { font-size: 26px; }
.news-hero h1 {
  margin: 0;
  color: var(--news-text);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: 0;
}

.news-hero p {
  margin: 7px 0 0;
  color: var(--news-muted);
  font-size: 15px;
}

.news-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #fecdd3;
  border-radius: 14px;
  color: #b91c1c;
  background: #fff1f2;
  font-size: 14px;
  font-weight: 600;
}

.news-toolbar-card,
.news-data-card {
  border: 1px solid var(--news-border);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--news-shadow);
}

.news-toolbar-card {
  margin-bottom: 20px;
  padding: 18px;
}

.news-toolbar {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 14px;
}

.news-control {
  display: flex;
  flex: 0 1 168px;
  flex-direction: column;
  gap: 7px;
  min-width: 148px;
  margin: 0;
}

.news-control--entries { flex-basis: 142px; min-width: 132px; }
.news-control span {
  color: #475569;
  font-size: 13px;
  font-weight: 650;
}

.news-control .form-select {
  min-height: 48px;
  border-color: #e2e8f0;
  border-radius: 14px;
  color: #334155;
  background-color: #fff;
  font-size: 14px;
}

.news-search {
  position: relative;
  flex: 2.4 1 390px;
  min-width: 280px;
}

.news-search > iconify-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  color: #94a3b8;
  font-size: 18px;
  transform: translateY(-50%);
}

.news-search input {
  width: 100%;
  min-height: 48px;
  padding: 0 50px 0 46px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  color: #1f2937;
  background: #fff;
  font-size: 14px;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.news-search input:focus {
  border-color: rgba(72, 127, 255, .7);
  box-shadow: 0 0 0 4px rgba(72, 127, 255, .14);
  outline: 0;
}

.news-search__clear {
  position: absolute;
  right: 7px;
  top: 50%;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 11px;
  color: #64748b;
  background: transparent;
  transform: translateY(-50%);
  transition: color .18s ease, background-color .18s ease;
}

.news-search__clear:hover {
  color: var(--news-primary);
  background: #f1f5f9;
}

.news-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 48px;
  margin-left: auto;
  padding: 0 20px;
  border: 0;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, var(--news-primary), var(--news-primary-dark));
  box-shadow: 0 12px 26px rgba(72, 127, 255, .28);
  font-size: 14px;
  font-weight: 700;
  transition: transform .18s ease, box-shadow .18s ease;
}

.news-add-btn:hover {
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(72, 127, 255, .34);
}

.news-toolbar-skeleton {
  display: grid;
  grid-template-columns: 140px minmax(240px, 1fr) 160px 160px;
  gap: 14px;
  margin-top: 16px;
}

.news-data-card { padding: 8px; }

.news-table-wrap {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
}

.news-table {
  width: 100%;
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgba(226, 232, 240, .9);
  border-radius: 18px;
  background: #fff;
}

.news-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 16px 18px;
  border-bottom: 1px solid #e8edf4;
  color: #334155;
  background: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.news-table tbody td {
  padding: 18px;
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
}

.news-table tbody tr {
  transition: background-color .18s ease;
}

.news-table tbody tr:hover { background: rgba(72, 127, 255, .055); }
.news-table tbody tr:last-child td { border-bottom: 0; }
.news-index {
  color: #64748b;
  font-weight: 700;
}

.news-content-cell {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.news-thumb {
  width: 80px;
  height: 80px;
  flex: 0 0 80px;
  border: 1px solid rgba(226, 232, 240, .9);
  border-radius: 16px;
  object-fit: cover;
  background: #f8fafc;
  box-shadow: 0 10px 22px rgba(15, 23, 42, .08);
}

.news-thumb--empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: linear-gradient(145deg, #f8fafc, #eef4ff);
  font-size: 28px;
}

.news-info { min-width: 0; max-width: 620px; }
.news-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.news-info h2,
.news-mobile-card h2 {
  margin: 0;
  color: #111827;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 750;
  letter-spacing: 0;
}

.news-info p,
.news-mobile-card p {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  color: #64748b;
  font-size: 14px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.news-category {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 4px 9px;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #1d4ed8;
  background: #eff6ff;
  font-size: 12px;
  font-weight: 700;
}

.news-date {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 13px;
  font-weight: 650;
}

.news-date iconify-icon { color: #94a3b8; font-size: 16px; }

.news-status-badge,
.news-visibility-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 6px 11px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  animation: news-badge-in .18s ease both;
}

.news-status-badge iconify-icon,
.news-visibility-badge iconify-icon { font-size: 15px; }
.news-status-badge.is-published { color: #15803d; background: #ecfdf3; border-color: #bbf7d0; }
.news-status-badge.is-draft { color: #475569; background: #f1f5f9; border-color: #cbd5e1; }
.news-status-badge.is-archived { color: #b45309; background: #fff7ed; border-color: #fed7aa; }
.news-status-badge.is-scheduled { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
.news-visibility-badge.is-public { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
.news-visibility-badge.is-private { color: #475569; background: #f8fafc; border-color: #e2e8f0; }
.news-visibility-badge.is-featured { color: #7e22ce; background: #faf5ff; border-color: #e9d5ff; }
.news-visibility-badge.is-internal { color: #b45309; background: #fff7ed; border-color: #fed7aa; }

.news-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.news-action-btn {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 50%;
  background: #fff;
  font-size: 18px;
  transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease;
}

.news-action-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 10px 20px rgba(15, 23, 42, .1);
}

.news-action-btn:disabled {
  cursor: not-allowed;
  opacity: .62;
  transform: none;
}

.news-action-btn.is-view { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }
.news-action-btn.is-edit { color: #16a34a; background: #f0fdf4; border-color: #dcfce7; }
.news-action-btn.is-archive { color: #d97706; background: #fffbeb; border-color: #fde68a; }
.news-action-btn.is-delete { color: #dc2626; background: #fef2f2; border-color: #fee2e2; }
.news-action-btn.is-more { color: #475569; background: #f8fafc; border-color: #e2e8f0; }

.news-action-menu { min-width: 180px; padding: 8px; }
.news-action-menu .dropdown-item {
  min-height: 38px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
}

.news-mobile-list { display: none; }
.news-mobile-card {
  padding: 16px;
  border: 1px solid #e8edf4;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, .055);
  transition: transform .18s ease, box-shadow .18s ease;
}

.news-mobile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, .08);
}

.news-mobile-card__media {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.news-mobile-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.news-actions--mobile {
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 14px;
}

.news-skeleton-list { padding: 8px; }
.news-skeleton-row {
  display: grid;
  grid-template-columns: 80px minmax(220px, 1fr) 110px 110px 150px;
  align-items: center;
  gap: 18px;
  padding: 16px;
  border-bottom: 1px solid #eef2f7;
}

.news-skeleton-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.news-skeleton,
.news-toolbar-skeleton span {
  display: block;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf1f7 20%, #f8fafc 45%, #e8eef6 70%);
  background-size: 240% 100%;
  animation: news-shimmer 1.25s ease-in-out infinite;
}

.news-toolbar-skeleton span { height: 12px; }
.news-skeleton__image { width: 80px; height: 80px; border-radius: 16px; }
.news-skeleton__title { width: 70%; height: 16px; }
.news-skeleton__line { width: 100%; height: 12px; }
.news-skeleton__meta { width: 34%; height: 11px; }
.news-skeleton__badge { width: 96px; height: 32px; }
.news-skeleton-actions {
  display: flex;
  gap: 10px;
}

.news-skeleton__button { width: 44px; height: 44px; border-radius: 50%; }

.news-data-card :deep(.empty-state) {
  margin: 10px;
  border-radius: 16px;
}

.news-data-card :deep(.pagination) .page-link {
  min-width: 36px;
  min-height: 36px;
  border: 1px solid #e2e8f0 !important;
  border-radius: 11px !important;
  background: #fff !important;
  color: #475569 !important;
  box-shadow: 0 4px 10px rgba(15, 23, 42, .04);
}

.news-data-card :deep(.pagination) .bg-primary-600 {
  border-color: transparent !important;
  color: #fff !important;
  background: linear-gradient(135deg, var(--news-primary), var(--news-primary-dark)) !important;
  box-shadow: 0 10px 20px rgba(72, 127, 255, .24);
}

@keyframes news-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes news-badge-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes news-shimmer {
  to { background-position: -240% 0; }
}

@media (max-width: 1199px) {
  .news-add-btn { margin-left: 0; }
  .news-skeleton-row { grid-template-columns: 80px minmax(220px, 1fr) 110px 120px; }
  .news-skeleton-actions { display: none; }
}

@media (max-width: 991px) {
  .news-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .news-toolbar > * { flex: 1 1 220px; }
  .news-search { min-width: 220px; }
  .news-add-btn { flex: 1 1 220px; }
}

@media (max-width: 767px) {
  .news-hero h1 { font-size: 22px; }
  .news-hero__icon {
    width: 48px;
    height: 48px;
    flex-basis: 48px;
  }

  .news-toolbar-card { padding: 14px; }
  .news-toolbar > *,
  .news-search,
  .news-add-btn {
    width: 100%;
    min-width: 0;
    flex: 1 1 100%;
  }

  .news-toolbar-skeleton { grid-template-columns: 1fr; }
  .news-data-card { padding: 10px; }
  .news-table { display: none; }
  .news-mobile-list {
    display: grid;
    gap: 12px;
  }

  .news-skeleton-row {
    grid-template-columns: 64px 1fr;
    gap: 14px;
    padding: 12px;
  }

  .news-skeleton__image {
    width: 64px;
    height: 64px;
  }

  .news-skeleton__badge,
  .news-skeleton-actions {
    display: none;
  }
}

/* Compact enterprise scale: premium polish while preserving list density. */
.news-list-page {
  --news-shadow: 0 10px 28px rgba(15, 23, 42, .055);
}

.news-hero {
  gap: 16px;
  margin-bottom: 16px;
}

.news-hero__title { gap: 12px; }
.news-hero__icon {
  width: 44px;
  height: 44px;
  flex-basis: 44px;
  box-shadow: 0 8px 18px rgba(72, 127, 255, .1);
}

.news-hero__icon iconify-icon { font-size: 22px; }
.news-hero h1 { font-size: 24px; line-height: 1.25; }
.news-hero p { margin-top: 4px; font-size: 14px; }
.news-toolbar-card,
.news-data-card {
  border-radius: 16px;
}

.news-toolbar-card {
  margin-bottom: 16px;
  padding: 10px 12px;
}

.news-toolbar { gap: 10px; }
.news-control {
  gap: 4px;
  min-width: 140px;
}

.news-control span { font-size: 12px; }
.news-control .form-select,
.news-search input,
.news-add-btn {
  min-height: 42px;
  border-radius: 12px;
}

.news-add-btn {
  padding: 0 16px;
  box-shadow: 0 8px 18px rgba(72, 127, 255, .22);
}

.news-add-btn:hover { transform: translateY(-1px); }
.news-search__clear {
  width: 34px;
  height: 34px;
}

.news-table {
  min-width: 920px;
  border-radius: 16px;
}

.news-table thead th {
  padding: 12px 16px;
  font-size: 14px;
}

.news-table tbody td {
  padding: 10px 16px;
  font-size: 14px;
}

.news-content-cell { gap: 12px; }
.news-thumb {
  width: 64px;
  height: 64px;
  flex-basis: 64px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(15, 23, 42, .07);
}

.news-thumb--empty { font-size: 24px; }
.news-info h2,
.news-mobile-card h2 {
  font-size: 16px;
}

.news-info p,
.news-mobile-card p {
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 1.4;
}

.news-date { font-size: 12px; }
.news-category {
  min-height: 24px;
  padding: 3px 8px;
}

.news-status-badge,
.news-visibility-badge {
  min-height: 28px;
  padding: 4px 10px;
  font-size: 12px;
}

.news-actions { gap: 8px; }
.news-action-btn {
  width: 40px;
  height: 40px;
  font-size: 17px;
}

.news-action-btn:hover { transform: scale(1.04); }
.news-mobile-card {
  padding: 14px;
}

.news-skeleton-row {
  grid-template-columns: 64px minmax(220px, 1fr) 100px 100px 136px;
  gap: 14px;
  padding: 10px 16px;
}

.news-skeleton__image {
  width: 64px;
  height: 64px;
  border-radius: 12px;
}

.news-skeleton__badge { height: 28px; }
.news-skeleton__button {
  width: 40px;
  height: 40px;
}

@media (max-width: 767px) {
  .news-hero h1 { font-size: 22px; }
  .news-hero__icon {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
  }

  .news-toolbar-card,
  .news-data-card { padding: 10px; }
}
</style>
