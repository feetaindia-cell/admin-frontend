<template><StatusBadge :status="normalized" /></template>
<script setup>
import { computed } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
const props=defineProps({status:{type:String,default:''}})
const normalized=computed(()=>String(props.status).toLowerCase()==='archived'?'inactive':props.status)
</script>
