<template>
  <div class="dashboard-main-body property-view-page">
    <LoadingState v-if="loading" message="Loading property details..." />
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <template v-else>
      <section class="property-hero mb-24">
        <div class="hero-icon"><iconify-icon icon="lucide:building-2" /></div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-8 flex-wrap">
            <span class="hero-kicker">Property #{{ property.id }}</span>
            <h4 class="mb-0">{{ safeValue(property.title) }}</h4>
            <PropertyStatusBadge :status="property.status" />
            <span class="text-secondary-light text-xs">Approval:</span>
            <PropertyStatusBadge :status="property.approval_status" />
            <span v-if="featureEnabled && property.featured" class="featured-badge"><iconify-icon icon="lucide:star" /> Featured</span>
          </div>
          <div class="hero-meta mt-12">
            <span><iconify-icon icon="lucide:badge-indian-rupee" />{{ formatCurrency(property.price) }}</span>
            <span><iconify-icon icon="lucide:calendar-plus" />Created {{ formatDate(property.created_at) }}</span>
            <span><iconify-icon icon="lucide:calendar-clock" />Updated {{ formatDate(property.updated_at) }}</span>
            <span v-if="isDeleted"><iconify-icon icon="lucide:trash-2" />Deleted {{ formatDate(property.deleted_at) }}</span>
          </div>
        </div>
        <div class="hero-actions">
          <router-link :to="isDeleted ? '/properties/deleted' : '/properties'" class="property-action property-action--soft"><iconify-icon icon="lucide:arrow-left" />Back</router-link>
          <router-link v-if="auth.hasPermission('property.update')&&!isDeleted" :to="`/properties/${property.id}/edit`" class="property-action property-action--primary"><iconify-icon icon="lucide:pencil" />Edit</router-link>
          <button v-if="auth.hasPermission('property.approve')&&property.approval_status!=='approved'&&!isDeleted" class="property-action property-action--success" :disabled="busy" @click="approve"><iconify-icon icon="lucide:check" />Approve</button>
          <button v-if="auth.hasPermission('property.reject')&&property.approval_status!=='rejected'&&!isDeleted" class="property-action property-action--danger-soft" :disabled="busy" @click="reject"><iconify-icon icon="lucide:x" />Reject</button>
          <button v-if="auth.hasPermission('property.status')&&!['inactive','deleted'].includes(property.status)&&!isDeleted" class="property-action property-action--soft" :disabled="busy" @click="archive"><iconify-icon icon="lucide:archive" />Archive</button>
          <button v-if="featureEnabled && auth.hasPermission('property.feature')&&!isDeleted" class="property-action property-action--soft" :disabled="busy" @click="feature"><iconify-icon icon="lucide:star" />{{ property.featured?'Unfeature':'Feature' }}</button>
          <button v-if="auth.hasPermission('property.delete')&&!isDeleted" class="property-action property-action--danger" :disabled="busy" @click="remove"><iconify-icon icon="lucide:trash-2" />Delete</button>
        </div>
      </section>

      <PropertyGallery v-if="auth.hasPermission('property.media.view')" :media="property.media||[]" :title="property.title" class="mb-24" />

      <div class="row gy-4">
        <div class="col-xl-8">
          <section v-for="section in detailSections" :key="section.key" class="detail-card mb-24">
            <div class="section-heading"><span><iconify-icon :icon="section.icon" /></span><h6 class="mb-0">{{ section.label }}</h6></div>
            <div v-if="section.display === 'category-grid'" class="category-grid">
              <div v-for="item in section.items" :key="item.key" class="category-detail">
                <span class="category-detail__icon">
                  <img v-if="item.iconUrl" :src="item.iconUrl" :alt="item.label" />
                  <iconify-icon v-else icon="lucide:circle-dot" />
                </span>
                <span class="category-detail__label">{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
            <div v-else-if="section.display === 'chips'" class="amenities">
              <span v-for="item in section.items" :key="item.key">{{ item.label }}<strong v-if="item.value!==1&&item.value!==true">: {{ item.value }}</strong></span>
            </div>
            <p v-else-if="section.display === 'description'" class="description mb-0">{{ section.items[0]?.value }}</p>
            <div v-else class="info-grid">
              <Info v-for="item in section.items" :key="item.key" :label="item.label" :value="item.value" :wide="item.wide" />
            </div>
          </section>
          <PropertyAnalyticsCard v-if="auth.hasPermission('property.analytics.view')" :analytics="property.analytics||{}" class="mb-24" />
          <PropertyTimeline :timeline="property.timeline||[]" />
        </div>
        <div class="col-xl-4">
          <section class="detail-card pricing-card mb-24"><div class="section-heading"><span><iconify-icon icon="lucide:wallet-cards" /></span><h6 class="mb-0">Pricing and area</h6></div><div class="price">{{ formatCurrency(property.pricing?.price||property.price) }}</div><div class="side-list"><div><span>Monthly rent</span><strong>{{ formatCurrency(property.pricing?.monthly_rent) }}</strong></div><div><span>Area</span><strong>{{ formatArea(property.area?.area_sqft) }}</strong></div><div><span>Carpet area</span><strong>{{ formatArea(property.area?.carpet_area_sqft) }}</strong></div></div></section>
          <PropertyOwnerCard :owner="property.owner||property.agent" class="mb-24" />
          <PropertyPaymentCard v-if="auth.hasPermission('property.payment.view')" :payment="property.payment" />
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import Swal from 'sweetalert2'
import { computed,defineComponent,h,onMounted,ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import PropertyAnalyticsCard from '@/components/feeta/properties/PropertyAnalyticsCard.vue'
import PropertyGallery from '@/components/feeta/properties/PropertyGallery.vue'
import PropertyOwnerCard from '@/components/feeta/properties/PropertyOwnerCard.vue'
import PropertyPaymentCard from '@/components/feeta/properties/PropertyPaymentCard.vue'
import PropertyStatusBadge from '@/components/feeta/properties/PropertyStatusBadge.vue'
import PropertyTimeline from '@/components/feeta/properties/PropertyTimeline.vue'
import propertyService from '@/services/propertyService'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency,formatDate,safeValue,titleCase } from '@/utils/finance'
import { fixedPropertySections } from '@/utils/propertyCategoryDetails'
import features from '@/config/features'
const Info=defineComponent({props:{label:String,value:[String,Number],wide:Boolean},setup:p=>()=>h('div',{class:['info-item',p.wide?'wide':'']},[h('span',p.label),h('strong',safeValue(p.value))])})
const route=useRoute(),router=useRouter(),auth=useAuthStore();const featureEnabled=features.propertyFeatured;const property=ref({}),loading=ref(true),error=ref(''),busy=ref(false)
const logoModules=import.meta.glob('../../../assets/logo/*',{eager:true,query:'?url',import:'default'})
const mainLabels={category:'Category',sub_category:'Sub Category',listing_type:'Listing Type',status:'Status',approval_status:'Approval Status',featured:'Featured',last_edited_at:'Last Edited',city:'City',state:'State',locality:'Locality',map_address:'Map Address',manual_address:'Manual Address',full_address:'Full Address',latitude:'Latitude',longitude:'Longitude',description:'Description'}
const isDeleted=computed(()=>Boolean(property.value.deleted_at)||property.value.status==='deleted')
const detailSections=computed(()=>[mainSection.value,...fixedPropertySections(property.value.category).map(categorySection)])
function formatArea(v){const n=Number(v);return Number.isFinite(n)&&n>0?`${new Intl.NumberFormat('en-IN').format(n)} sq ft`:'Not available'}
function hasDisplayValue(value){return Array.isArray(value)?value.length:value!==null&&value!==undefined&&value!==''}
function item(key,value,wide=false){return hasDisplayValue(value)?{key,label:mainLabels[key]||titleCase(key),value,wide}:null}
const mainSection=computed(()=>{
  const values={category:property.value.category,sub_category:property.value.sub_category,listing_type:property.value.listing_type,status:titleCase(property.value.status),approval_status:titleCase(property.value.approval_status),featured:featureEnabled?(property.value.featured?'Yes':'No'):undefined,last_edited_at:formatDate(property.value.last_edited_at,true),city:property.value.location?.city,state:property.value.location?.state,locality:property.value.location?.locality,map_address:property.value.location?.map_address,manual_address:property.value.location?.manual_address,full_address:property.value.location?.full_address,latitude:property.value.location?.latitude,longitude:property.value.location?.longitude,description:property.value.description}
  const fields=['category','sub_category','listing_type','status','approval_status','featured','last_edited_at','city','state','locality','map_address','manual_address','full_address','latitude','longitude','description']
  return {key:'main',label:'Main Details',icon:'lucide:building-2',items:fields.map(key=>item(key,values[key],['full_address','description'].includes(key))).filter(Boolean)}
})
function logoIcon(file){return logoModules[`../../../assets/logo/${file}`]||''}
function sourceData(source){const details=property.value.details||{};return source==='basic'?details.basic||{}:source==='amenities'?property.value.amenities||{}:source==='geography'?details.geography||{}:source==='highlights'?details.highlights||{}:source==='multi'?details.multi_values||{}:{}}
function readCategoryValue(field,key){if(key.includes('.')){const [source,nestedKey]=key.split('.',2);return sourceData(source)?.[nestedKey]}return sourceData(field.source)?.[key]}
function categoryRawValue(field){for(const key of field.keys){const value=readCategoryValue(field,key);if(hasDisplayValue(value))return value}if(field.currency&&field.label==='Price')return property.value.pricing?.price||property.value.price;return null}
function categoryValue(field){const raw=categoryRawValue(field);if(!hasDisplayValue(raw))return 'Not available';if(Array.isArray(raw))return raw.filter(hasDisplayValue).join(', ')||'Not available';if(field.currency)return formatCurrency(raw);const value=String(raw);return field.unit&&Number.isFinite(Number(raw))&&!value.toLowerCase().includes(field.unit)?`${new Intl.NumberFormat('en-IN').format(Number(raw))} ${field.unit}`:value}
function categorySection(section){return {...section,display:'category-grid',items:section.fields.map(field=>({key:`${section.key}-${field.label}`,label:field.label,value:categoryValue(field),iconUrl:logoIcon(field.icon)}))}}
async function load(){loading.value=true;error.value='';try{property.value=await propertyService.getProperty(route.params.id)||{}}catch(err){error.value=err.message}finally{loading.value=false}}
async function action(fn,payload,title){if(busy.value)return;busy.value=true;try{property.value={...property.value,...await fn(route.params.id,payload)};await Swal.fire({icon:'success',title,timer:1500,showConfirmButton:false})}catch(err){await Swal.fire('Action failed',err.message,'error')}finally{busy.value=false}}
async function approve(){const r=await Swal.fire({title:'Approve property?',icon:'question',showCancelButton:true});if(r.isConfirmed)await action(propertyService.approveProperty,{remarks:'Approved by administrator'},'Property approved')}
async function reject(){const r=await Swal.fire({title:'Reject property?',input:'textarea',inputLabel:'Reason',showCancelButton:true,inputValidator:v=>v?.trim()?undefined:'Reason is required'});if(r.isConfirmed)await action(propertyService.rejectProperty,{remarks:r.value.trim()},'Property rejected')}
async function archive(){const r=await Swal.fire({title:'Archive property?',icon:'warning',showCancelButton:true});if(r.isConfirmed)await action(propertyService.archiveProperty,{remarks:'Archived by administrator'},'Property archived')}
async function feature(){await action(propertyService.featureProperty,{featured:!property.value.featured,remarks:property.value.featured?'Unfeatured':'Featured'},property.value.featured?'Property unfeatured':'Property featured')}
async function remove(){const r=await Swal.fire({title:'Delete property?',text:'This is a soft delete.',icon:'warning',showCancelButton:true,confirmButtonColor:'#dc2626'});if(r.isConfirmed){busy.value=true;try{await propertyService.deleteProperty(route.params.id);await Swal.fire({icon:'success',title:'Property deleted',timer:1100,showConfirmButton:false});router.push('/properties')}catch(err){await Swal.fire('Delete failed',err.message,'error')}finally{busy.value=false}}}
onMounted(load)
</script>
<style scoped>
.property-view-page{--property-blue:#2563eb;--property-teal:#0f766e;--property-ink:#0f172a;--property-muted:#64748b;--property-line:#e2e8f0;--property-soft:#f8fafc}.property-hero{display:flex;align-items:center;gap:18px;padding:24px;border:1px solid rgba(148,163,184,.24);border-radius:18px;background:linear-gradient(135deg,#fff 0%,#f8fbff 55%,#eef8f5 100%);box-shadow:0 18px 48px rgba(15,23,42,.08)}.hero-icon{width:66px;height:66px;display:grid;place-items:center;flex:0 0 66px;border-radius:18px;color:#fff;background:linear-gradient(135deg,var(--property-blue),var(--property-teal));box-shadow:0 12px 28px rgba(37,99,235,.25);font-size:31px}.hero-kicker{width:100%;color:var(--property-blue);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.property-hero h4{color:var(--property-ink);font-weight:850}.hero-meta{display:flex;gap:12px;flex-wrap:wrap;color:#64748b;font-size:13px}.hero-meta span{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #e2e8f0;border-radius:999px;background:rgba(255,255,255,.78)}.hero-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;max-width:560px}.property-action{min-height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 13px;border:1px solid transparent;border-radius:10px;font-weight:800;transition:.18s ease}.property-action--soft{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}.property-action--primary{color:#fff;background:#2563eb;box-shadow:0 10px 22px rgba(37,99,235,.22)}.property-action--success{color:#fff;background:#16a34a}.property-action--danger-soft{color:#b91c1c;border-color:#fecaca;background:#fff5f5}.property-action--danger{color:#fff;background:#dc2626}.property-action:hover:not(:disabled){transform:translateY(-1px)}.property-action:disabled{opacity:.64}.featured-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;color:#854d0e;background:#fef3c7;font-size:12px;font-weight:800}.detail-card{padding:22px;border:1px solid rgba(148,163,184,.25);border-radius:18px;background:#fff;box-shadow:0 14px 38px rgba(15,23,42,.06)}.section-heading{display:flex;align-items:center;gap:11px;padding-bottom:15px;margin-bottom:15px;border-bottom:1px solid #edf1f6}.section-heading span{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;color:#2563eb;background:#eff6ff;font-size:20px}.section-heading h6{color:#0f172a;font-weight:850}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 26px}:deep(.info-item){display:flex;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #edf1f6}:deep(.info-item span),.side-list span{color:#64748b}:deep(.info-item strong),.side-list strong{text-align:right;word-break:break-word;color:#0f172a}:deep(.info-item.wide){grid-column:1/-1}.category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.category-detail{min-height:104px;display:grid;grid-template-columns:38px 1fr;grid-template-rows:auto 1fr;gap:8px 12px;padding:14px;border:1px solid #e5edf6;border-radius:8px;background:#fbfdff}.category-detail__icon{grid-row:1/3;width:38px;height:38px;display:grid;place-items:center;border-radius:8px;background:#eff6ff;color:#2563eb}.category-detail__icon img{width:23px;height:23px;object-fit:contain}.category-detail__label{align-self:end;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase}.category-detail strong{align-self:start;color:#0f172a;font-size:14px;font-weight:850;word-break:break-word}.description{white-space:pre-wrap;line-height:1.75;color:#475569}.amenities{display:flex;gap:8px;flex-wrap:wrap}.amenities span{padding:8px 11px;border:1px solid #e2e8f0;border-radius:999px;background:#f8fafc;color:#475569;font-weight:700}.pricing-card{background:linear-gradient(180deg,#fff 0%,#f8fbff 100%)}.price{font-size:30px;font-weight:850;color:#0f172a}.side-list>div{display:flex;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid #edf1f6}
@media(max-width:1199px){.category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:991px){.property-hero{align-items:flex-start;flex-wrap:wrap}.hero-actions{justify-content:flex-start;max-width:none;width:100%}}@media(max-width:575px){.property-hero{flex-direction:column}.hero-actions,.property-action{width:100%}.info-grid,.category-grid{grid-template-columns:1fr}}
</style>
