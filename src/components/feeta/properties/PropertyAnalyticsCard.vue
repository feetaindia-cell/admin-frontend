<template><section v-if="visible" class="detail-card"><div class="section-heading"><iconify-icon icon="ri:bar-chart-line" /><h6 class="mb-0">Analytics</h6></div><div class="analytics-grid"><div v-for="item in items" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value??'—' }}</strong></div></div></section></template>
<script setup>
import { computed } from 'vue'
const props=defineProps({analytics:{type:Object,default:()=>({})}})
const items=computed(()=>[{label:'Views',value:props.analytics.views},{label:'Unique Views',value:props.analytics.unique_views},{label:'Favorites',value:props.analytics.favorites},{label:'Chats',value:props.analytics.chats_started},{label:'Enquiries',value:props.analytics.enquiries},{label:'Conversion',value:props.analytics.views?`${((props.analytics.enquiries||0)/props.analytics.views*100).toFixed(1)}%`:null}])
const visible=computed(()=>Object.values(props.analytics).some(v=>v!==null&&v!==undefined))
</script>
<style scoped>.detail-card{padding:22px;border:1px solid #e5eaf2;border-radius:14px;background:#fff}.section-heading{display:flex;align-items:center;gap:10px;padding-bottom:15px;margin-bottom:16px;border-bottom:1px solid #edf1f6}.section-heading iconify-icon{color:#487fff;font-size:21px}.analytics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.analytics-grid div{padding:14px;border-radius:10px;background:#f8fafc}.analytics-grid span{display:block;color:#64748b;font-size:12px}.analytics-grid strong{font-size:20px}@media(max-width:575px){.analytics-grid{grid-template-columns:repeat(2,1fr)}}</style>
