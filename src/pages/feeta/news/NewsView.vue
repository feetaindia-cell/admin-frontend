<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading news..." />
    <div v-else-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <div v-else class="card radius-12">
      <div v-if="featuredImage" class="h-320-px overflow-hidden radius-12">
        <img :src="featuredImage" class="w-100 h-100 object-fit-cover" alt="Featured image" />
      </div>
      <div class="card-body p-24">
        <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-16">
          <h4 class="mb-0">{{ post.title }}</h4>
          <StatusBadge :status="post.status" />
        </div>
        <p class="text-secondary-light">{{ post.short_description }}</p>
        <div class="border-top pt-20" v-html="post.content"></div>
        <div class="mt-24 d-flex gap-2">
          <router-link to="/news" class="btn btn-outline-primary-600 d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:arrow-left-line"></iconify-icon>Back</router-link>
          <router-link v-if="auth.hasPermission('news.update')" :to="`/news/${post.id}/edit`" class="btn btn-primary-600 d-inline-flex align-items-center gap-6"><iconify-icon icon="ri:edit-line"></iconify-icon>Edit</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import newsService from '@/services/newsService'
import { useAuthStore } from '@/stores/auth'
import { newsMediaUrl } from '@/utils/mediaUrl'

const route = useRoute()
const auth = useAuthStore()
const post = ref({})
const loading = ref(true)
const error = ref('')
const featuredImage = computed(() => newsMediaUrl(post.value.featured_image_url || post.value.featured_image || ''))

onMounted(async () => {
  try {
    post.value = await newsService.get(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
