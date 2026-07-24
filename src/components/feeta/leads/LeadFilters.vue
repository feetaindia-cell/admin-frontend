<template>
  <div class="lead-filters">
    <label class="search-control">
      <iconify-icon icon="lucide:search" />
      <input v-model="local.search" type="search" placeholder="Search name, phone, city or area" />
    </label>
    <select v-model="local.status" class="form-select">
      <option value="">All statuses</option>
      <option v-for="item in statuses" :key="item" :value="item">{{ titleCase(item) }}</option>
    </select>
    <input v-model="local.category_name" class="form-control" placeholder="Category" />
    <input v-model="local.purpose" class="form-control" placeholder="Purpose" />
    <input v-model="local.city" class="form-control" placeholder="City" />
    <select v-model="local.assignment" class="form-select">
      <option value="">Assigned and unassigned</option>
      <option value="assigned">Assigned</option>
      <option value="unassigned">Unassigned</option>
    </select>
    <input v-model="local.date_from" type="date" class="form-control" title="From date" />
    <input v-model="local.date_to" type="date" class="form-control" title="To date" />
    <button v-if="hasFilters" class="filter-clear-button" type="button" @click="$emit('clear')">
      <iconify-icon icon="lucide:list-filter-x" />Clear
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { titleCase } from '@/utils/finance'

const local = defineModel({ type: Object, required: true })
defineEmits(['clear'])

const statuses = ['pending', 'assigned', 'in_progress', 'completed', 'expired', 'cancelled']
const hasFilters = computed(() => Object.values(local.value || {}).some((value) => value !== '' && value !== undefined && value !== null))
</script>

<style scoped>
.lead-filters{display:grid;grid-template-columns:minmax(280px,2fr) repeat(auto-fit,minmax(150px,1fr));gap:12px;align-items:center;width:100%}.lead-filters>*{min-width:0}.search-control{min-height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;color:#64748b;box-shadow:0 1px 2px rgba(15,23,42,.04)}.search-control input{width:100%;min-width:0;min-height:42px;border:0;outline:0;background:transparent;color:#0f172a}.lead-filters .form-select,.lead-filters .form-control{min-height:44px;border-color:#e2e8f0;border-radius:12px;color:#334155;box-shadow:0 1px 2px rgba(15,23,42,.04)}.filter-clear-button{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #fecaca;border-radius:12px;color:#b91c1c;background:#fff5f5;font-weight:800}@media(max-width:1199px){.lead-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.search-control{grid-column:1/-1}}@media(max-width:768px){.lead-filters{grid-template-columns:1fr}}
</style>
