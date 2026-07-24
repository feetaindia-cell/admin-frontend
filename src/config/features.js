const enabled = (value) => String(value ?? '').trim().toLowerCase() === 'true'

export const features = Object.freeze({
  propertyFeatured: enabled(import.meta.env?.VITE_PROPERTY_FEATURED_ENABLED),
})

export default features
