<template><PolicyForm :mode="mode" /></template>

<script setup>
import PolicyForm from './PolicyForm.vue'

defineProps({ mode: { type: String, default: 'create' } })
</script>
