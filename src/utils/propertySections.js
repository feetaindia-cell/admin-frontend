import { titleCase } from '@/utils/finance'

export const categoryBasicFieldMap = {
  house: ['bed', 'bath', 'apartment_type', 'floor', 'area_sqft', 'free_hold', 'type_price', 'furnished', 'design', 'road_width', 'fixed_parking'],
  office: ['carpet_area_sqft', 'super_area_sqft', 'office_type', 'fixed_parking', 'floor', 'free_hold', 'type_price', 'furnished', 'design', 'security_amount', 'agreement_type'],
  retail: ['carpet_area_sqft', 'super_area_sqft', 'loading', 'space_in', 'floor', 'free_hold', 'type_price', 'furnished', 'security_amount', 'agreement_type'],
  industrial: ['carpet_area_sqft', 'super_area_sqft', 'built_up_area_sqft', 'building_floors', 'loading', 'space_in', 'floor', 'free_hold', 'type_price', 'furnished', 'security_amount', 'agreement_type', 'power_load', 'ceiling_height_ft', 'construction'],
  agriculture: ['area_sqft', 'area_sqad', 'tehsil', 'fencing', 'free_hold', 'labour_rooms', 'type_price', 'security_amount', 'agreement_type'],
  business: ['area_sqft', 'years_in_operations', 'ownership_type', 'reason_for_sale', 'inventory_included', 'type_price', 'monthly_rent', 'monthly_turnover', 'monthly_expenses', 'monthly_profit', 'floor', 'parking'],
}

export const amenityKeys = ['mcd_water', 'submersible', 'lift', 'power_backup', 'road_parking', 'fire_safety', 'club', 'stilt_parking', 'visitor_parking', 'gas_pipe_line', 'building_guard', 'solar_panel', 'pantry', 'centralised_ac', 'cabins', 'work_stations', 'washrooms', 'power_load', 'footfall', 'tube_well', 'cold_storage', 'irrigation_system', 'road_type', 'drainage_system', 'rain_fall', 'organic_farming', 'solar_power', 'trade_marks', 'licenses', 'franchise', 'furnished_business', 'no_of_clients', 'security_camera', 'property_included', 'crane_accessibility', 'open_yard_area']
export const geographyKeys = ['metro', 'bus_stand', 'airport', 'highway', 'railway_station', 'hospital', 'road_width', 'connectivity', 'salon', 'schools', 'grocery', 'moll', 'park', 'market', 'temple', 'direct_sunlight', 'gym', 'restaurants', 'hr_stores_24', 'type_locality', 'nearest_port', 'nearest_mandi', 'pharmacy', 'hours_of_operations', 'footfall', 'locality', 'crime_rate', 'cinema']
export const highlightKeys = ['ready_to_move', 'constructed_year', 'negotiable', 'built_by', 'any_loan', 'maintenance', 'corner', 'vastu_build', 'crime_rate', 'sunlight', 'roof', 'basement', 'pet_friendly', 'loading', 'possession', 'max_work_stations', 'frontage', 'signage', 'clear_height', 'topography', 'ventilation_system', 'absentee_owner', 'roi_percent', 'owner_transition', 'license', 'pollution_approval', 'clear_title', 'connectivity']
export const multiValueConfig = [
  ['usp_values', 'USP Values'],
  ['brand_names', 'Brand Names'],
  ['business_types', 'Business Types'],
  ['construction_types', 'Construction Types'],
  ['crop_values', 'Crop Values'],
  ['equipment_values', 'Equipment Values'],
  ['land_types', 'Land Types'],
  ['market_famous_for', 'Market Famous For'],
  ['market_types', 'Market Types'],
  ['near_brands', 'Near Brands'],
  ['retail_types', 'Retail Types'],
  ['social_media', 'Social Media'],
  ['soil_types', 'Soil Types'],
  ['water_storage', 'Water Storage'],
  ['zone_values', 'Zone Values'],
].map(([key, label]) => ({ key, label }))

export const numericBasicFields = new Set(['area_sqft', 'area_sqad', 'carpet_area_sqft', 'super_area_sqft', 'built_up_area_sqft', 'type_price', 'security_amount', 'monthly_rent', 'monthly_turnover', 'monthly_expenses', 'monthly_profit', 'ceiling_height_ft'])

const fieldKeysBySection = {
  main: ['category', 'sub_category', 'listing_type', 'status', 'approval_status', 'featured', 'last_edited_at', 'city', 'state', 'locality', 'map_address', 'manual_address', 'full_address', 'latitude', 'longitude', 'description'],
  amenities: amenityKeys,
  geography: geographyKeys,
  highlights: highlightKeys,
  open_house: ['scheduled_date', 'from_time', 'to_time', 'notes'],
  multi_values: multiValueConfig.map((item) => item.key),
}

const sectionMeta = {
  main: { key: 'main', label: 'Main Details', icon: 'lucide:building-2' },
  basic: { key: 'basic', label: 'Basic Details', icon: 'lucide:list-checks' },
  amenities: { key: 'amenities', label: 'Amenities', icon: 'lucide:square-check-big' },
  geography: { key: 'geography', label: 'Geography', icon: 'lucide:map-pin' },
  highlights: { key: 'highlights', label: 'Highlights', icon: 'lucide:sparkles' },
  open_house: { key: 'open_house', label: 'Open House', icon: 'lucide:calendar-days' },
  multi_values: { key: 'multi_values', label: 'Extra Values', icon: 'lucide:tags' },
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
}

export function toFieldKey(value) {
  return normalize(value).replace(/\s+/g, '_')
}

export function categoryKey(category) {
  const normalized = normalize(category)
  return Object.keys(categoryBasicFieldMap).find((key) => normalized.includes(key)) || toFieldKey(category)
}

function sectionKeyFor(name) {
  const normalized = normalize(name)
  if (normalized.includes('main') || normalized.includes('core')) return 'main'
  if (normalized.includes('basic') || normalized.includes('specification') || normalized.includes('area')) return 'basic'
  if (normalized.includes('amenit') || normalized.includes('facility')) return 'amenities'
  if (normalized.includes('geo') || normalized.includes('near') || normalized.includes('connect') || normalized.includes('location')) return 'geography'
  if (normalized.includes('highlight') || normalized.includes('selling')) return 'highlights'
  if (normalized.includes('open') || normalized.includes('schedule')) return 'open_house'
  if (normalized.includes('extra') || normalized.includes('multi') || normalized.includes('value')) return 'multi_values'
  return ''
}

function isActive(item) {
  return !['inactive', 'deleted'].includes(String(item?.status || item?.catStatus || item?.mpccStatus || item?.componentStatus || item?.compChildStatus || 'active').toLowerCase())
}

function configuredFields(child, sectionKey, fallbackFields) {
  const supported = new Set(fallbackFields || [])
  const fields = []
  ;(child?.components || []).filter(isActive).forEach((component) => {
    const componentKey = toFieldKey(component.name || component.componentName)
    if (supported.has(componentKey)) fields.push(componentKey)
    ;(component.options || []).filter(isActive).forEach((option) => {
      const optionKey = toFieldKey(option.name || option.compChildName)
      if (supported.has(optionKey)) fields.push(optionKey)
    })
  })
  return [...new Set(fields)]
}

export function configuredPropertySections(category, tree = []) {
  const fallback = fallbackPropertySections(category)
  const normalizedCategory = normalize(category)
  const categoryNode = (tree || []).find((item) => {
    const name = normalize(item.name || item.catName)
    return name && (name === normalizedCategory || normalizedCategory.includes(name) || name.includes(normalizedCategory))
  })

  if (!categoryNode) return fallback

  const sections = (categoryNode.children || [])
    .filter(isActive)
    .map((child) => {
      const key = sectionKeyFor(child.name || child.childName)
      if (!key || !sectionMeta[key]) return null
      const fallbackFields = fallback.find((section) => section.key === key)?.fields || fieldKeysBySection[key] || []
      const fields = configuredFields(child, key, fallbackFields)
      return fields.length ? { ...sectionMeta[key], label: child.name || child.childName || sectionMeta[key].label, fields } : null
    })
    .filter(Boolean)

  return sections.length ? sections : fallback
}

export function fallbackPropertySections(category) {
  const basic = categoryBasicFieldMap[categoryKey(category)] || []
  return [
    { ...sectionMeta.main, fields: ['category', 'sub_category', 'listing_type', 'status', 'approval_status', 'featured', 'last_edited_at', 'city', 'state', 'locality', 'map_address', 'manual_address', 'full_address', 'latitude', 'longitude', 'description'] },
    basic.length ? { ...sectionMeta.basic, fields: basic } : null,
    { ...sectionMeta.amenities, fields: amenityKeys },
    { ...sectionMeta.geography, fields: geographyKeys },
    { ...sectionMeta.highlights, fields: highlightKeys },
    { ...sectionMeta.open_house, fields: ['scheduled_date', 'from_time', 'to_time', 'notes'] },
    { ...sectionMeta.multi_values, fields: multiValueConfig.map((item) => item.key) },
  ].filter(Boolean)
}

export function fieldLabel(key) {
  return multiValueConfig.find((item) => item.key === key)?.label || titleCase(key)
}
