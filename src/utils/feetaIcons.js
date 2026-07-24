const STATUS_ICON_MAP = {
  active: 'ri:checkbox-circle-line',
  approved: 'ri:checkbox-circle-line',
  success: 'ri:checkbox-circle-line',
  paid: 'ri:checkbox-circle-line',
  published: 'ri:checkbox-circle-line',
  verified: 'ri:shield-check-line',
  pending: 'ri:time-line',
  submitted: 'ri:time-line',
  processing: 'ri:loader-4-line',
  draft: 'ri:edit-2-line',
  rejected: 'ri:close-circle-line',
  failed: 'ri:close-circle-line',
  deleted: 'ri:delete-bin-line',
  archived: 'ri:archive-line',
  inactive: 'ri:pause-circle-line',
  featured: 'ri:star-line',
  refunded: 'ri:refund-2-line',
}

const PROPERTY_TYPE_MATCHERS = [
  { test: /(house|home|independent)/i, icon: 'ri:home-4-line' },
  { test: /(apartment|flat)/i, icon: 'ri:building-4-line' },
  { test: /villa/i, icon: 'ri:home-heart-line' },
  { test: /(office|workspace)/i, icon: 'ri:building-line' },
  { test: /(retail|shop|store)/i, icon: 'ri:store-2-line' },
  { test: /warehouse/i, icon: 'ri:warehouse-line' },
  { test: /industrial|factory/i, icon: 'ri:factory-line' },
  { test: /(agricultural|farm land|farmland)/i, icon: 'ri:plant-line' },
  { test: /commercial land|plot|land/i, icon: 'ri:map-pin-2-line' },
  { test: /(business for sale|business)/i, icon: 'ri:briefcase-4-line' },
  { test: /hotel|resort/i, icon: 'ri:hotel-line' },
  { test: /restaurant|cafe/i, icon: 'ri:restaurant-2-line' },
  { test: /hospital|clinic/i, icon: 'ri:hospital-line' },
  { test: /school|college|institute/i, icon: 'ri:school-line' },
  { test: /(pg|hostel)/i, icon: 'ri:hotel-bed-line' },
  { test: /farm house/i, icon: 'ri:home-gear-line' },
]

export function statusIcon(status) {
  const normalized = String(status || '').toLowerCase().trim()
  return STATUS_ICON_MAP[normalized] || 'ri:information-line'
}

export function propertyTypeIcon(value) {
  const label = String(value || '').trim()
  if (!label) return 'ri:building-2-line'

  const match = PROPERTY_TYPE_MATCHERS.find((item) => item.test.test(label))
  return match?.icon || 'ri:building-2-line'
}
