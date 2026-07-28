import features from './features.js'

export const sidebarItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'lucide:layout-dashboard',
    permissions: [],
  },
  {
    key: 'admins',
    label: 'Admin Management',
    icon: 'lucide:shield-user',
    permissions: ['admin.view'],
    children: [
      { label: 'Admin List', path: '/admins', icon: 'lucide:user-cog', permissions: ['admin.view'] },
      { label: 'Create Admin', path: '/admins/create', icon: 'lucide:user-plus', permissions: ['admin.create'] },
    ],
  },
  {
    key: 'access-control',
    label: 'Roles & Permissions',
    icon: 'lucide:key-round',
    permissions: ['role.view', 'permission.view'],
    children: [
      { label: 'Roles', path: '/roles', icon: 'lucide:id-card', permissions: ['role.view'] },
      { label: 'Create Role', path: '/roles/create', icon: 'lucide:circle-plus', permissions: ['role.create'] },
      { label: 'Permissions', path: '/permissions', icon: 'lucide:key-round', permissions: ['permission.view'] },
    ],
  },
  {
    key: 'news',
    label: 'News Management',
    icon: 'lucide:newspaper',
    permissions: ['news.view'],
    children: [
      { label: 'News List', path: '/news', icon: 'lucide:list', permissions: ['news.view'] },
      { label: 'Latest News', path: '/latest-news', icon: 'lucide:newspaper', permissions: ['news.view'] },
      { label: 'Create News', path: '/news/create', icon: 'lucide:file-plus-2', permissions: ['news.create'] },
    ],
  },
  {
    key: 'master-properties',
    label: 'Master Management',
    icon: 'lucide:layers',
    permissions: ['master_property.view'],
    children: [
      { label: 'Overview / Tree', path: '/master-properties', icon: 'lucide:network', permissions: ['master_property.view'] },
      { label: 'Categories', path: '/master-properties/categories', icon: 'lucide:layers', permissions: ['master_property.view'] },
      { label: 'Child Groups', path: '/master-properties/children', icon: 'lucide:git-merge', permissions: ['master_property.view'] },
      { label: 'Components', path: '/master-properties/components', icon: 'lucide:puzzle', permissions: ['master_property.view'] },
      { label: 'Options', path: '/master-properties/options', icon: 'lucide:list-checks', permissions: ['master_property.view'] },
    ],
  },
  {
    key: 'location-management',
    label: 'Location Management',
    path: '/master/locations',
    icon: 'lucide:map',
    permissions: ['state.view'],
  },
  {
    key: 'property-management',
    label: 'Property Management',
    icon: 'lucide:building-2',
    permissions: ['property.view'],
    children: [
      { label: 'All Properties', path: '/properties', icon: 'lucide:house', permissions: ['property.view'] },
      ...(features.propertyFeatured ? [{ label: 'Featured Properties', path: '/properties/featured', icon: 'lucide:crown', permissions: ['property.view'] }] : []),
      { label: 'Property Approvals', path: '/properties/pending', icon: 'lucide:shield-check', permissions: ['property.view'] },
      { label: 'Archived Properties', path: '/properties/archived', icon: 'lucide:archive', permissions: ['property.view'] },
      { label: 'Deleted Properties', path: '/properties/deleted', icon: 'lucide:trash-2', permissions: ['property.view'] },
      { label: 'Offers', path: '/offers', icon: 'lucide:hand-coins', permissions: ['property.view'] },
    ],
  },
  {
    key: 'lead-management',
    label: 'Lead Management',
    path: '/leads',
    icon: 'lucide:contact',
    permissions: ['lead.view'],
  },
  {
    key: 'feeta-circle-applications',
    label: 'FEETA Circle Applications',
    path: '/feeta-circle/applications',
    icon: 'lucide:users',
    permissions: ['feeta_circle.application.view'],
  },
  {
    key: 'agents',
    label: 'Agent Management',
    icon: 'lucide:user-star',
    permissions: ['agent.view'],
    children: [
      { label: 'Agent List', path: '/agents', icon: 'lucide:user-star', permissions: ['agent.view'] },
    ],
  },
  {
    key: 'users',
    label: 'User Management',
    path: '/users',
    icon: 'lucide:users',
    permissions: ['user.view'],
  },
  {
    key: 'payments',
    label: 'Payment Management',
    icon: 'lucide:credit-card',
    permissions: ['payment.view'],
    children: [
      { label: 'Payments', path: '/payments', icon: 'lucide:credit-card', permissions: ['payment.view'] },
      { label: 'Statistics', path: '/payments/statistics', icon: 'lucide:chart-column', permissions: ['payment.view'] },
    ],
  },
  {
    key: 'credits',
    label: 'Credit Management',
    icon: 'lucide:coins',
    permissions: ['credit.view'],
    children: [
      { label: 'Credit Dashboard', path: '/credits', icon: 'lucide:layout-dashboard', permissions: ['credit.view'] },
      { label: 'Agent Wallets', path: '/credits/wallets', icon: 'lucide:wallet-cards', permissions: ['credit.view'] },
      { label: 'Manual Transfers', path: '/credits/manual-transfers', icon: 'lucide:landmark', permissions: ['credit.view'] },
    ],
  },
  {
    key: 'faqs',
    label: 'FAQ Management',
    path: '/faqs',
    icon: 'lucide:circle-help',
    permissions: ['faq.view'],
  },
  {
    key: 'policies',
    label: 'Policy Management',
    path: '/policies',
    icon: 'lucide:file-shield',
    permissions: ['policy.view'],
  },
  {
    key: 'kyc-management',
    label: 'KYC Management',
    icon: 'lucide:shield-check',
    permissions: ['kyc.view'],
    children: [
      { label: 'KYC Dashboard', path: '/kyc', icon: 'lucide:layout-dashboard', permissions: ['kyc.view'] },
      { label: 'Pending KYC', path: '/kyc/pending', icon: 'lucide:clock', permissions: ['kyc.view'] },
      { label: 'Submitted KYC', path: '/kyc/submitted', icon: 'lucide:send', permissions: ['kyc.view'] },
      { label: 'Verified KYC', path: '/kyc/verified', icon: 'lucide:shield-check', permissions: ['kyc.view'] },
      { label: 'Rejected KYC', path: '/kyc/rejected', icon: 'lucide:circle-x', permissions: ['kyc.view'] },
    ],
  },
]

export function filterSidebarItems(items, auth) {
  return items
    .map((item) => {
      if (item.superOnly && !auth.isSuperAdmin()) return null
      const children = item.children?.filter((child) => {
        if (child.superOnly && !auth.isSuperAdmin()) return false
        return auth.hasAnyPermission(child.permissions || [])
      }) || []
      const allowed = auth.hasAnyPermission(item.permissions || []) || children.length > 0
      return allowed ? { ...item, children } : null
    })
    .filter(Boolean)
}

export function getFirstAllowedSidebarPath(auth, fallback = '/forbidden') {
  const firstItem = filterSidebarItems(sidebarItems, auth).find(Boolean)
  return firstItem?.path || firstItem?.children?.[0]?.path || fallback
}
