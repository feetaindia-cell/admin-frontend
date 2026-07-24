<template>
  <section class="gallery-card">
    <button v-if="current" class="gallery-main" type="button" @click="open(propertyMediaUrl(current.url))"><img :src="propertyMediaUrl(current.url)" :alt="title" /></button>
    <div v-else class="gallery-empty"><iconify-icon icon="ri:image-line" /><span>No property images available</span></div>
    <div v-if="images.length>1" class="gallery-strip"><button v-for="item in images" :key="item.id" :class="{active:item.id===current?.id}" @click="selected=item.id"><img :src="propertyMediaUrl(item.url)" alt="" /></button></div>
    <div v-if="videos.length||documents.length" class="media-links mt-16"><a v-for="item in [...videos,...documents]" :key="item.id" :href="propertyMediaUrl(item.url)" target="_blank" rel="noopener"><iconify-icon :icon="videos.includes(item)?'ri:video-line':'ri:file-line'" /> {{ item.type }}</a></div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { propertyMediaUrl } from '@/utils/mediaUrl'
const props=defineProps({media:{type:Array,default:()=>[]},title:{type:String,default:'Property'}})
const selected=ref(null)
const images=computed(()=>props.media.filter(item=>['photo','image'].includes(String(item.type).toLowerCase())))
const videos=computed(()=>props.media.filter(item=>String(item.type).toLowerCase().includes('video')))
const documents=computed(()=>props.media.filter(item=>!images.value.includes(item)&&!videos.value.includes(item)))
const current=computed(()=>images.value.find(item=>item.id===selected.value)||images.value.find(item=>item.is_primary)||images.value[0])
function open(url){window.open(url,'_blank','noopener')}
</script>
<style scoped>
.gallery-card{padding:14px;border:1px solid #e5eaf2;border-radius:16px;background:#fff}.gallery-main,.gallery-empty{width:100%;height:420px;overflow:hidden;border:0;border-radius:12px;background:#f1f5f9}.gallery-main img{width:100%;height:100%;object-fit:cover}.gallery-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#64748b}.gallery-empty iconify-icon{font-size:48px}.gallery-strip{display:flex;gap:10px;overflow-x:auto;padding-top:12px}.gallery-strip button{width:92px;height:68px;flex:0 0 92px;padding:0;overflow:hidden;border:2px solid transparent;border-radius:9px}.gallery-strip button.active{border-color:#487fff}.gallery-strip img{width:100%;height:100%;object-fit:cover}.media-links{display:flex;gap:10px;flex-wrap:wrap}.media-links a{display:flex;align-items:center;gap:6px;padding:8px 11px;border-radius:8px;background:#eff6ff;color:#2563eb}@media(max-width:767px){.gallery-main,.gallery-empty{height:260px}}
</style>
