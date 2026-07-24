<template>
  <div class="loading-state" :class="`is-${mode}`" role="status" aria-live="polite" aria-busy="true">
    <template v-if="mode === 'profile'">
      <div class="skeleton-profile-head"><span class="skeleton avatar"></span><div><span class="skeleton title"></span><span class="skeleton line short"></span></div></div>
      <div class="skeleton-card-grid"><div v-for="row in Math.min(rows, 4)" :key="row" class="skeleton profile-card"><span class="skeleton line"></span><span class="skeleton line short"></span><span class="skeleton line"></span></div></div>
    </template>
    <template v-else-if="mode === 'cards'">
      <div class="skeleton-card-grid"><div v-for="row in rows" :key="row" class="skeleton metric"><span class="skeleton icon"></span><div><span class="skeleton line"></span><span class="skeleton title short"></span></div></div></div>
    </template>
    <template v-else>
      <div class="skeleton-table-head"><span v-for="column in 4" :key="column" class="skeleton line"></span></div>
      <div v-for="row in rows" :key="row" class="skeleton-table-row"><span class="skeleton avatar small"></span><span class="skeleton line"></span><span class="skeleton line short"></span><span class="skeleton line"></span></div>
    </template>
    <p class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: String, default: 'Loading...' },
  rows: { type: Number, default: 5 },
  variant: { type: String, default: 'auto' },
})

const mode = computed(() => {
  if (props.variant !== 'auto') return props.variant
  if (/profile|detail|invoice/i.test(props.message)) return 'profile'
  if (/dashboard|stat|summary|card/i.test(props.message)) return 'cards'
  return 'table'
})
</script>

<style scoped>
.loading-state{position:relative;overflow:hidden;padding:22px;border:1px solid rgba(148,163,184,.2);border-radius:14px;background:#fff}.skeleton{display:block;border-radius:8px;background:linear-gradient(90deg,#edf1f7 20%,#f8fafc 45%,#e8eef6 70%);background-size:240% 100%;animation:shimmer 1.25s ease-in-out infinite}.line{width:100%;height:11px}.line.short{width:58%}.title{width:180px;height:16px}.title.short{width:90px}.avatar{width:58px;height:58px;border-radius:18px}.avatar.small{width:38px;height:38px;border-radius:11px}.icon{width:42px;height:42px;border-radius:12px}.skeleton-profile-head{display:flex;align-items:center;gap:14px;margin-bottom:20px}.skeleton-profile-head>div{display:flex;flex:1;flex-direction:column;gap:9px}.skeleton-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.profile-card{height:auto;padding:18px;border:0}.profile-card .line{margin-bottom:14px}.metric{height:auto;display:flex;align-items:center;gap:12px;padding:18px;border:0}.metric>div{display:flex;flex:1;flex-direction:column;gap:10px}.skeleton-table-head,.skeleton-table-row{display:grid;grid-template-columns:42px 1.4fr 1fr 1fr;align-items:center;gap:20px;padding:13px 4px}.skeleton-table-head{padding-top:2px;border-bottom:1px solid #e8edf4}.skeleton-table-row{border-bottom:1px solid #eef2f7}.loading-message{margin:16px 0 0;color:#64748b;font-size:12px;text-align:center}@keyframes shimmer{to{background-position:-240% 0}}:global([data-theme=dark]) .loading-state{border-color:rgba(148,163,184,.18);background:#182233}:global([data-theme=dark]) .skeleton{background:linear-gradient(90deg,#1e293b 20%,#334155 45%,#1e293b 70%);background-size:240% 100%}:global([data-theme=dark]) .skeleton-table-head,:global([data-theme=dark]) .skeleton-table-row{border-color:rgba(148,163,184,.14)}@media(max-width:767px){.skeleton-card-grid{grid-template-columns:1fr}.skeleton-table-head,.skeleton-table-row{grid-template-columns:38px 1.5fr 1fr}.skeleton-table-head span:last-child,.skeleton-table-row span:last-child{display:none}}
</style>
