<template>
  <div class="empty-state text-center py-40 px-20">
    <div class="empty-state__icon w-64-px h-64-px rounded-circle d-inline-flex align-items-center justify-content-center mb-16">
      <iconify-icon :icon="icon" class="text-3xl text-secondary-light"></iconify-icon>
    </div>
    <h6 class="mb-8">{{ title }}</h6>
    <p class="text-secondary-light mb-0">{{ message }}</p>
    <div v-if="actionLabel || refreshLabel" class="d-flex justify-content-center gap-2 flex-wrap mt-20">
      <router-link v-if="actionLabel && actionTo" :to="actionTo" class="btn btn-primary-600 btn-sm"><iconify-icon :icon="actionIcon" />{{ actionLabel }}</router-link>
      <button v-if="refreshLabel" type="button" class="btn btn-outline-primary-600 btn-sm" @click="$emit('refresh')"><iconify-icon icon="ri:refresh-line" />{{ refreshLabel }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'solar:inbox-outline' },
  title: { type: String, default: 'No records found' },
  message: { type: String, default: 'Try changing filters or create a new record.' },
  actionLabel: { type: String, default: '' },
  actionTo: { type: String, default: '' },
  actionIcon: { type: String, default: 'ri:add-line' },
  refreshLabel: { type: String, default: '' },
})

defineEmits(['refresh'])
</script>

<style scoped>
.empty-state{margin:18px;border:1px dashed rgba(148,163,184,.38);border-radius:16px;background:linear-gradient(145deg,rgba(248,250,252,.7),rgba(255,255,255,.4))}.empty-state__icon{color:#487fff;background:linear-gradient(145deg,#eef4ff,#f8fbff);box-shadow:inset 0 0 0 1px rgba(72,127,255,.12)}:global([data-theme=dark]) .empty-state{border-color:rgba(148,163,184,.25);background:rgba(15,23,42,.22)}:global([data-theme=dark]) .empty-state__icon{background:rgba(72,127,255,.12)}
</style>
