<template>
  <section v-if="owner?.id" class="detail-card">
    <div class="section-heading"><iconify-icon icon="ri:user-star-line" /><h6 class="mb-0">Property owner</h6></div>
    <div class="owner-head"><img v-if="owner.profile_pic" :src="mediaUrl(owner.profile_pic)" alt="" /><span v-else>{{ initials }}</span><div><h6 class="mb-3">{{ safeValue(owner.name) }}</h6><PropertyStatusBadge :status="owner.verification_status" /></div></div>
    <div class="side-list mt-16"><div><span>Email</span><strong>{{ safeValue(owner.email) }}</strong></div><div><span>Phone</span><strong>{{ safeValue(owner.phone) }}</strong></div><div v-if="owner.wallet_summary"><span>Available credits</span><strong>{{ owner.wallet_summary.available_credits }}</strong></div></div>
    <div class="d-flex gap-8 mt-16 flex-wrap"><router-link :to="owner.profile_link||`/agents/${owner.id}`" class="btn btn-outline-primary-600 btn-sm">View Agent</router-link><a v-if="owner.phone" :href="`tel:${owner.phone}`" class="btn btn-outline-primary-600 btn-sm">Call</a><a v-if="owner.email" :href="`mailto:${owner.email}`" class="btn btn-outline-primary-600 btn-sm">Email</a></div>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import PropertyStatusBadge from './PropertyStatusBadge.vue'
import { safeValue } from '@/utils/finance'
import { mediaUrl } from '@/utils/mediaUrl'
const props=defineProps({owner:{type:Object,default:()=>({})}})
const initials=computed(()=>String(props.owner.name||'Agent').split(/\s+/).slice(0,2).map(v=>v[0]).join('').toUpperCase())
</script>
<style scoped>
.detail-card{padding:22px;border:1px solid #e5eaf2;border-radius:14px;background:#fff}.section-heading{display:flex;align-items:center;gap:10px;padding-bottom:15px;border-bottom:1px solid #edf1f6}.section-heading iconify-icon{color:#487fff;font-size:21px}.owner-head{display:flex;align-items:center;gap:12px;margin-top:18px}.owner-head img,.owner-head>span{width:52px;height:52px;display:grid;place-items:center;border-radius:14px;object-fit:cover;color:#fff;background:#487fff;font-weight:700}.side-list>div{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #edf1f6}.side-list span{color:#64748b}.side-list strong{text-align:right}
</style>
