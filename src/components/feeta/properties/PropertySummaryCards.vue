<template><FinanceStatCards :cards="cards" :loading="loading" /></template>
<script setup>
import FinanceStatCards from '@/components/feeta/finance/FinanceStatCards.vue'
defineProps({cards:{type:Array,default:()=>[]},loading:Boolean})
</script>
