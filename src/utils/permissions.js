const aliases = {
  'dashboard.view': ['view_dashboard'],
  'admin.view': ['admins.view', 'manage_admins'],
  'admin.create': ['admins.create', 'manage_admins'],
  'admin.update': ['admins.edit', 'manage_admins'],
  'admin.delete': ['admins.delete', 'manage_admins'],
  'admin.status': ['manage_admins'],
  'admin.role.assign': ['manage_admins'],
  'admin.reset_password': ['admin.password.reset', 'manage_admins'],
  'admin.password.reset': ['admin.reset_password', 'manage_admins'],
  'role.view': ['roles.view', 'manage_roles'],
  'role.create': ['roles.create', 'manage_roles'],
  'role.update': ['roles.edit', 'manage_roles'],
  'role.delete': ['roles.delete', 'manage_roles'],
  'permission.view': ['permissions.view', 'manage_permissions'],
  'permission.assign': ['permissions.create', 'permissions.edit', 'manage_permissions'],
  'permission.sync': ['permissions.edit', 'manage_permissions'],
  'state.view': ['state.view'],
  'state.create': ['state.create'],
  'state.edit': ['state.edit', 'state.update'],
  'state.update': ['state.edit', 'state.update'],
  'state.delete': ['state.delete'],
  'city.view': ['city.view'],
  'city.create': ['city.create'],
  'city.edit': ['city.edit', 'city.update'],
  'city.update': ['city.edit', 'city.update'],
  'city.delete': ['city.delete'],
  'locality.view': ['locality.view'],
  'locality.create': ['locality.create'],
  'locality.edit': ['locality.edit', 'locality.update'],
  'locality.update': ['locality.edit', 'locality.update'],
  'locality.delete': ['locality.delete'],
  'property.view': ['properties.view', 'manage_properties'],
  'property.create': ['properties.create', 'manage_properties'],
  'property.update': ['properties.edit', 'manage_properties'],
  'property.delete': ['properties.delete', 'manage_properties'],
  'property.status': ['manage_properties'],
  'property.approve': ['property.status', 'manage_properties'],
  'property.reject': ['property.status', 'manage_properties'],
  'agent.view': ['view_agents', 'manage_agents'],
  'agent.create': ['manage_agents'],
  'agent.update': ['manage_agents'],
  'agent.delete': ['manage_agents'],
  'agent.status': ['manage_agents'],
  'agent.kyc': ['agent.verify', 'view_kyc', 'manage_agents'],
  'agent.verify': ['agent.kyc', 'manage_agents'],
  'agent.properties': ['agent.properties.view', 'manage_agents'],
  'agent.properties.view': ['agent.properties', 'manage_agents'],
  'user.view': ['users.view', 'view_users', 'manage_users'],
  'user.profile': ['user.view', 'users.view', 'view_users', 'manage_users'],
  'user.create': ['users.create', 'manage_users'],
  'user.update': ['users.edit', 'manage_users'],
  'user.delete': ['users.delete', 'delete_users', 'manage_users'],
  'user.status': ['users.edit', 'restore_users', 'manage_users'],
  'faq.create': ['faq.section.create', 'faq.item.create', 'manage_faqs'],
  'faq.update': ['faq.section.update', 'faq.item.update', 'manage_faqs'],
  'faq.delete': ['faq.section.delete', 'faq.item.delete', 'manage_faqs'],
  'faq.status': ['faq.section.status', 'faq.item.status', 'manage_faqs'],
  'faq.reorder': ['faq.sort', 'faq.item.sort', 'manage_faqs'],
  'faq.section.create': ['faq.create', 'manage_faqs'],
  'faq.section.update': ['faq.update', 'manage_faqs'],
  'faq.section.delete': ['faq.delete', 'manage_faqs'],
  'faq.section.status': ['faq.status', 'manage_faqs'],
  'faq.item.create': ['faq.create', 'manage_faqs'],
  'faq.item.update': ['faq.update', 'manage_faqs'],
  'faq.item.delete': ['faq.delete', 'manage_faqs'],
  'faq.item.status': ['faq.status', 'manage_faqs'],
  'faq.item.sort': ['faq.reorder', 'faq.sort', 'manage_faqs'],
  'kyc.view': ['view_kyc', 'manage_kyc'],
  'kyc.history': ['kyc.history.view', 'kyc.view', 'view_kyc', 'manage_kyc'],
  'kyc.history.view': ['kyc.history', 'kyc.view', 'view_kyc', 'manage_kyc'],
  'kyc.statistics': ['kyc.view', 'view_kyc', 'manage_kyc'],
  'payment.detail': ['payment.view'],
}

export function normalizePermissions(value) {
  const list = Array.isArray(value)
    ? value
    : value?.permissions || value?.data?.permissions || []

  return [...new Set(list
    .map((item) => typeof item === 'string' ? item : item?.name || item?.slug || item?.permission)
    .filter(Boolean))]
}

export function permissionCandidates(permission) {
  return [permission, ...(aliases[permission] || [])]
}

export function hasPermission(assignedPermissions, permission) {
  if (!permission) return true
  const assigned = new Set(normalizePermissions(assignedPermissions))
  return permissionCandidates(permission).some((candidate) => assigned.has(candidate))
}

export function hasAnyPermission(assignedPermissions, permissions = []) {
  return !permissions.length || permissions.some((permission) => hasPermission(assignedPermissions, permission))
}

export function hasAllPermissions(assignedPermissions, permissions = []) {
  return permissions.every((permission) => hasPermission(assignedPermissions, permission))
}

export function isSuperAdmin(admin) {
  const identifiers = [
    admin?.role?.name,
    admin?.role?.type,
    admin?.role?.code,
    admin?.role?.role_type?.name,
    admin?.role?.role_type?.code,
    admin?.role_name,
    typeof admin?.role === 'string' ? admin.role : null,
  ].filter(Boolean).map((value) => String(value).trim().toLowerCase().replaceAll('_', '-'))

  return Boolean(admin?.is_super_admin || identifiers.some((role) => [
    'super admin', 'super-admin', 'superadmin', 'super administrator', 'super-administrator',
  ].includes(role)))
}
