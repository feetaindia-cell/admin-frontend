<template>
  <div class="error-state text-center p-32 radius-12">
    <div class="error-icon mx-auto mb-16">
      <iconify-icon icon="solar:danger-triangle-outline" class="text-3xl" />
    </div>
    <h6 class="mb-8">{{ title }}</h6>
    <p class="text-secondary-light mb-20">{{ friendlyMessage }}</p>
    <div class="d-flex justify-content-center gap-2 flex-wrap">
      <button type="button" class="btn btn-primary-600 btn-sm px-16" @click="$emit('retry')"><iconify-icon icon="ri:refresh-line" />Retry</button>
      <button v-if="showBack" type="button" class="btn btn-outline-secondary-600 btn-sm px-16" @click="router.back()"><iconify-icon icon="ri:arrow-left-line" />Back</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, default: 'Unable to load data' },
  message: { type: String, default: 'Something went wrong. Please try again.' },
  showBack: { type: Boolean, default: true },
})

const router = useRouter()
const friendlyMessage = computed(() => /sqlstate|stack trace|exception|\/app\/|\\app\\|line \d+/i.test(props.message)
  ? 'We could not load this information right now. Please retry in a moment.'
  : props.message)

defineEmits(['retry'])
</script>

<style scoped>
.error-state {
  border: 1px solid #fecaca;
  background: #fff7f7;
  box-shadow: 0 8px 28px rgba(185, 28, 28, .06);
}

:global([data-theme=dark]) .error-state { border-color: rgba(248,113,113,.24); background: rgba(127,29,29,.12); }

.error-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #dc2626;
  background: #fee2e2;
}
</style>
