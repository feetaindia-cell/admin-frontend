<template>
  <div class="row gy-4">
    <div v-for="card in cards" :key="card.label" class="col-sm-6 col-xl-3">
      <div class="agent-summary-card">
        <span :class="card.iconClass" class="summary-icon">
          <iconify-icon :icon="card.icon" />
        </span>
        <div>
          <span class="text-secondary-light text-sm">{{ card.label }}</span>
          <div v-if="loading" class="summary-skeleton mt-8"></div>
          <h5 v-else class="mb-0 mt-4">{{ formatNumber(card.value) }}</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cards: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("en-IN").format(number)
    : "0";
}
</script>

<style scoped>
.agent-summary-card {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.agent-summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}
.summary-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  flex: 0 0 48px;
  border-radius: 13px;
  font-size: 23px;
}
.summary-skeleton {
  width: 72px;
  height: 21px;
  border-radius: 6px;
  background: linear-gradient(90deg, #edf2f7 25%, #f8fafc 50%, #edf2f7 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
