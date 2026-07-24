<template>
  <div class="row gy-4">
    <div v-for="card in cards" :key="card.label" class="col-sm-6 col-xl-3">
      <div class="card h-100 radius-12 border">
        <div class="card-body p-20 d-flex align-items-center gap-14">
          <span class="stat-icon" :class="card.iconClass"><iconify-icon :icon="card.icon" /></span>
          <div>
            <span class="text-secondary-light text-sm">{{ card.label }}</span>
            <div v-if="loading" class="placeholder-glow mt-6"><span class="placeholder col-8"></span></div>
            <h5 v-else class="mb-0 mt-4">{{ card.value }}</h5>
            <span v-if="card.hint" class="text-secondary-light text-xs">{{ card.hint }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ cards: { type: Array, default: () => [] }, loading: Boolean })
</script>

<style scoped>
.stat-icon { width: 48px; height: 48px; display: grid; place-items: center; flex: 0 0 48px; border-radius: 14px; font-size: 23px; }
</style>
