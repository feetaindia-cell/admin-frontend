<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isMobileOpen }">
    <button type="button" class="sidebar-close-btn" aria-label="Close navigation" @click="closeSidebar">
      <iconify-icon icon="radix-icons:cross-2" />
    </button>

    <router-link :to="homePath" class="sidebar-logo" aria-label="Go to FEETA dashboard">
      <img :src="branding.logo" :alt="`${branding.appName} logo`" class="feeta-logo-full" />
      <img :src="branding.icon" :alt="`${branding.appName} icon`" class="logo-icon feeta-logo-icon" />
      <span class="sidebar-brand-block">
        <strong>FEETA</strong>
        <small>Admin Panel</small>
      </span>
    </router-link>

    <div class="sidebar-menu-area">
      <ul class="sidebar-menu">
        <li class="sidebar-menu-group-title"><span>Workspace</span></li>

        <li v-for="item in visibleItems" :key="item.key || item.path" :class="{ dropdown: item.children?.length, open: activeDropdown === item.key }">
          <router-link
            v-if="!item.children?.length"
            :to="item.path"
            :class="{ 'active-page': isActive(item.path) }"
            :aria-label="item.label"
            :title="item.label"
            @click="closeSidebar"
          >
            <iconify-icon :icon="item.icon" class="menu-icon"></iconify-icon>
            <span>{{ item.label }}</span>
          </router-link>

          <template v-else>
            <a href="javascript:void(0)" @click="toggleDropdown(item.key)" :class="{ active: isGroupActive(item) }" :aria-expanded="String(activeDropdown === item.key)" :aria-label="item.label" :title="item.label">
              <iconify-icon :icon="item.icon" class="menu-icon"></iconify-icon>
              <span>{{ item.label }}</span>
              <iconify-icon icon="lucide:chevron-right" class="sidebar-chevron" :class="{ rotated: activeDropdown === item.key }" />
            </a>
            <transition @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter" @before-leave="beforeLeave" @leave="leave" @after-leave="afterLeave">
              <ul v-show="activeDropdown === item.key" class="sidebar-submenu">
                <li v-for="child in item.children" :key="child.path" :class="['nav-link', { 'active-page': isActive(child.path) }]">
                  <router-link :to="child.path" :aria-label="child.label" :title="child.label" @click="closeSidebar">
                    <iconify-icon v-if="child.icon" :icon="child.icon" class="menu-icon text-primary-600" />
                    <iconify-icon v-else icon="lucide:circle" class="circle-icon" />
                    {{ child.label }}
                  </router-link>
                </li>
              </ul>
            </transition>
          </template>
        </li>
      </ul>

      <div class="sidebar-bottom">
        <div class="sidebar-help-card">
          <span class="sidebar-help-icon"><iconify-icon icon="lucide:life-buoy" /></span>
          <span class="sidebar-help-copy">
            <strong>Need Help?</strong>
            <small>Documentation</small>
            <small>Support</small>
          </span>
        </div>
        <div class="sidebar-admin-card">
          <span class="sidebar-admin-avatar">{{ adminInitials }}</span>
          <span class="sidebar-admin-meta">
            <strong>{{ adminName }}</strong>
            <small>{{ auth.roleName }}</small>
          </span>
          <router-link to="/profile" class="sidebar-admin-action" aria-label="Profile">
            <iconify-icon icon="lucide:user-cog" />
          </router-link>
          <button type="button" class="sidebar-admin-action" aria-label="Log out" @click="logout">
            <iconify-icon icon="lucide:log-out" />
          </button>
        </div>
      </div>
    </div>
  </aside>
  <button v-if="isMobileOpen" type="button" class="sidebar-backdrop" aria-label="Close navigation" @click="closeSidebar"></button>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import branding from '@/config/branding'
import { filterSidebarItems, getFirstAllowedSidebarPath, sidebarItems } from '@/config/sidebar'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const activeDropdown = ref(null)
const isMobileOpen = ref(false)

const visibleItems = computed(() => filterSidebarItems(sidebarItems, auth))
const homePath = computed(() => getFirstAllowedSidebarPath(auth))
const adminName = computed(() => auth.admin?.name || 'FEETA Admin')
const adminInitials = computed(() => adminName.value
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part.charAt(0).toUpperCase())
  .join('') || 'FA')

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name
  localStorage.setItem('activeDropdown', activeDropdown.value || '')
}

onMounted(() => {
  const savedDropdown = localStorage.getItem('activeDropdown')
  if (savedDropdown) activeDropdown.value = savedDropdown
  window.addEventListener('feeta:sidebar-mobile-open', openSidebar)
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('feeta:sidebar-mobile-open', openSidebar)
  window.removeEventListener('keydown', handleEscape)
})

const openSidebar = () => {
  isMobileOpen.value = true
  document.body.classList.add('overlay-active')
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && isMobileOpen.value) closeSidebar()
}

const closeSidebar = () => {
  isMobileOpen.value = false
  document.body.classList.remove('overlay-active')
  document.querySelector('aside.sidebar')?.classList.remove('sidebar-open')
}

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')
const isGroupActive = (item) => item.children?.some((child) => isActive(child.path))

watch(
  () => route.path,
  () => {
    const activeGroup = visibleItems.value.find((item) => item.children?.some((child) => isActive(child.path)))
    if (activeGroup) activeDropdown.value = activeGroup.key
  },
  { immediate: true },
)

function beforeEnter(el) {
  el.style.height = '0px'
  el.style.opacity = '0'
  el.style.overflow = 'hidden'
}

function enter(el) {
  el.style.transition = 'height .24s ease, opacity .2s ease'
  el.style.height = el.scrollHeight + 'px'
  el.style.opacity = '1'
}

function afterEnter(el) {
  el.style.height = 'auto'
  el.style.overflow = ''
  el.style.transition = ''
}

function beforeLeave(el) {
  el.style.height = el.scrollHeight + 'px'
  el.style.opacity = '1'
  el.style.overflow = 'hidden'
}

function leave(el) {
  el.style.transition = 'height .24s ease, opacity .2s ease'
  requestAnimationFrame(() => {
    el.style.height = '0px'
    el.style.opacity = '0'
  })
}

function afterLeave(el) {
  el.style.height = ''
  el.style.opacity = ''
  el.style.transition = ''
  el.style.overflow = ''
}

async function logout() {
  await auth.logout()
  router.push('/sign-in')
}
</script>

<style scoped>
.sidebar {
  /* Enterprise shell: fixed white rail with the requested expanded width. */
  --sidebar-accent: #2563eb;
  --sidebar-accent-soft: #eff6ff;
  --sidebar-ink: #0f172a;
  --sidebar-muted: #64748b;
  width: 260px;
  border-inline-end: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: none;
  font-family: Inter, sans-serif;
  transition: width .25s ease, transform .25s ease;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 80px;
  padding: 18px 20px;
  border-inline-end: 0;
  border-block-end: 1px solid #e5e7eb;
  background: #ffffff;
}

.feeta-logo-full {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.sidebar-brand-block {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.sidebar-brand-block strong {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.05;
}

.sidebar-brand-block small {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}

.feeta-logo-icon {
  display: none;
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.sidebar-menu-area {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  padding: 18px 14px 16px;
  border-inline-end: 0;
  scrollbar-gutter: stable;
}

.sidebar-menu-area::-webkit-scrollbar {
  width: 5px;
  background: transparent;
}

.sidebar-menu-area::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: transparent;
}

.sidebar-menu-area:hover::-webkit-scrollbar-thumb {
  background: #d7dee8;
}

.sidebar-menu {
  display: grid;
  gap: 6px;
}

.sidebar-menu-group-title {
  margin: 2px 0 8px !important;
  padding: 0 14px;
  color: #94a3b8 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: .1em !important;
  text-transform: uppercase;
}

:global(.sidebar-menu > li:not(.sidebar-menu-group-title) > a) {
  position: relative;
  min-height: 46px;
  padding: 0 14px;
  gap: 12px;
  border: 0;
  border-radius: 10px;
  color: var(--sidebar-muted);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  transition: color .15s ease, background-color .15s ease;
}

:global(.sidebar-menu > li:not(.sidebar-menu-group-title) > a:hover) {
  color: #0f172a;
  background: #f1f5f9;
  cursor: pointer;
}

:global(.sidebar-menu > li > a .menu-icon) {
  width: 20px;
  height: 20px;
  margin: 0;
  flex: 0 0 20px;
  border-radius: 0;
  color: #7c889b;
  background: transparent;
  font-size: 20px;
  transition: color .15s ease;
}

:global(.sidebar-menu > li > a:hover .menu-icon) {
  color: #334155;
  background: transparent;
}

:global(.sidebar-menu > li > a.active-page),
:global(.sidebar-menu > li.dropdown.open > a),
:global(.sidebar-menu > li.dropdown > a.active) {
  /* Linear-style active state: keep the item calm and use the indicator/icon for blue emphasis. */
  color: #0f172a !important;
  background: #ffffff !important;
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, .08);
  font-weight: 600;
}

:global(.sidebar-menu > li > a.active-page::before),
:global(.sidebar-menu > li.dropdown > a.active::before) {
  content: '';
  position: absolute;
  inset-block: 9px;
  inset-inline-start: -14px;
  width: 3px;
  border-radius: 999px;
  background: var(--sidebar-accent);
}

:global(.sidebar-menu > li > a.active-page .menu-icon),
:global(.sidebar-menu > li.dropdown.open > a .menu-icon),
:global(.sidebar-menu > li.dropdown > a.active .menu-icon) {
  color: var(--sidebar-accent);
  background: transparent;
  box-shadow: none;
}

:global(.sidebar-menu li.dropdown > a::after) {
  display: none;
}

.sidebar-chevron {
  margin-left: auto;
  color: currentColor;
  font-size: 17px;
  opacity: .7;
  transition: transform .2s ease;
}

.sidebar-chevron.rotated {
  transform: rotate(90deg);
}

:global(.sidebar-menu .sidebar-submenu) {
  position: relative;
  margin: 4px 0 8px 26px;
  padding: 4px 0 4px 14px;
}

:global(.sidebar-menu .sidebar-submenu::before) {
  content: '';
  position: absolute;
  inset-block: 2px;
  inset-inline-start: 0;
  width: 1px;
  background: #e5eaf1;
}

:global(.sidebar-menu .sidebar-submenu li a) {
  position: relative;
  min-height: 36px;
  padding: 7px 10px;
  gap: 9px;
  border-radius: 8px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

:global(.sidebar-menu .sidebar-submenu li a:hover) {
  color: #1e293b;
  background: #f8fafc;
}

:global(.sidebar-menu .sidebar-submenu li.active-page a) {
  color: #0f172a;
  background: transparent;
  font-weight: 600;
}

:global(.sidebar-menu .sidebar-submenu li.active-page a::before) {
  content: '';
  position: absolute;
  inset-block: 8px;
  inset-inline-start: -15px;
  width: 2px;
  border-radius: 999px;
  background: var(--sidebar-accent);
}

:global(.sidebar-menu .sidebar-submenu .menu-icon) {
  width: 16px;
  height: 16px;
  margin: 0;
  flex: 0 0 16px;
  color: currentColor !important;
  font-size: 13px;
}

.sidebar-close-btn {
  top: 18px;
  inset-inline-end: 14px;
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  background: #ffffff;
  box-shadow: none;
}

:global(.sidebar.active) {
  /* Collapsed desktop rail: icons remain centered and labels reappear on hover. */
  width: 72px;
}

:global(.sidebar.active:hover) {
  width: 260px;
}

:global(.sidebar.active .sidebar-logo) {
  justify-content: center;
  padding-inline: 10px;
}

:global(.sidebar.active .sidebar-menu-area) {
  padding-inline: 10px;
}

:global(.sidebar.active .sidebar-menu > li > a) {
  justify-content: center;
  padding-inline: 8px;
}

:global(.sidebar.active:hover .sidebar-menu > li > a) {
  justify-content: flex-start;
  padding-inline: 14px;
}

:global(.sidebar.active .sidebar-logo .sidebar-brand-block),
:global(.sidebar.active .sidebar-logo .feeta-logo-full),
:global(.sidebar.active .sidebar-menu-group-title span),
:global(.sidebar.active .sidebar-chevron),
:global(.sidebar.active .sidebar-bottom) {
  display: none;
}

:global(.sidebar.active .sidebar-logo .feeta-logo-icon) {
  display: inline-block;
}

:global(.sidebar.active:hover .sidebar-logo .sidebar-brand-block) {
  display: grid;
}

:global(.sidebar.active:hover .sidebar-logo .feeta-logo-full) {
  display: inline-block;
}

:global(.sidebar.active:hover .sidebar-menu-group-title span),
:global(.sidebar.active:hover .sidebar-chevron) {
  display: inline-flex;
}

:global(.sidebar.active:hover .sidebar-bottom) {
  display: grid;
}

:global(.sidebar.active:hover .sidebar-logo .feeta-logo-icon) {
  display: none;
}

:global([data-theme=dark] .sidebar) {
  --sidebar-accent-soft: rgba(37, 99, 235, .14);
  --sidebar-ink: #f1f5f9;
  --sidebar-muted: #a5b0c1;
  border-color: #263244;
  background: #111827;
  box-shadow: none;
}

:global([data-theme=dark] .sidebar-logo) {
  border-color: #263244;
  background: #111827;
}

:global([data-theme=dark] .sidebar-brand-block strong) {
  color: #f8fafc;
}

:global([data-theme=dark] .sidebar-brand-block small) {
  color: #94a3b8;
}

:global([data-theme=dark] .sidebar-menu-group-title span::after),
:global([data-theme=dark] .sidebar-menu .sidebar-submenu::before) {
  background: #2a3648;
}

:global([data-theme=dark] .sidebar-menu > li:not(.sidebar-menu-group-title) > a:hover),
:global([data-theme=dark] .sidebar-menu .sidebar-submenu li a:hover) {
  border-color: #2b3749;
  background: #182235;
}

:global([data-theme=dark] .sidebar-menu > li > a .menu-icon) {
  color: #a5b0c1;
  background: transparent;
}

:global([data-theme=dark] .sidebar-admin-card) {
  border-color: #263244;
  background: #182235;
}

:global([data-theme=dark] .sidebar-admin-action) {
  border-color: #2b3749;
  background: #111827;
}

@media (max-width: 1199px) {
  .sidebar {
    width: min(260px, calc(100vw - 36px));
  }
}

.sidebar-bottom {
  display: grid;
  gap: 12px;
  margin-top: auto;
  padding-top: 18px;
}

.sidebar-help-card {
  /* Replaces the previous promotional card treatment with a small outline support card. */
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #0f172a;
  background: #ffffff;
  box-shadow: none;
}

.sidebar-help-icon {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 32px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #64748b;
  background: #f8fafc;
  font-size: 17px;
}

.sidebar-help-copy {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 2px 8px;
}

.sidebar-help-card strong,
.sidebar-admin-meta strong {
  font-size: 14px;
  font-weight: 600;
}

.sidebar-help-card small {
  color: #64748b;
  font-size: 12px;
}

.sidebar-admin-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
}

.sidebar-admin-avatar {
  width: 38px;
  height: 38px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 38px;
  border-radius: 50%;
  color: #2563eb;
  background: #eff6ff;
  font-size: 13px;
  font-weight: 700;
}

.sidebar-admin-meta {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
}

.sidebar-admin-meta strong,
.sidebar-admin-meta small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-admin-meta small {
  color: #64748b;
  font-size: 12px;
}

.sidebar-admin-action {
  width: 30px;
  height: 30px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 30px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  color: #64748b;
  background: #fff;
  font-size: 15px;
  transition: color .15s ease, background-color .15s ease, border-color .15s ease;
}

.sidebar-admin-action:hover {
  color: #0f172a;
  border-color: #e5e7eb;
  background: #f1f5f9;
}

:global(.dashboard-main) {
  background: #f8fafc;
}

@media (min-width: 1200px) {
  :global(.dashboard-main) {
    margin-inline-start: 260px;
  }

  :global(.dashboard-main.active) {
    margin-inline-start: 72px;
  }
}
</style>

<style>
.sidebar-backdrop { position: fixed; inset: 0; z-index: 998; display: none; border: 0; background: rgba(15, 23, 42, .38); backdrop-filter: blur(3px); animation: sidebar-backdrop-in .18s ease both; }
@media (max-width: 1199px) { .sidebar-backdrop { display: block; } }
@keyframes sidebar-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
</style>
