<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading FAQ item..." />
    <div v-else-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <div v-else class="row gy-4">
      <div class="col-lg-8">
        <div class="card radius-12">
          <div class="card-body p-24">
            <div class="d-flex justify-content-between gap-3 flex-wrap mb-20"><div><p class="text-secondary-light mb-4">Question #{{ item.question_no }}</p><h4 class="mb-0">{{ item.question }}</h4></div><StatusBadge :status="item.is_active ? 'Active' : 'Inactive'" /></div>
            <div class="border-top pt-20 faq-answer" v-html="item.answer"></div>
            <div class="mt-24 d-flex gap-2 flex-wrap"><router-link :to="sectionPath" class="btn btn-outline-primary-600"><iconify-icon icon="ri:arrow-left-line" class="me-6" />Back to Section</router-link><router-link v-if="auth.hasPermission('faq.item.update')" :to="`/faqs/questions/${item.item_id}/edit`" class="btn btn-primary-600"><iconify-icon icon="ri:edit-line" class="me-6" />Edit Question</router-link></div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card radius-12"><div class="card-body p-24"><h6>Details</h6><p class="mb-1">Section: {{ item.section?.title || item.section_id }}</p><p class="mb-1">Sort Order: {{ item.sort_order }}</p><p class="mb-0">Table: faq_items</p></div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LoadingState from '@/components/common/LoadingState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import faqService from '@/services/faqService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const item = ref({})
const loading = ref(true)
const error = ref('')
const sectionPath = computed(() => item.value.section_id ? `/faqs/sections/${item.value.section_id}` : '/faqs')
onMounted(async () => { try { item.value = await faqService.getItem(route.params.id) } catch (err) { error.value = err.message } finally { loading.value = false } })
</script>

<style scoped>.faq-answer :deep(p){margin-bottom:12px}.faq-answer{line-height:1.75}</style>
