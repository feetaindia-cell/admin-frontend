import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const RECENT_SEARCH_KEY = 'feeta_global_search_recent'

function readRecentRoutes() {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || '[]')
    return Array.isArray(value) ? value.slice(0, 5) : []
  } catch {
    return []
  }
}

export const searchableRoutes = [
  {
    title: 'Dashboard',
    subtitle: 'Overview of FEETA admin activity',
    route: '/dashboard',
    icon: 'ri:dashboard-3-line',
    permissions: [],
    superOnly: true,
    keywords: ['dashboard', 'home', 'overview', 'stats', 'summary'],
  },
  {
    title: 'Admins',
    subtitle: 'Manage internal admin accounts',
    route: '/admins',
    icon: 'ri:shield-user-line',
    permissions: ['admin.view'],
    keywords: ['admin', 'admins', 'administrator', 'staff', 'management'],
  },
  {
    title: 'Roles',
    subtitle: 'Manage admin roles',
    route: '/roles',
    icon: 'ri:admin-line',
    permissions: ['manage_roles', 'roles.view'],
    superOnly: true,
    keywords: ['role', 'roles', 'rbac', 'access'],
  },
  {
    title: 'Permissions',
    subtitle: 'Review admin permissions',
    route: '/permissions',
    icon: 'ri:shield-keyhole-line',
    permissions: ['manage_permissions', 'permissions.view'],
    superOnly: true,
    keywords: ['permission', 'permissions', 'access', 'rbac'],
  },
  {
    title: 'News',
    subtitle: 'Create and manage news posts',
    route: '/news',
    icon: 'ri:newspaper-line',
    permissions: ['news.view'],
    keywords: ['news', 'article', 'post', 'latest', 'publish'],
  },
  {
    title: 'FAQ Management',
    subtitle: 'Manage FAQ sections and their questions',
    route: '/faqs',
    icon: 'ri:question-answer-line',
    permissions: ['faq.view'],
    keywords: ['faq', 'faqs', 'question', 'answer', 'help', 'support', 'section'],
  },
  {
    title: 'Policy Management',
    subtitle: 'Manage FEETA policy sections',
    route: '/policies',
    icon: 'ri:file-shield-2-line',
    permissions: ['policy.view'],
    keywords: ['policy', 'policies', 'legal', 'compliance'],
  },
  ...Object.entries({ terms: 'Terms & Conditions', privacy: 'Privacy Policy', accessibility: 'Accessibility Policy', media: 'Media Policy' }).map(([type, displayName]) => ({
    title: displayName,
    subtitle: `View ${type} policy sections`,
    route: `/policies/${type}`,
    icon: 'ri:file-shield-2-line',
    permissions: ['policy.view'],
    keywords: [`${type} policy`, type, 'policy section'],
  })),
  {
    title: 'Users',
    subtitle: 'Search user and agent accounts',
    route: '/users-list',
    icon: 'ri:group-line',
    permissions: ['user.view', 'users.view', 'view_users'],
    keywords: ['user', 'users', 'customer', 'account', 'user profile'],
  },
  {
    title: 'User Profiles',
    subtitle: 'Open Users to review complete profiles',
    route: '/users-list',
    icon: 'ri:user-search-line',
    permissions: ['user.view', 'users.view', 'view_users'],
    keywords: ['user profile', 'profile', 'account details'],
  },
  {
    title: 'User Devices',
    subtitle: 'Review registered devices from a user profile',
    route: '/users-list',
    icon: 'ri:smartphone-line',
    permissions: ['user.view', 'users.view', 'view_users'],
    keywords: ['user device', 'devices', 'platform', 'login device'],
  },
  {
    title: 'Favourite Properties',
    subtitle: 'Review saved properties from a user profile',
    route: '/users-list',
    icon: 'ri:heart-3-line',
    permissions: ['user.view', 'users.view', 'view_users'],
    keywords: ['favourite properties', 'favorites', 'saved properties', 'shortlist'],
  },
  {
    title: 'User Enquiries',
    subtitle: 'Review enquiries and property offers by user',
    route: '/users-list',
    icon: 'ri:questionnaire-line',
    permissions: ['user.view', 'users.view', 'view_users'],
    keywords: ['user enquiry', 'enquiries', 'offers', 'contact messages'],
  },
  {
    title: 'Agents',
    subtitle: 'Review agent profiles and verification',
    route: '/agents',
    icon: 'ri:user-star-line',
    permissions: ['agent.view'],
    keywords: ['agent', 'agents', 'broker', 'verification'],
  },
  {
    title: 'Agent Properties',
    subtitle: 'Open agents and review their property listings',
    route: '/agents',
    icon: 'ri:home-4-line',
    permissions: ['agent.properties.view', 'agent.view'],
    keywords: ['agent properties', 'agent listings', 'broker property'],
  },
  {
    title: 'KYC Dashboard',
    subtitle: 'Track verification totals and review queues',
    route: '/kyc',
    icon: 'ri:shield-check-line',
    permissions: ['kyc.view'],
    keywords: ['kyc', 'verification', 'identity', 'dashboard'],
  },
  {
    title: 'Pending KYC',
    subtitle: 'Review submitted KYC requests awaiting action',
    route: '/kyc/pending',
    icon: 'ri:time-line',
    permissions: ['kyc.view'],
    keywords: ['pending kyc', 'submitted kyc', 'verification queue', 'approve kyc', 'reject kyc'],
  },
  {
    title: 'Submitted KYC',
    subtitle: 'View submitted KYC records awaiting review',
    route: '/kyc/submitted',
    icon: 'ri:send-plane-line',
    permissions: ['kyc.view'],
    keywords: ['submitted kyc', 'verification review'],
  },
  {
    title: 'Verified KYC',
    subtitle: 'View verified KYC submissions',
    route: '/kyc/verified',
    icon: 'ri:shield-check-line',
    permissions: ['kyc.view'],
    keywords: ['verified kyc', 'verified agents', 'verification complete'],
  },
  {
    title: 'Rejected KYC',
    subtitle: 'View rejected KYC submissions',
    route: '/kyc/rejected',
    icon: 'ri:close-circle-line',
    permissions: ['kyc.view'],
    keywords: ['rejected kyc', 'failed verification', 'kyc rejection'],
  },
  {
    title: 'Master Property Values',
    subtitle: 'Categories, child groups, components and options',
    route: '/master-properties/categories',
    icon: 'ri:stack-line',
    permissions: ['master_property.view'],
    keywords: ['master property', 'category', 'categories', 'child', 'component', 'option', 'values'],
  },
  {
    title: 'Properties',
    subtitle: 'View and manage all property listings',
    route: '/properties',
    icon: 'ri:building-2-line',
    permissions: ['property.view'],
    keywords: ['property', 'properties', 'listing', 'real estate', 'approval'],
  },
  {
    title: 'Payments',
    subtitle: 'Track Razorpay payments and invoices',
    route: '/payments',
    icon: 'ri:bank-card-line',
    permissions: ['payment.view'],
    keywords: ['payment', 'payments', 'razorpay', 'invoice', 'transaction'],
  },
  {
    title: 'Credits',
    subtitle: 'Agent credit dashboard and wallets',
    route: '/credits',
    icon: 'ri:coins-line',
    permissions: ['credit.view'],
    keywords: ['credit', 'credits', 'wallet', 'wallets', 'agent credits'],
  },
  {
    title: 'Credit Wallets',
    subtitle: 'View agent wallet balances and adjust credits',
    route: '/credits/wallets',
    icon: 'ri:wallet-3-line',
    permissions: ['credit.view'],
    keywords: ['wallet', 'wallets', 'balance', 'agent wallet', 'add credits', 'deduct credits'],
  },
  {
    title: 'Credit Transactions',
    subtitle: 'Open wallets to review agent transaction history',
    route: '/credits/wallets',
    icon: 'ri:receipt-line',
    permissions: ['credit.history'],
    keywords: ['transaction', 'transactions', 'credit history', 'ledger', 'balance before', 'balance after'],
  },
  {
    title: 'Manual Transfers',
    subtitle: 'Review manual bank transfer requests',
    route: '/credits/manual-transfers',
    icon: 'ri:bank-line',
    permissions: ['credit.view'],
    keywords: ['manual transfer', 'bank transfer', 'transfer', 'credits', 'approval'],
  },
]

export const localSearchRoutes = [
  '/properties',
  '/agents',
  '/users-list',
  '/users',
  '/payments',
  '/news',
  '/faqs',
  '/policies',
  '/kyc/all',
  '/kyc/pending',
  '/kyc/submitted',
  '/kyc/verified',
  '/kyc/rejected',
  '/admins',
  '/master-properties/categories',
  '/master-properties/children',
  '/master-properties/components',
  '/master-properties/options',
  '/credits/wallets',
  '/credits/manual-transfers',
]

function supportsLocalSearch(path) {
  return localSearchRoutes.includes(path) || /^\/agents\/[^/]+\/properties$/.test(path)
}

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function matches(item, term) {
  const haystack = [
    item.title,
    item.subtitle,
    item.route,
    ...(item.keywords || []),
  ].join(' ').toLowerCase()
  return haystack.includes(term)
}

function canSee(item, auth) {
  if (item.superOnly && !auth.isSuperAdmin()) return false
  return auth.hasAnyPermission(item.permissions || [])
}

export function useGlobalSearch() {
  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  const search = ref('')
  const debouncedSearch = ref('')
  const isOpen = ref(false)
  const selectedIndex = ref(0)
  const recentRoutes = ref(readRecentRoutes())
  let timer

  const visibleRoutes = computed(() => searchableRoutes.filter((item) => canSee(item, auth)))
  const currentPageSupportsSearch = computed(() => supportsLocalSearch(route.path))
  const showingRecent = computed(() => !normalize(debouncedSearch.value) && recentRoutes.value.length > 0)
  const results = computed(() => {
    const term = normalize(debouncedSearch.value)
    if (!term) return recentRoutes.value.filter((item) => canSee(item, auth)).slice(0, 5)
    return visibleRoutes.value.filter((item) => matches(item, term)).slice(0, 8)
  })

  watch(search, (value) => {
    window.clearTimeout(timer)
    const term = String(value || '').trim()
    if (!term) {
      debouncedSearch.value = ''
      selectedIndex.value = 0
      return
    }
    timer = window.setTimeout(() => {
      debouncedSearch.value = term
      isOpen.value = true
      selectedIndex.value = 0
    }, 220)
  })

  watch(() => route.fullPath, () => {
    isOpen.value = false
    search.value = ''
    debouncedSearch.value = ''
    selectedIndex.value = 0
  })

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    selectedIndex.value = 0
  }

  function move(delta) {
    if (!results.value.length) return
    isOpen.value = true
    selectedIndex.value = (selectedIndex.value + delta + results.value.length) % results.value.length
  }

  function applyCurrentPageSearch() {
    const term = search.value.trim()
    if (!term || !currentPageSupportsSearch.value) return false
    router.push({
      path: route.path,
      query: {
        ...route.query,
        page: undefined,
        search: term,
      },
    })
    close()
    return true
  }

  function navigateTo(item = results.value[selectedIndex.value]) {
    if (!item) return false
    const recentItem = {
      title: item.title,
      subtitle: item.subtitle,
      route: item.route,
      icon: item.icon,
      permissions: item.permissions || [],
      superOnly: Boolean(item.superOnly),
      keywords: item.keywords || [],
    }
    recentRoutes.value = [recentItem, ...recentRoutes.value.filter((recent) => recent.route !== item.route || recent.title !== item.title)].slice(0, 5)
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(recentRoutes.value))
    router.push(item.route)
    close()
    return true
  }

  function submit() {
    if (currentPageSupportsSearch.value && search.value.trim()) {
      return applyCurrentPageSearch()
    }
    return navigateTo()
  }

  function clear() {
    search.value = ''
    debouncedSearch.value = ''
    close()
  }

  return {
    search,
    debouncedSearch,
    isOpen,
    selectedIndex,
    results,
    showingRecent,
    currentPageSupportsSearch,
    open,
    close,
    move,
    submit,
    navigateTo,
    clear,
  }
}
