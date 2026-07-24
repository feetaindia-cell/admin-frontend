<template>
  <div class="navbar-header">
    <div class="row align-items-center justify-content-between">
      <div class="col-auto">
        <div class="d-flex flex-wrap align-items-center gap-4">
          <button type="button" class="sidebar-toggle" :aria-expanded="String(!isSidebarActive)" aria-label="Toggle sidebar" @click="toggleSidebarDesktop">
            <iconify-icon :icon="isSidebarActive ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" class="icon text-2xl"></iconify-icon>
          </button>

          <button type="button" @click="toggleSidebarMobile" class="sidebar-mobile-toggle" aria-label="Open navigation">
            <iconify-icon icon="lucide:menu" class="icon"></iconify-icon>
          </button>

          <GlobalSearch />
        </div>
      </div>
      <div class="col-auto">
        <div class="d-flex flex-wrap align-items-center gap-3">
          <button type="button" @click="toggleTheme" data-theme-toggle class="header-icon-button" :aria-label="'Switch from ' + theme + ' theme'">
            <iconify-icon :icon="theme === 'dark' ? 'lucide:sun' : 'lucide:moon'" />
          </button>

          <router-link to="/notifications" class="header-icon-button notification-button" aria-label="Open notifications" title="Notifications">
            <iconify-icon icon="lucide:bell" />
            <span v-if="notificationBadge" class="notification-badge" aria-label="Unread notifications">{{ notificationBadge }}</span>
          </router-link>
<!-- 
          <router-link :to="homePath" class="navbar-brand-mark d-flex align-items-center">
            <img :src="branding.logo" :alt="`${branding.appName} logo`" class="navbar-brand-logo">
          </router-link> -->

          <div class="dropdown">
            <button class="admin-avatar-button w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle" type="button" data-bs-toggle="dropdown" :aria-label="adminName">
              {{ adminInitials }}
            </button>
            <div class="dropdown-menu to-top dropdown-menu-sm admin-dropdown">
              <div class="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                <div>
                  <h6 class="text-lg text-primary-light fw-semibold mb-2">{{ adminName }}</h6>
                  <span class="text-secondary-light fw-medium text-sm d-block">{{ adminEmail }}</span>
                  <span class="text-secondary-light fw-medium text-sm">{{ auth.roleName }}</span>
                </div>
              </div>
              <ul class="to-top-list">
                <li>
                  <router-link class="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3" to="/profile">
                    <iconify-icon icon="lucide:user-cog" class="icon text-xl"></iconify-icon>
                    Profile
                  </router-link>
                </li>
                <li v-if="auth.isSuperAdmin()">
                  <router-link class="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3" to="/dashboard">
                    <iconify-icon icon="lucide:layout-dashboard" class="icon text-xl"></iconify-icon>
                    Dashboard
                  </router-link>
                </li>
                <li>
                  <button type="button" class="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3" @click="logout">
                    <iconify-icon icon="lucide:log-out" class="icon text-xl"></iconify-icon>
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GlobalSearch from '@/components/common/GlobalSearch.vue'
import { useTheme } from '@/composables/useTheme.js'
import branding from '@/config/branding'
import { getFirstAllowedSidebarPath } from '@/config/sidebar'
import notificationService from '@/services/notificationService'
import { useAuthStore } from '@/stores/auth'

const { theme, toggleTheme } = useTheme()
const auth = useAuthStore()
const router = useRouter()
const isSidebarActive = ref(false)
const unreadNotifications = ref(0)
const COLLAPSED_KEY = 'feeta_sidebar_collapsed'

const adminName = computed(() => auth.admin?.name || 'FEETA Admin')
const adminEmail = computed(() => auth.admin?.email || 'admin')
const homePath = computed(() => getFirstAllowedSidebarPath(auth))
const notificationBadge = computed(() => unreadNotifications.value > 99 ? '99+' : unreadNotifications.value)
const adminInitials = computed(() => {
  return adminName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
})

function toggleSidebarDesktop() {
  isSidebarActive.value = !isSidebarActive.value
  applySidebarState()
  localStorage.setItem(COLLAPSED_KEY, String(isSidebarActive.value))
}

function toggleSidebarMobile() {
  window.dispatchEvent(new CustomEvent('feeta:sidebar-mobile-open'))
}

function applySidebarState() {
  document.querySelector('.sidebar')?.classList.toggle('active', isSidebarActive.value)
  document.querySelector('.dashboard-main')?.classList.toggle('active', isSidebarActive.value)
}

function handleScroll() {
  document.querySelector('.navbar-header')?.classList.toggle('is-scrolled', window.scrollY > 6)
}

async function loadUnreadNotifications() {
  try {
    const result = await notificationService.unreadCount()
    unreadNotifications.value = Number(result?.unread_count ?? result?.meta?.unread_count ?? result?.count ?? 0)
  } catch (error) {
    unreadNotifications.value = 0
  }
}

onMounted(() => {
  isSidebarActive.value = localStorage.getItem(COLLAPSED_KEY) === 'true'
  applySidebarState()
  handleScroll()
  loadUnreadNotifications()
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))

async function logout() {
  await auth.logout()
  router.push('/sign-in')
}
</script>

<style>
.navbar-header {
  /* Sticky SaaS header: white surface, thin divider, no shadow-heavy template chrome. */
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  backdrop-filter: none;
  z-index: 20;
  font-family: Inter, sans-serif;
  transition: border-color .2s ease, background-color .2s ease;
}

.navbar-header.is-scrolled {
  box-shadow: none;
}

.navbar-header > .row {
  width: 100%;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #64748b;
  background: #fff;
  font-size: 18px;
  transition: color .15s ease, background-color .15s ease, border-color .15s ease;
}

.sidebar-mobile-toggle {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #64748b;
  background: #fff;
  font-size: 18px;
  transition: color .15s ease, background-color .15s ease, border-color .15s ease;
}

.sidebar-toggle:hover,
.sidebar-mobile-toggle:hover {
  color: #0f172a;
  border-color: #e5e7eb;
  background: #f1f5f9;
}

.navbar-brand-mark {
  text-decoration: none;
}

.navbar-brand-logo {
  width: 112px;
  max-height: 36px;
  object-fit: contain;
}

.admin-avatar-button {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #2563eb;
  font-weight: 700;
  font-size: 13px;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}

.admin-avatar-button:hover {
  border-color: #e5e7eb;
  background: #f1f5f9;
  color: #0f172a;
  box-shadow: none;
}

.header-icon-button {
  /* Header action buttons stay circular and neutral until hover/focus. */
  position: relative;
  width: 40px;
  height: 40px;
  display: inline-grid;
  place-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  color: #64748b;
  background: #fff;
  font-size: 18px;
  transition: color .15s ease, background-color .15s ease, border-color .15s ease;
}

.header-icon-button:hover {
  color: #0f172a;
  border-color: #e5e7eb;
  background: #f1f5f9;
  box-shadow: none;
}

.notification-button {
  text-decoration: none;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -3px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid #fff;
  border-radius: 999px;
  color: #fff;
  background: #2563eb;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}

.admin-dropdown {
  min-width: 260px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, .08);
  transform-origin: top right;
}

.admin-dropdown .bg-primary-50 {
  /* Local override for inherited template color utilities inside the profile dropdown. */
  border: 1px solid #e5e7eb;
  background: #f8fafc !important;
}

.admin-dropdown h6 {
  color: #0f172a !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}

.admin-dropdown .dropdown-item {
  border-radius: 8px;
  color: #0f172a !important;
  font-size: 14px;
  font-weight: 500;
}

.admin-dropdown .dropdown-item:hover,
.admin-dropdown .dropdown-item:focus {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}

@media (max-width: 767px) {
  .navbar-header {
    height: auto;
    min-height: 72px;
    padding: 12px 16px;
  }
}
</style>
