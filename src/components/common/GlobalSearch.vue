<template>
  <div ref="root" class="global-search">
    <form class="navbar-search global-search__form" role="search" @submit.prevent="submit">
      <input v-model="search" type="text" name="global-search" autocomplete="off" placeholder="Search pages, admins, properties..." aria-label="Search FEETA admin"
        @focus="open" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="submit" @keydown.esc.prevent="close" />
      <button v-if="search" type="button" class="global-search__clear" aria-label="Clear search" @click="clear"><iconify-icon icon="lucide:x" /></button>
      <iconify-icon icon="lucide:search" class="icon" />
      <kbd v-if="!search" class="global-search__shortcut">Ctrl + K</kbd>
    </form>

    <transition name="global-search-fade">
      <div v-if="isOpen" class="global-search__dropdown">
        <button v-if="currentPageSupportsSearch && debouncedSearch" type="button" class="global-search__local" @mousedown.prevent="submit">
          <span class="global-search__icon"><iconify-icon icon="lucide:scan-search" /></span>
          <span><strong>Search this page</strong><small>Apply “{{ debouncedSearch }}” to current list filters</small></span>
          <kbd>Enter</kbd>
        </button>

        <div v-if="results.length" class="global-search__section">
          <p class="global-search__label">{{ showingRecent ? 'Recent' : 'Pages' }}</p>
          <button v-for="(item, index) in results" :key="item.title + item.route" type="button"
            :class="['global-search__item', { 'is-active': index === selectedIndex }]"
            @mouseenter="selectedIndex = index" @mousedown.prevent="navigateTo(item)">
            <span class="global-search__icon"><iconify-icon :icon="item.icon" /></span>
            <span class="global-search__content">
              <strong><template v-for="(part, partIndex) in highlightParts(item.title)" :key="partIndex"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></strong>
              <small>{{ item.subtitle }}</small>
            </span>
            <iconify-icon icon="lucide:arrow-up-right" class="global-search__arrow" />
          </button>
        </div>
        <div v-else-if="debouncedSearch" class="global-search__empty"><iconify-icon icon="lucide:search" /><span>No matching page found</span></div>
        <div v-else class="global-search__empty"><iconify-icon icon="lucide:command" /><span>Type to search pages and modules</span></div>
        <div class="global-search__footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useGlobalSearch } from '@/composables/useGlobalSearch'

const root = ref(null)
const { search, debouncedSearch, isOpen, selectedIndex, results, showingRecent, currentPageSupportsSearch, open, close, move, submit, navigateTo, clear } = useGlobalSearch()

function highlightParts(text) {
  const term = String(debouncedSearch.value || '').trim()
  if (!term) return [{ text, match: false }]
  const escaped = term.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
  return String(text).split(new RegExp('(' + escaped + ')', 'ig')).filter(Boolean).map((part) => ({
    text: part,
    match: part.toLowerCase() === term.toLowerCase(),
  }))
}

function handlePointerDown(event) {
  if (root.value && !root.value.contains(event.target)) close()
}

onMounted(() => document.addEventListener('mousedown', handlePointerDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', handlePointerDown))
</script>

<style scoped>
/* Header search: requested 420px command-field styling without changing search logic. */
.global-search{position:relative;width:420px;z-index:30;font-family:Inter,sans-serif}.global-search__form{width:100%}.global-search__form input{width:100%;height:46px;padding:0 92px 0 44px;border:1px solid #e5e7eb;border-radius:14px;color:#0f172a;background:#f8fafc;font-size:14px;font-weight:500;transition:border-color .15s ease,box-shadow .15s ease,background-color .15s ease}.global-search__form input:focus{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.12);outline:0}.global-search__form .icon{position:absolute;top:50%;left:16px;color:#94a3b8;font-size:18px;transform:translateY(-50%)}.global-search__shortcut{position:absolute;top:50%;right:12px;padding:3px 7px;border:1px solid #e5e7eb;border-radius:7px;color:#64748b;background:#fff;box-shadow:none;font-size:11px;font-weight:600;line-height:1;transform:translateY(-50%)}.global-search__clear{position:absolute;top:50%;right:12px;width:26px;height:26px;display:inline-grid;place-items:center;border:0;border-radius:50%;color:#64748b;background:transparent;transform:translateY(-50%)}.global-search__clear:hover{color:#0f172a;background:#f1f5f9}.global-search__dropdown{position:absolute;top:calc(100% + 10px);left:0;width:min(460px,92vw);overflow:hidden;padding:10px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08);backdrop-filter:none}.global-search__section{display:flex;flex-direction:column;gap:4px}.global-search__label{margin:4px 8px 6px;color:#64748b;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.global-search__item,.global-search__local{width:100%;display:flex;align-items:center;gap:10px;padding:10px;border:0;border-radius:10px;color:#0f172a;background:transparent;text-align:left}.global-search__item:hover,.global-search__item.is-active,.global-search__local:hover{background:#f1f5f9}.global-search__icon{width:34px;height:34px;display:inline-grid;place-items:center;flex:0 0 34px;border:1px solid #e5e7eb;border-radius:10px;color:#64748b;background:#fff;font-size:18px}.global-search__content,.global-search__local span:not(.global-search__icon){min-width:0;display:flex;flex:1 1 auto;flex-direction:column}.global-search__content strong,.global-search__local strong{color:#0f172a;font-size:14px;font-weight:600}.global-search__content mark{padding:0 1px;border-radius:3px;color:inherit;background:rgba(37,99,235,.1)}.global-search__content small,.global-search__local small{overflow:hidden;color:#64748b;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.global-search__arrow{color:#94a3b8;font-size:18px}.global-search__local{margin-bottom:6px;border:1px solid #e5e7eb;background:#f8fafc}.global-search__local kbd,.global-search__footer kbd{padding:3px 6px;border:1px solid #e5e7eb;border-radius:6px;color:#64748b;background:#fff;box-shadow:none;font-size:10px}.global-search__empty{display:flex;align-items:center;gap:10px;padding:20px 12px;color:#64748b;font-size:13px}.global-search__footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px -10px -10px;padding:9px 12px;border-top:1px solid #e5e7eb;color:#64748b;font-size:10px}.global-search__footer span{display:flex;align-items:center;gap:4px}.global-search-fade-enter-active,.global-search-fade-leave-active{transition:opacity .2s ease,transform .2s ease}.global-search-fade-enter-from,.global-search-fade-leave-to{opacity:0;transform:translateY(-6px) scale(.99)}:global([data-theme=dark]) .global-search__dropdown{border-color:rgba(148,163,184,.22);background:rgba(17,24,39,.96);box-shadow:0 16px 40px rgba(0,0,0,.28)}:global([data-theme=dark]) .global-search__local kbd,:global([data-theme=dark]) .global-search__footer kbd,:global([data-theme=dark]) .global-search__shortcut{background:rgba(255,255,255,.07)}@media(max-width:991px){.global-search{width:min(420px,58vw)}}@media(max-width:575px){.global-search{order:10;width:100%}.global-search__dropdown{width:100%}.global-search__footer{display:none}}
</style>
