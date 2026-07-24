const basics = (fields) => ({ key: 'basic', label: 'Basics', icon: 'lucide:list-checks', fields })
const amenities = (fields) => ({ key: 'amenities', label: 'Amenities', icon: 'lucide:square-check-big', fields })
const geography = (fields) => ({ key: 'geography', label: 'Geography', icon: 'lucide:map-pin', fields })
const highlights = (fields) => ({ key: 'highlights', label: 'Highlights', icon: 'lucide:sparkles', fields })

const f = (label, source, keys, icon, options = {}) => ({
  label,
  source,
  keys: Array.isArray(keys) ? keys : [keys],
  icon,
  ...options,
})

const commonAmenities = [
  f('MCD Water', 'amenities', 'mcd_water', 'MCD_Water.svg'),
  f('Submersible', 'amenities', 'submersible', 'Submersible.svg'),
  f('Lift', 'amenities', 'lift', 'Lift.svg'),
  f('Power Backup', 'amenities', 'power_backup', 'Power_Backup.svg'),
]

const commonGeoCommercial = [
  f('Metro', 'geography', 'metro', 'Metro.svg'),
  f('Bus Stand', 'geography', 'bus_stand', 'Bus_Stand.svg'),
  f('Airport', 'geography', 'airport', 'Airport.svg'),
  f('Highway', 'geography', 'highway', 'Highway.svg'),
  f('Railway Station', 'geography', 'railway_station', 'Railway_Station.svg'),
]

const commonHighlights = [
  f('Ready to Move', 'highlights', 'ready_to_move', 'Ready_to_Move.svg'),
  f('Constructed Year', 'highlights', 'constructed_year', 'Constructed.svg'),
]

const standardHighlights = [
  ...commonHighlights,
  f('Vastu Build', 'highlights', 'vastu_build', 'Vastu_Build.svg'),
  f('Corner', 'highlights', 'corner', 'Corner.svg'),
  f('Built By', 'highlights', 'built_by', 'Built_by.svg'),
  f('Negotiable', 'highlights', 'negotiable', 'Negotiable.svg'),
]

export const propertyCategoryDetails = {
  house: [
    basics([
      f('Bed', 'basic', 'bed', 'Bed.svg'),
      f('Bath', 'basic', 'bath', 'Bath.svg'),
      f('Floor', 'basic', 'floor', 'floor.svg'),
      f('Apartment', 'basic', 'apartment_type', 'House_Basics_Apartment.svg'),
      f('Area', 'basic', 'area_sqft', 'Square_feet.svg', { unit: 'sq ft' }),
      f('Free Hold', 'basic', 'free_hold', 'Free_hold.svg'),
      f('Price', 'basic', ['type_price', 'price'], 'Price.svg', { currency: true }),
      f('USP', 'multi', 'usp_values', 'USP.svg'),
      f('Furnishing', 'basic', 'furnished', 'House_Basics_Furnishing.svg'),
      f('Design', 'basic', 'design', 'Design.svg'),
      f('Road Width', 'basic', ['road_width', 'geography.road_width'], 'Road_Width.svg'),
      f('Fixed Parking (P)', 'basic', 'fixed_parking', 'Fixed_Parking.svg'),
    ]),
    amenities([
      ...commonAmenities,
      f('Club', 'amenities', 'club', 'House_Amenities_club.svg'),
      f('Stilt Parking', 'amenities', 'stilt_parking', 'Stilt_Parking.svg'),
      f('Road Parking', 'amenities', 'road_parking', 'Road_Parking.svg'),
      f('Visitors Parking', 'amenities', 'visitor_parking', 'Vistors_Parking.svg'),
      f('Gas Pipe Line', 'amenities', 'gas_pipe_line', 'Gas_Pipe_Line.svg'),
      f('Building Guard', 'amenities', 'building_guard', 'Building_Guard.svg'),
      f('Fire Safety', 'amenities', 'fire_safety', 'Fire_Safety.svg'),
      f('Solar Panel', 'amenities', 'solar_panel', 'Solar_Panel.svg'),
    ]),
    geography([
      f('Metro', 'geography', 'metro', 'Metro.svg'),
      f('Near Salon', 'geography', 'salon', 'Salon.svg'),
      f('Near Airport', 'geography', 'airport', 'Airport.svg'),
      f('Near Highway', 'geography', 'highway', 'Highway.svg'),
      f('Near Schools', 'geography', 'schools', 'School.svg'),
      f('Near Hospitals', 'geography', 'hospital', 'House_Geography_Near_Hospitals.svg'),
      f('Near Grocery', 'geography', 'grocery', 'Grocery.svg'),
      f('Near Mall', 'geography', 'moll', 'Mall.svg'),
      f('Near Park', 'geography', 'park', 'Park.svg'),
      f('Near Market', 'geography', 'market', 'Market.svg'),
      f('Near Temple', 'geography', 'temple', 'Temple.svg'),
      f('Sun Light', 'geography', 'direct_sunlight', 'Direct_Sunlight.svg'),
    ]),
    highlights([
      ...standardHighlights,
      f('Crime', 'highlights', 'crime_rate', 'Crime.svg'),
      f('Roof', 'highlights', 'roof', 'Roof.svg'),
      f('Basement', 'highlights', 'basement', 'Basement.svg'),
      f('Pet Friendly', 'highlights', 'pet_friendly', 'Pet_Friendly.svg'),
      f('Any Loan', 'highlights', 'any_loan', 'Any_Loan.svg'),
      f('Maintenance', 'highlights', 'maintenance', 'Maintenance.svg'),
    ]),
  ],
  office: [
    basics([
      f('Carpet', 'basic', 'carpet_area_sqft', 'Carpet_sq_ft.svg', { unit: 'sq ft' }),
      f('Super', 'basic', 'super_area_sqft', 'Super_sq_ft.svg', { unit: 'sq ft' }),
      f('Office Separate', 'basic', 'office_type', 'Office_Separate.svg'),
      f('Fixed Parking', 'basic', 'fixed_parking', 'Fixed_Parking.svg'),
      f('Office Floor', 'basic', 'floor', 'Office_Floor.svg'),
      f('Free Hold', 'basic', 'free_hold', 'Free_hold.svg'),
      f('Price', 'basic', ['type_price', 'price'], 'Price.svg', { currency: true }),
      f('USP', 'multi', 'usp_values', 'USP.svg'),
      f('Furnished', 'basic', 'furnished', 'Furnished.svg'),
      f('Design', 'basic', 'design', 'Design.svg'),
      f('Security Amount', 'basic', 'security_amount', 'Security_Amt.svg', { currency: true }),
      f('Agreement Type', 'basic', 'agreement_type', 'Agreement_Type.svg'),
    ]),
    amenities([
      ...commonAmenities,
      f('Pantry', 'amenities', 'pantry', 'Pantry.svg'),
      f('Stilt Parking', 'amenities', 'stilt_parking', 'Stilt_Parking.svg'),
      f('Road Parking', 'amenities', 'road_parking', 'Road_Parking.svg'),
      f('Centralized AC', 'amenities', 'centralised_ac', 'Centralized_AC.svg'),
      f('Number of Cabins', 'amenities', 'cabins', 'Cabin.svg'),
      f('No. of Work Stations', 'amenities', 'work_stations', 'Office_Amenities_WorkStations.svg'),
      f('Fire Safety', 'amenities', 'fire_safety', 'Fire_Safety.svg'),
      f('Washrooms', 'amenities', 'washrooms', 'Washrooms.svg'),
    ]),
    geography([
      ...commonGeoCommercial,
      f('Gym', 'geography', 'gym', 'Gym.svg'),
      f('24 Hr Stores', 'geography', 'hr_stores_24', '24_Hr_Store.svg'),
      f('Mall', 'geography', 'moll', 'Mall.svg'),
      f('Park', 'geography', 'park', 'Park.svg'),
      f('Market', 'geography', 'market', 'Market.svg'),
      f('Road Width', 'geography', 'road_width', 'Road_Width.svg'),
      f('Restaurants', 'geography', 'restaurants', 'Office_Geography_Restaurants.svg'),
    ]),
    highlights([
      ...standardHighlights,
      f('Loading', 'highlights', 'loading', 'Loading.svg'),
      f('Possession', 'highlights', 'possession', 'Office_Highlights_Possession.svg'),
      f('Basement', 'highlights', 'basement', 'Basement.svg'),
      f('Work Stations', 'highlights', 'max_work_stations', 'Max_Work_Station.svg'),
      f('Any Loan', 'highlights', 'any_loan', 'Any_Loan.svg'),
      f('Maintenance', 'highlights', 'maintenance', 'Maintenance.svg'),
    ]),
  ],
  retail: [
    basics([
      f('Carpet Area', 'basic', 'carpet_area_sqft', 'Carpet_sq_ft.svg', { unit: 'sq ft' }),
      f('Super Area', 'basic', 'super_area_sqft', 'Super_sq_ft.svg', { unit: 'sq ft' }),
      f('Loading', 'basic', 'loading', 'Loading.svg'),
      f('Space In', 'basic', 'space_in', 'Space_in.svg'),
      f('Floor Level', 'basic', 'floor', 'Floor_Level.svg'),
      f('Free Hold', 'basic', 'free_hold', 'Free_hold.svg'),
      f('Price', 'basic', ['type_price', 'price'], 'Price.svg', { currency: true }),
      f('USP', 'multi', 'usp_values', 'USP.svg'),
      f('Furnished', 'basic', 'furnished', 'Furnished.svg'),
      f('Retail Type', 'multi', 'retail_types', 'Retail_Type.svg'),
      f('Security Amount', 'basic', 'security_amount', 'Security_Amt.svg', { currency: true }),
      f('Agreement Type', 'basic', 'agreement_type', 'Agreement_Type.svg'),
    ]),
    amenities([
      ...commonAmenities.slice(0, 1),
      f('Previous Occupant', 'amenities', 'previous_occupant', 'Retail_Amenities_PreviousOccupant.svg'),
      ...commonAmenities.slice(2),
      f('Power Load', 'amenities', 'power_load', 'Power_Load.svg'),
      f('Stilt Parking', 'amenities', 'stilt_parking', 'Stilt_Parking.svg'),
      f('Road Parking', 'amenities', 'road_parking', 'Road_Parking.svg'),
      f('Visitor Parking', 'amenities', 'visitor_parking', 'Vistors_Parking.svg'),
      f('Pantry', 'amenities', 'pantry', 'Pantry.svg'),
      f('Washrooms', 'amenities', 'washrooms', 'Washrooms.svg'),
      f('Fire Safety', 'amenities', 'fire_safety', 'Fire_Safety.svg'),
      f('Footfall', 'amenities', 'footfall', 'Footfall.svg'),
    ]),
    geography([
      ...commonGeoCommercial,
      f('Gym', 'geography', 'gym', 'Gym.svg'),
      f('Pharmacy', 'geography', 'pharmacy', 'Pharmacy.svg'),
      f('Market Type', 'multi', 'market_types', 'Market_Type.svg'),
      f('Park', 'geography', 'park', 'Park.svg'),
      f('Near Brands', 'multi', 'near_brands', 'Near_Brands.svg'),
      f('Road Width', 'geography', 'road_width', 'Road_Width.svg'),
      f('Restaurants', 'geography', 'restaurants', 'Restaurant.svg'),
    ]),
    highlights([
      ...standardHighlights,
      f('Frontage', 'highlights', 'frontage', 'Frontage.svg'),
      f('Signage', 'highlights', 'signage', 'Signage.svg'),
      f('Possession', 'highlights', 'possession', 'Office_Highlights_Possession.svg'),
      f('Clear Height', 'highlights', 'clear_height', 'Clear_Height.svg'),
      f('Any Loan', 'highlights', 'any_loan', 'Any_Loan.svg'),
      f('Maintenance', 'highlights', 'maintenance', 'Maintenance.svg'),
    ]),
  ],
}

propertyCategoryDetails.industrial = [
  basics([
    f('Sq ft', 'basic', ['super_area_sqft', 'carpet_area_sqft'], 'Square_feet.svg', { unit: 'sq ft' }),
    f('Sq yd', 'basic', 'area_sqad', 'Square_yard.svg', { unit: 'sq yd' }),
    f('Built-up Area', 'basic', 'built_up_area_sqft', 'Square_feet.svg', { unit: 'sq ft' }),
    f('Total Building Floors', 'basic', 'building_floors', 'floor.svg'),
    f('Floor Level', 'basic', 'floor', 'Floor_Level.svg'),
    f('Free Hold', 'basic', 'free_hold', 'Free_hold.svg'),
    f('Price', 'basic', ['type_price', 'price'], 'Price.svg', { currency: true }),
    f('USP', 'multi', 'usp_values', 'USP.svg'),
    f('Furnished', 'basic', 'furnished', 'Furnished.svg'),
    f('Construction', 'basic', 'construction', 'Construction.svg'),
    f('Security Amount', 'basic', 'security_amount', 'Security_Amt.svg', { currency: true }),
    f('Agreement Type', 'basic', 'agreement_type', 'Agreement_Type.svg'),
  ]),
  amenities([
    ...commonAmenities,
    f('Power kVA', 'amenities', 'power_load', 'Power_Load.svg'),
    f('Stilt Parking', 'amenities', 'stilt_parking', 'Stilt_Parking.svg'),
    f('Road Parking', 'amenities', 'road_parking', 'Road_Parking.svg'),
    f('Crane Accessibility', 'amenities', 'crane_accessibility', 'Crane_Accessibility.svg'),
    f('Drainage System', 'amenities', 'drainage_system', 'Drainage_System.svg'),
    f('Washrooms', 'amenities', 'washrooms', 'Washrooms.svg'),
    f('Fire Safety', 'amenities', 'fire_safety', 'Fire_Safety.svg'),
    f('Open Yard Area', 'amenities', 'open_yard_area', 'Open_Yard_Area.svg'),
  ]),
  geography([
    ...commonGeoCommercial,
    f('Locality', 'geography', ['locality', 'type_locality'], 'map.png'),
    f('Pharmacy', 'geography', 'pharmacy', 'Pharmacy.svg'),
    f('Market Type', 'multi', 'market_types', 'Market_Type.svg'),
    f('Park', 'geography', 'park', 'Park.svg'),
    f('Nearest Port', 'geography', 'nearest_port', 'Nearest_Port.svg'),
    f('Road Width', 'geography', 'road_width', 'Road_Width.svg'),
    f('Restaurants', 'geography', 'restaurants', 'Restaurant.svg'),
  ]),
  highlights([
    ...commonHighlights,
    f('License', 'highlights', 'license', 'Trade_License.svg'),
    f('Pollution Approval', 'highlights', 'pollution_approval', 'Pollution_Approval.svg'),
    f('Built By', 'highlights', 'built_by', 'Built_by.svg'),
    f('Negotiable', 'highlights', 'negotiable', 'Negotiable.svg'),
    f('Frontage', 'highlights', 'frontage', 'Frontage.svg'),
    f('Clear Height', 'highlights', 'clear_height', 'Clear_Height.svg'),
    f('Possession', 'highlights', 'possession', 'Office_Highlights_Possession.svg'),
    f('Ventilation System', 'highlights', 'ventilation_system', 'Ventilation_System.svg'),
    f('Any Loan', 'highlights', 'any_loan', 'Any_Loan.svg'),
    f('Maintenance', 'highlights', 'maintenance', 'Maintenance.svg'),
  ]),
]

propertyCategoryDetails.business = [
  basics([
    f('Sq ft', 'basic', 'area_sqft', 'Square_feet.svg', { unit: 'sq ft' }),
    f('Type Business', 'multi', 'business_types', 'Business_Basics_TypeBusiness.svg'),
    f('Years in Operations', 'basic', 'years_in_operations', 'Years_in_Operations.svg'),
    f('Ownership Type', 'basic', 'ownership_type', 'Ownership_Type.svg'),
    f('Reason', 'basic', 'reason_for_sale', 'Reason_For_Sale.svg'),
    f('Inventory Included', 'basic', 'inventory_included', 'Inventory_Included.svg'),
    f('Price', 'basic', ['type_price', 'price'], 'Price.svg', { currency: true }),
    f('USP', 'multi', 'usp_values', 'USP.svg'),
    f('Monthly Rent', 'basic', 'monthly_rent', 'Business_Basics_MonthlyRent.svg', { currency: true }),
    f('Average Monthly Turnover', 'basic', 'monthly_turnover', 'Business_Averag_ Monthly_Turnover.svg', { currency: true }),
    f('Monthly Expenses', 'basic', 'monthly_expenses', 'Price.svg', { currency: true }),
    f('Monthly Profit', 'basic', 'monthly_profit', 'Price.svg', { currency: true }),
  ]),
  amenities([
    f('MCD Water', 'amenities', 'mcd_water', 'MCD_Water.svg'),
    f('Submersible', 'amenities', 'submersible', 'Submersible.svg'),
    f('Social Media', 'multi', 'social_media', 'Social_Media.svg'),
    f('Trade Marks', 'amenities', 'trade_marks', 'Trade_Marks.svg'),
    f('Licenses', 'amenities', 'licenses', 'Licenses.svg'),
    f('Equipment', 'multi', 'equipment_values', 'Equipment.svg'),
    f('Franchise', 'amenities', 'franchise', 'Franchises.svg'),
    f('Furnishing', 'amenities', 'furnished_business', 'Furnished.svg'),
    f('Power Load', 'amenities', 'power_load', 'Power_Load.svg'),
    f('Type No. of Clients', 'amenities', 'no_of_clients', 'Cabin.svg'),
    f('Security Camera', 'amenities', 'security_camera', 'Security_Camera.svg'),
    f('Property Included', 'amenities', 'property_included', 'Property_Included.svg'),
  ]),
  geography([
    f('Metro', 'geography', 'metro', 'Metro.svg'),
    f('Bus Stand', 'geography', 'bus_stand', 'Bus_Stand.svg'),
    f('Airport', 'geography', 'airport', 'Airport.svg'),
    f('Near Highway', 'geography', 'highway', 'Highway.svg'),
    f('Railway Station', 'geography', 'railway_station', 'Railway_Station.svg'),
    f('Locality', 'geography', ['locality', 'type_locality'], 'map.png'),
    f('Hours of Operations', 'geography', 'hours_of_operations', 'Hours_of_Operation.svg'),
    f('Hospital', 'geography', 'hospital', 'Hospitals.svg'),
    f('Connectivity', 'geography', 'connectivity', 'Connectivity.svg'),
    f('Market Famous For', 'multi', 'market_famous_for', 'Market_Famous_For.svg'),
    f('Road Width', 'geography', 'road_width', 'Road_Width.svg'),
    f('Footfall', 'geography', 'footfall', 'Footfall.svg'),
  ]),
  highlights([
    ...commonHighlights,
    f('Construction Type', 'multi', 'construction_types', 'Construction_Type.svg'),
    f('Zone', 'multi', 'zone_values', 'Zone.svg'),
    f('Built By', 'highlights', 'built_by', 'Built_by.svg'),
    f('Negotiable', 'highlights', 'negotiable', 'Negotiable.svg'),
    f('Owner', 'highlights', 'absentee_owner', 'Absentee_Owner.svg'),
    f('ROI (%)', 'highlights', 'roi_percent', 'ROI_percent.svg'),
    f('Owner Transition', 'highlights', 'owner_transition', 'Owner_Transition.svg'),
    f('Type Brand Name', 'multi', 'brand_names', 'Market_Famous_For.svg'),
    f('Any Loan', 'highlights', 'any_loan', 'Any_Loan.svg'),
    f('Maintenance', 'highlights', 'maintenance', 'Maintenance.svg'),
  ]),
]

propertyCategoryDetails.agriculture = [
  basics([
    f('Sq ft', 'basic', 'area_sqft', 'Square_feet.svg', { unit: 'sq ft' }),
    f('Sq yd', 'basic', 'area_sqad', 'Square_yard.svg', { unit: 'sq yd' }),
    f('Tehsil', 'basic', 'tehsil', 'map.png'),
    f('Facing', 'basic', 'facing', 'Vastu_Build.svg'),
    f('Land', 'multi', 'land_types', 'Land.svg'),
    f('Free Hold', 'basic', 'free_hold', 'Free_hold.svg'),
    f('Price', 'basic', ['type_price', 'price'], 'Price.svg', { currency: true }),
    f('USP', 'multi', 'usp_values', 'USP.svg'),
    f('Labor Rooms', 'basic', 'labour_rooms', 'Labor_Rooms.svg'),
    f('Water Storage', 'multi', 'water_storage', 'Water_Storage.svg'),
    f('Security Amount', 'basic', 'security_amount', 'Security_Amt.svg', { currency: true }),
    f('Agreement Type', 'basic', 'agreement_type', 'Agreement_Type.svg'),
  ]),
  amenities([
    f('MCD Water', 'amenities', 'mcd_water', 'MCD_Water.svg'),
    f('Submersible', 'amenities', 'submersible', 'Submersible.svg'),
    f('Tube Well', 'amenities', 'tube_well', 'Tube_Well.svg'),
    f('Cold Storage', 'amenities', 'cold_storage', 'Cold_Storage.svg'),
    f('Power Load KW', 'amenities', 'power_load', 'Power_Load.svg'),
    f('Solar Power', 'amenities', 'solar_power', 'Solar_Power.svg'),
    f('Irrigation System', 'amenities', 'irrigation_system', 'Irrigation_System.svg'),
    f('Road Type', 'amenities', 'road_type', 'Road_Type.svg'),
    f('Drainage System', 'amenities', 'drainage_system', 'Drainage_System.svg'),
    f('Soil Type', 'multi', 'soil_types', 'Soil_Type.svg'),
    f('Rain Fall', 'amenities', 'rain_fall', 'Rain_Fall.svg'),
    f('Organic Farming', 'amenities', 'organic_farming', 'Organic_Farming.svg'),
  ]),
  geography([
    ...commonGeoCommercial,
    f('Type Locality', 'geography', 'type_locality', 'map.png'),
    f('Pharmacy', 'geography', 'pharmacy', 'Pharmacy.svg'),
    f('Hospital', 'geography', 'hospital', 'Hospitals.svg'),
    f('Connectivity', 'geography', 'connectivity', 'Connectivity.svg'),
    f('Nearest Port', 'geography', 'nearest_port', 'Nearest_Port.svg'),
    f('Road Width', 'geography', 'road_width', 'Road_Width.svg'),
    f('Type Nearest Mandi', 'geography', 'nearest_mandi', 'Nearest_Mandi.svg'),
  ]),
  highlights([
    ...commonHighlights,
    f('Construction Type', 'multi', 'construction_types', 'Construction_Type.svg'),
    f('Zone', 'multi', 'zone_values', 'Zone.svg'),
    f('Built By', 'highlights', 'built_by', 'Built_by.svg'),
    f('Negotiable', 'highlights', 'negotiable', 'Negotiable.svg'),
    f('Frontage', 'highlights', 'frontage', 'Frontage.svg'),
    f('Topography', 'highlights', 'topography', 'Topography.svg'),
    f('Current Crop', 'multi', 'crop_values', 'Topography.svg'),
    f('Ventilation System', 'highlights', 'ventilation_system', 'Ventilation_System.svg'),
    f('Any Loan', 'highlights', 'any_loan', 'Any_Loan.svg'),
    f('Maintenance', 'highlights', 'maintenance', 'Maintenance.svg'),
  ]),
]

export function propertyCategoryKey(category) {
  const normalized = String(category || '').toLowerCase()
  if (/(house|flat|apartment|residential)/.test(normalized)) return 'house'
  if (normalized.includes('office')) return 'office'
  if (/(retail|shop)/.test(normalized)) return 'retail'
  if (/(industrial|warehouse)/.test(normalized)) return 'industrial'
  if (normalized.includes('business')) return 'business'
  if (/(agriculture|agricultural|farm)/.test(normalized)) return 'agriculture'
  return ''
}

export function fixedPropertySections(category) {
  return propertyCategoryDetails[propertyCategoryKey(category)] || []
}
