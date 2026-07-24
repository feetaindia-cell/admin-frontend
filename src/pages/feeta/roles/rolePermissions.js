export const moduleLabels = {
  dashboard: 'Dashboard',
  admins: 'Admin Management',
  news: 'News Management',
  master_property: 'Master Property Management',
  agents: 'Agent Management',
  users: 'User Management',
  properties: 'Property Management',
  payments: 'Payment Management',
  credits: 'Credit Management',
  access_control: 'Roles & Permissions',
  roles: 'Roles & Permissions',
  permissions: 'Roles & Permissions',
  faqs: 'FAQ Management',
  policies: 'Policy Management',
  kyc: 'KYC Management',
  activity_logs: 'Activity Logs',
  settings: 'Settings',
}

export const permissionLabels = {
  'admin.view': 'View Admins',
  'admin.create': 'Create Admin',
  'admin.update': 'Edit Admins',
  'admin.delete': 'Delete Admins',
  'admin.status': 'Change Admin Status',
  'admin.role.assign': 'Assign Role',
  'admin.password.reset': 'Reset Admin Password',
  'admin.reset_password': 'Reset Admin Password',
  'dashboard.view': 'View Dashboard',
  'news.view': 'View News',
  'news.create': 'Create News',
  'news.update': 'Edit News',
  'news.publish': 'Publish News',
  'news.archive': 'Archive News',
  'news.delete': 'Delete News',
  'master_property.view': 'View',
  'master_property.create': 'Create',
  'master_property.update': 'Update',
  'master_property.status': 'Change Status',
  'master_property.delete': 'Delete',
  'agent.view': 'View Agents',
  'agent.update': 'Edit Agents',
  'agent.status': 'Change Agent Status',
  'agent.verify': 'Verify Agents',
  'agent.delete': 'Delete Agents',
  'agent.properties.view': 'View Agent Properties',
  'agent.properties.update': 'Edit Agent Properties',
  'agent.properties.status': 'Change Property Status',
  'agent.properties.delete': 'Delete Agent Properties',
  'property.view': 'View Properties',
  'property.create': 'Create Properties',
  'property.update': 'Edit Properties',
  'property.status': 'Change Property Status',
  'property.approve': 'Approve Properties',
  'property.reject': 'Reject Properties',
  'property.feature': 'Feature Property',
  'property.delete': 'Delete Property',
  'property.media.view': 'View Property Media',
  'property.analytics.view': 'View Property Analytics',
  'property.payment.view': 'View Property Payment',
  'payment.view': 'View Payments',
  'payment.detail': 'View Payment Details',
  'payment.status': 'Change Payment Status',
  'payment.export': 'Export Payments',
  'payment.invoice.view': 'View Invoice',
  'payment.sync': 'Sync Payment',
  'payment.refund': 'Refund Payment',
  'credit.view': 'View Credits',
  'credit.add': 'Add Credits',
  'credit.deduct': 'Deduct Credits',
  'credit.approve': 'Approve Transfer',
  'credit.reject': 'Reject Transfer',
  'credit.history': 'View Credit History',
  'credit.export': 'Export Credit Data',
  'faq.view': 'View FAQs',
  'faq.create': 'Create FAQs',
  'faq.update': 'Update FAQs',
  'faq.delete': 'Delete FAQs',
  'faq.status': 'Change FAQ Status',
  'faq.reorder': 'Reorder FAQs',
  'policy.view': 'View Policies',
  'policy.create': 'Create Policies',
  'policy.update': 'Update Policies',
  'policy.delete': 'Delete Policies',
  'policy.status': 'Change Policy Status',
  'policy.reorder': 'Reorder Policies',
  'kyc.view': 'View KYC',
  'kyc.approve': 'Approve KYC',
  'kyc.reject': 'Reject KYC',
  'kyc.history': 'View KYC History',
  'kyc.statistics': 'View KYC Statistics',
  'role.view': 'View Roles',
  'role.create': 'Create Roles',
  'role.update': 'Update Roles',
  'role.delete': 'Delete Roles',
  'permission.view': 'View Permissions',
  'permission.assign': 'Assign Permissions',
  'permission.sync': 'Sync Permissions',
  'roles.view': 'View Roles',
  'roles.create': 'Create Roles',
  'roles.edit': 'Edit Roles',
  'roles.delete': 'Delete Roles',
  'permissions.view': 'View Permissions',
  'users.view': 'View Users',
  'users.create': 'Create Users',
  'users.edit': 'Edit Users',
  'users.delete': 'Delete Users',
}

export function moduleLabel(module) {
  return moduleLabels[module] || String(module).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function permissionLabel(permission) {
  return permissionLabels[permission.name] || permission.description || permission.name
}

export function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (payload?.data !== undefined) return normalizeList(payload.data)
  return []
}

const groupOrder = [
  'dashboard', 'admins', 'access_control', 'news', 'master_property', 'properties',
  'agents', 'users', 'payments', 'credits', 'faqs', 'policies', 'kyc',
]

export function groupPermissionModules(groups) {
  const merged = new Map()

  normalizeList(groups).forEach((group) => {
    const key = ['roles', 'permissions'].includes(group.module) ? 'access_control' : group.module
    const current = merged.get(key) || { module: key, permissions: [] }
    const existingIds = new Set(current.permissions.map((permission) => permission.id))
    normalizeList(group.permissions).forEach((permission) => {
      if (!existingIds.has(permission.id)) current.permissions.push(permission)
    })
    merged.set(key, current)
  })

  return [...merged.values()].sort((left, right) => {
    const leftIndex = groupOrder.indexOf(left.module)
    const rightIndex = groupOrder.indexOf(right.module)
    return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex)
      || moduleLabel(left.module).localeCompare(moduleLabel(right.module))
  })
}

export function isProtectedRole(role) {
  return role?.role_type?.code === 'super_admin' || Number(role?.id) === 1
}
