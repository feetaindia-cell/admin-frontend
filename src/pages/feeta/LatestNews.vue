<template>
  <div class="dashboard-main-body">
<div class="card p-0 overflow-hidden position-relative radius-12">
      <div class="card-header pt-16 pb-0 px-24 bg-base border border-end-0 border-start-0 border-top-0 d-flex align-items-center flex-wrap justify-content-between gap-3">
        <div>
          <h6 class="text-lg mb-0">Published News Reader</h6>
          <span class="text-secondary-light text-sm">
            Uses public <code>/news</code> API and refreshes every 30 minutes.
          </span>
        </div>

        <div class="d-flex align-items-center flex-wrap gap-3">
          <span v-if="loadedAt" class="text-secondary-light text-sm">Updated {{ loadedAt }}</span>
          <button type="button" class="btn btn-sm btn-primary-600 d-inline-flex align-items-center gap-6" :disabled="loading" @click="fetchNews">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            <iconify-icon v-else icon="ri:refresh-line"></iconify-icon>
            Refresh
          </button>
        </div>

        <ul class="nav bordered-tab d-inline-flex nav-pills mb-0 w-100 mt-16" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link px-16 py-10"
              :class="{ active: activeTab === 'reader' }"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'reader'"
              @click="activeTab = 'reader'"
            >
              Inshorts View
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link px-16 py-10"
              :class="{ active: activeTab === 'list' }"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'list'"
              @click="activeTab = 'list'"
            >
              Latest List
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body p-24">
        <div v-if="error" class="alert alert-warning bg-warning-100 text-warning-600 border-warning-100 px-24 py-11 radius-8">
          {{ error }}
        </div>

        <div v-if="loading && !posts.length" class="text-center py-64">
          <span class="spinner-border text-primary-600" aria-hidden="true"></span>
        </div>

        <div v-else-if="!posts.length" class="text-center py-64">
          <div class="w-64-px h-64-px bg-neutral-100 rounded-circle d-inline-flex align-items-center justify-content-center mb-16">
            <iconify-icon icon="ri:news-line" class="text-3xl text-secondary-light"></iconify-icon>
          </div>
          <h6 class="mb-8">No published news found</h6>
          <p class="text-secondary-light mb-0">Published news from the public API will appear here.</p>
        </div>

        <div v-else-if="activeTab === 'reader'" class="row gy-4">
          <div class="col-xxl-8 col-lg-7">
            <article class="card border h-100 radius-12 overflow-hidden">
              <div class="h-360-px overflow-hidden bg-neutral-100">
                <img :src="imageFor(activePost)" :alt="activePost.title || 'News image'" class="w-100 h-100 object-fit-cover" />
              </div>
              <div class="card-body p-24">
                <div class="d-flex align-items-center flex-wrap gap-2 mb-16">
                  <span class="badge text-sm fw-semibold bg-success-focus text-success-600 px-20 py-9 radius-4">
                    Published
                  </span>
                  <span class="text-secondary-light text-sm">
                    {{ formatDate(activePost.published_at || activePost.created_at) }}
                  </span>
                </div>

                <h4 class="mb-12">{{ activePost.title }}</h4>
                <p class="text-secondary-light text-lg mb-16">
                  {{ summaryFor(activePost) }}
                </p>
                <p class="text-secondary-light mb-0">
                  {{ contentPreview(activePost) }}
                </p>

                <div class="d-flex align-items-center justify-content-between gap-3 mt-24">
                  <button type="button" class="btn btn-outline-primary-600 d-inline-flex align-items-center gap-6" :disabled="activeIndex === 0" @click="activeIndex -= 1">
                    <iconify-icon icon="ri:arrow-left-line"></iconify-icon>
                    Previous
                  </button>
                  <span class="text-secondary-light text-sm">{{ activeIndex + 1 }} of {{ posts.length }}</span>
                  <button type="button" class="btn btn-primary-600 d-inline-flex align-items-center gap-6" :disabled="activeIndex >= posts.length - 1" @click="activeIndex += 1">
                    Next
                    <iconify-icon icon="ri:arrow-right-line"></iconify-icon>
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div class="col-xxl-4 col-lg-5">
            <div class="card border h-100 radius-12">
              <div class="card-header border-bottom">
                <h6 class="text-xl mb-0">Latest Posts</h6>
              </div>
              <div class="card-body d-flex flex-column gap-24 p-24">
                <button
                  v-for="(post, index) in posts"
                  :key="post.id || post.slug || post.title"
                  type="button"
                  class="d-flex flex-wrap text-start bg-transparent border-0 p-0"
                  @click="activeIndex = index"
                >
                  <span class="blog__thumb w-100 radius-12 overflow-hidden">
                    <img :src="imageFor(post)" :alt="post.title || 'News image'" class="w-100 h-100 object-fit-cover">
                  </span>
                  <span class="blog__content d-block">
                    <span class="d-block mb-8 text-line-2 text-hover-primary-600 text-md fw-semibold transition-2" :class="index === activeIndex ? 'text-primary-600' : 'text-primary-light'">
                      {{ post.title }}
                    </span>
                    <span class="text-line-2 text-sm text-neutral-500 mb-0">{{ summaryFor(post) }}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="row gy-4">
          <div v-for="post in posts" :key="post.id || post.slug || post.title" class="col-xxl-4 col-md-6">
            <div class="card h-100 radius-12 overflow-hidden">
              <div class="h-220-px overflow-hidden bg-neutral-100">
                <img :src="imageFor(post)" :alt="post.title || 'News image'" class="w-100 h-100 object-fit-cover">
              </div>
              <div class="card-body p-24">
                <div class="d-flex align-items-center justify-content-between gap-3 mb-12">
                  <span class="badge text-sm fw-semibold bg-success-focus text-success-600 px-20 py-9 radius-4">Published</span>
                  <span class="text-secondary-light text-sm">{{ formatDate(post.published_at || post.created_at) }}</span>
                </div>
                <h6 class="mb-10 text-line-2">{{ post.title }}</h6>
                <p class="text-secondary-light text-line-3 mb-0">{{ summaryFor(post) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import newsService from '@/services/newsService'
import fallbackImage from '@/assets/images/blog/blog1.png'
import { newsMediaUrl } from '@/utils/mediaUrl'

const posts = ref([])
const activeIndex = ref(0)
const activeTab = ref('reader')
const loading = ref(false)
const error = ref('')
const loadedAt = ref('')
let refreshTimer = null
const REFRESH_MS = 30 * 60 * 1000

const activePost = computed(() => posts.value[activeIndex.value] || {})

function normalizeCollection(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || []
  return items
}

function imageFor(post) {
  return newsMediaUrl(post?.featured_image_url || post?.featured_image || post?.image_url || post?.image || '', fallbackImage)
}

function summaryFor(post) {
  return post?.short_description || post?.excerpt || stripHtml(post?.content).slice(0, 180) || 'No summary available.'
}

function contentPreview(post) {
  const text = stripHtml(post?.content)
  return text ? text.slice(0, 420) : summaryFor(post)
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function setLoadedTime() {
  loadedAt.value = new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

async function fetchNews() {
  loading.value = true
  error.value = ''

  try {
    posts.value = normalizeCollection(await newsService.latest({ per_page: 10 }))
    setLoadedTime()
  } catch (err) {
    error.value = err.message || 'Latest news is unavailable right now. The page will retry automatically.'
  } finally {
    loading.value = false
  }
}

watch(posts, () => {
  if (activeIndex.value >= posts.value.length) {
    activeIndex.value = 0
  }
})

onMounted(() => {
  fetchNews()
  refreshTimer = window.setInterval(fetchNews, REFRESH_MS)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
  }
})
</script>
