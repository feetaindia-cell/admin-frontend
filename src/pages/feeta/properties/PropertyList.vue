<template>
  <div class="dashboard-main-body property-management-page">
    <section class="property-page-hero">
      <div class="property-page-title">
        <span class="property-page-icon"><iconify-icon icon="lucide:building-2" /></span>
        <div>
          <span class="property-page-kicker">Property Management</span>
          <h5 class="mb-4">{{ title }}</h5>
          <p class="mb-0">Manage agent property listings, moderation, payments, and visibility.</p>
        </div>
      </div>
      <div class="property-page-actions">
        <button class="property-page-button property-page-button--secondary" :disabled="loading" @click="refresh"><iconify-icon icon="lucide:refresh-cw" /> Refresh</button>
        <button class="property-page-button property-page-button--primary" :disabled="!properties.length" @click="exportRows"><iconify-icon icon="lucide:download" /> Export</button>
      </div>
    </section>

    <PropertySummaryCards :cards="summaryCards" :loading="statsLoading" class="mb-24" />

    <div class="card radius-12 overflow-hidden property-list-card">
      <div class="card-header bg-base border-bottom p-20 property-list-card__header">
        <div class="property-filters">
          <label class="search-control"><iconify-icon icon="lucide:search" /><input v-model="filters.search" type="search" placeholder="Search title, location, agent or description" /></label>
          <select v-model="filters.category" class="form-select"><option value="">All categories</option><option v-for="item in categories" :key="item.id||item.name" :value="item.name">{{ item.name }}</option></select>
          <select v-model="filters.status" class="form-select" :disabled="Boolean(preset.status)"><option value="">All statuses</option><option v-for="item in statuses" :key="item" :value="item">{{ titleCase(item) }}</option></select>
          <select v-model="filters.approval_status" class="form-select" :disabled="Boolean(preset.approval_status)"><option value="">All approval statuses</option><option v-for="item in approvalStatuses" :key="item" :value="item">{{ titleCase(item) }}</option></select>
          <select v-if="featureEnabled" v-model="filters.featured" class="form-select" :disabled="preset.featured!==undefined"><option value="">Featured and standard</option><option value="1">Featured</option><option value="0">Not featured</option></select>
          <input v-model="filters.agent_id" type="number" min="1" class="form-control" placeholder="Agent ID" />
          <input v-model="filters.city" class="form-control" placeholder="City" />
          <input v-model="filters.state" class="form-control" placeholder="State" />
          <input v-model="filters.date_from" type="date" class="form-control" title="From date" />
          <input v-model="filters.date_to" type="date" class="form-control" title="To date" />
          <select v-model="sortOption" class="form-select"><option value="created_at:desc">Newest first</option><option value="created_at:asc">Oldest first</option><option value="price:desc">Price high to low</option><option value="price:asc">Price low to high</option><option value="updated_at:desc">Recently updated</option></select>
          <button v-if="hasFilters" class="filter-clear-button" @click="clearFilters"><iconify-icon icon="lucide:list-filter-x" /> Clear</button>
        </div>
      </div>

      <LoadingState v-if="loading" message="Loading properties..." />
      <div v-else-if="error" class="p-24"><ErrorState :message="error" @retry="load(page)" /></div>
      <div v-else class="card-body p-0">
        <div v-if="properties.length" class="table-responsive">
          <table class="table property-table mb-0">
            <thead>
              <tr>
                <th>Property</th><th>Category</th><th>Agent</th><th>Price</th><th>Status</th><th>Approval</th><th>{{ filters.trashed==='only' ? 'Deleted' : 'Created' }}</th><th class="manage-cell">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in properties" :key="item.id" class="manage-row">
                <td><div class="property-cell"><div class="thumb"><iconify-icon icon="lucide:building-2" /></div><div><router-link :to="`/properties/${item.id}`" class="fw-bold text-primary-light" @click.stop>{{ safeValue(item.title) }}</router-link><div class="text-secondary-light text-xs mt-3">#{{ item.id }} - <iconify-icon :icon="propertyTypeIcon(item.listing_type)" class="me-4" />{{ safeValue(item.listing_type) }}</div></div></div></td>
                <td><span class="category-pill"><iconify-icon :icon="propertyTypeIcon(item.category)" class="me-4" />{{ safeValue(item.category) }}</span></td><td><div class="fw-medium">{{ safeValue(item.agent?.name) }}</div><div class="text-secondary-light text-xs">{{ safeValue(item.agent?.email) }}</div></td><td class="fw-semibold">{{ formatCurrency(item.price) }}</td><td><PropertyStatusBadge :status="isDeleted(item)?'deleted':item.status" /></td><td><PropertyStatusBadge :status="item.approval_status" /></td><td>{{ formatDate(isDeleted(item)?item.deleted_at:item.created_at) }}</td><td class="manage-cell"><button type="button" class="manage-row-button" @click="openManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-actions"><EmptyState icon="lucide:building-2" title="No Properties Found" message="No listings match the current filters." /><div class="d-flex justify-content-center gap-8 pb-32"><button class="btn btn-outline-primary-600 btn-sm" @click="refresh"><iconify-icon icon="lucide:refresh-cw" class="me-6" />Refresh</button><button v-if="hasFilters" class="btn btn-primary-600 btn-sm" @click="clearFilters"><iconify-icon icon="lucide:list-filter-x" class="me-6" />Clear Filters</button></div></div>
        <div v-if="properties.length" class="px-24 pb-24"><Pagination :currentPage="page" :totalPages="totalPages" :startIndex="startIndex" :endIndex="endIndex" :totalItems="total" @page-changed="load" /></div>
      </div>
    </div>
    <RowManageDialog v-model="manageOpen" :title="selectedProperty?.title" :subtitle="selectedProperty ? `#${selectedProperty.id} - ${safeValue(selectedProperty.category)}` : ''">
      <router-link v-if="selectedProperty" :to="`/properties/${selectedProperty.id}`"><iconify-icon icon="lucide:eye" /> View</router-link>
      <router-link v-if="selectedProperty&&auth.hasPermission('property.update')&&!isDeleted(selectedProperty)" :to="`/properties/${selectedProperty.id}/edit`"><iconify-icon icon="lucide:pencil" /> Edit</router-link>
      <button v-if="selectedProperty&&auth.hasPermission('property.approve')&&selectedProperty.approval_status!=='approved'&&!isDeleted(selectedProperty)" type="button" class="text-success" @click="approve(selectedProperty)"><iconify-icon icon="lucide:check" /> Approve</button>
      <button v-if="selectedProperty&&auth.hasPermission('property.reject')&&selectedProperty.approval_status!=='rejected'&&!isDeleted(selectedProperty)" type="button" class="text-danger" @click="reject(selectedProperty)"><iconify-icon icon="lucide:x" /> Reject</button>
      <button v-if="selectedProperty&&featureEnabled && auth.hasPermission('property.feature')&&!isDeleted(selectedProperty)" type="button" @click="feature(selectedProperty)"><iconify-icon icon="lucide:star" /> {{ selectedProperty.featured?'Unfeature':'Feature' }}</button>
      <button v-if="selectedProperty&&auth.hasPermission('property.status')&&!['inactive','deleted'].includes(selectedProperty.status)&&!isDeleted(selectedProperty)" type="button" @click="archive(selectedProperty)"><iconify-icon icon="lucide:archive" /> Archive</button>
      <router-link v-if="selectedProperty?.agent?.id" :to="`/agents/${selectedProperty.agent.id}`"><iconify-icon icon="lucide:user-star" /> View Agent</router-link>
      <router-link v-if="selectedProperty&&auth.hasPermission('property.payment.view')&&selectedProperty.payment_id" :to="`/payments/${selectedProperty.payment_id}`"><iconify-icon icon="lucide:credit-card" /> View Payment</router-link>
      <button v-if="selectedProperty&&auth.hasPermission('property.delete')&&!isDeleted(selectedProperty)" type="button" class="text-danger" @click="remove(selectedProperty)"><iconify-icon icon="lucide:trash-2" /> Delete</button>
    </RowManageDialog>
  </div>
</template>
<script setup>
import Swal from 'sweetalert2'
import { computed,nextTick,onBeforeUnmount,onMounted,reactive,ref,watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import Pagination from '@/components/pagination/index.vue'
import PropertyStatusBadge from '@/components/feeta/properties/PropertyStatusBadge.vue'
import PropertySummaryCards from '@/components/feeta/properties/PropertySummaryCards.vue'
import masterPropertyService from '@/services/masterPropertyService'
import propertyService from '@/services/propertyService'
import { useAuthStore } from '@/stores/auth'
import { propertyTypeIcon } from '@/utils/feetaIcons'
import features from '@/config/features'
import { downloadCsv,formatCurrency,formatDate,safeValue,titleCase } from '@/utils/finance'
const props=defineProps({title:{type:String,default:'All Properties'},preset:{type:Object,default:()=>({})}})
const featureEnabled=features.propertyFeatured
const route=useRoute(),router=useRouter(),auth=useAuthStore();const properties=ref([]),categories=ref([]),stats=ref({}),loading=ref(false),statsLoading=ref(false),error=ref(''),total=ref(0),page=ref(Number(route.query.page)||1),actionId=ref(null),manageOpen=ref(false),selectedProperty=ref(null),sortOption=ref(`${route.query.sort_by||'created_at'}:${route.query.sort_direction||'desc'}`);let timer
const statuses=['active','pending','rejected','inactive','draft','sold','rented','deleted']
const approvalStatuses=['pending','approved','rejected']
const filters=reactive({search:String(route.query.search||''),category:String(route.query.category||''),status:props.preset.status??String(route.query.status||''),trashed:props.preset.trashed??String(route.query.trashed||''),approval_status:props.preset.approval_status??String(route.query.approval_status||''),featured:props.preset.featured!==undefined?String(Number(props.preset.featured)):String(route.query.featured||''),agent_id:String(route.query.agent_id||''),city:String(route.query.city||''),state:String(route.query.state||''),date_from:String(route.query.date_from||''),date_to:String(route.query.date_to||''),sort_by:String(route.query.sort_by||'created_at'),sort_direction:String(route.query.sort_direction||'desc'),per_page:15})
const totalPages=computed(()=>Math.max(1,Math.ceil(total.value/filters.per_page))),startIndex=computed(()=>total.value?(page.value-1)*filters.per_page:0),endIndex=computed(()=>Math.min(startIndex.value+properties.value.length,total.value))
const hasFilters=computed(()=>filters.search||filters.category||filters.agent_id||filters.city||filters.state||filters.date_from||filters.date_to||(!props.preset.status&&filters.status)||(!props.preset.trashed&&filters.trashed)||(!props.preset.approval_status&&filters.approval_status)||(featureEnabled&&props.preset.featured===undefined&&filters.featured!==''))
const summaryCards=computed(()=>[
  {label:'Total Properties',value:stats.value.total_properties??0,icon:'lucide:building-2',iconClass:'bg-primary-50 text-primary-600'},
  {label:'Approved',value:stats.value.approved_properties??0,icon:'lucide:badge-check',iconClass:'bg-success-focus text-success-600'},
  {label:'Pending Approval',value:stats.value.pending_approval_properties??0,icon:'lucide:clock-3',iconClass:'bg-warning-focus text-warning-600'},
  {label:'Rejected',value:stats.value.rejected_approval_properties??0,icon:'lucide:circle-x',iconClass:'bg-danger-focus text-danger-600'},
  {label:'Active',value:stats.value.active_properties??0,icon:'lucide:circle-check',iconClass:'bg-info-focus text-info-600'},
  {label:'Archived',value:stats.value.inactive_properties??0,icon:'lucide:archive',iconClass:'bg-neutral-100 text-neutral-600'},
  {label:'Draft',value:stats.value.draft_properties??0,icon:'lucide:file-pen-line',iconClass:'bg-warning-focus text-warning-600'},
  {label:'Deleted',value:stats.value.deleted_properties??0,icon:'lucide:trash-2',iconClass:'bg-danger-focus text-danger-600'},
])
function normalize(v){const data=Array.isArray(v)?v:v?.data||[];return{data,total:v?.meta?.total??data.length}}
function syncQuery(){router.replace({query:{page:page.value>1?page.value:undefined,...Object.fromEntries(Object.entries(filters).filter(([k,v])=>!['per_page'].includes(k)&&v!==''&&!(k==='status'&&props.preset.status)&&!(k==='approval_status'&&props.preset.approval_status)&&!(k==='featured'&&props.preset.featured!==undefined)))}})}
async function load(next=1){loading.value=true;error.value='';page.value=next;try{const requestFilters={...filters,page:next};if(!featureEnabled)delete requestFilters.featured;const result=normalize(await propertyService.getProperties(requestFilters));properties.value=result.data;total.value=result.total;syncQuery()}catch(err){error.value=err.message;properties.value=[]}finally{loading.value=false}}
async function loadStats(){statsLoading.value=true;try{stats.value=await propertyService.getStatistics()}finally{statsLoading.value=false}}
async function refresh(){await Promise.all([load(page.value),loadStats()])}
function mergeProperty(item, updated){if(!updated)return;const index=properties.value.findIndex(property=>property.id===item.id);if(index>=0)properties.value[index]={...properties.value[index],...updated}}
function isDeleted(item){return Boolean(item.deleted_at)||item.status==='deleted'}
function openManage(item){selectedProperty.value=item;manageOpen.value=true}
async function closeManageForPrompt(){manageOpen.value=false;await nextTick()}
async function act(item,fn,payload,success){if(actionId.value)return;actionId.value=item.id;try{const updated=await fn(item.id,payload);mergeProperty(item,updated);await Swal.fire({icon:'success',title:success,timer:1500,showConfirmButton:false});loadStats().catch(()=>{})}catch(err){await Swal.fire('Action failed',err.message,'error')}finally{actionId.value=null}}
async function approve(item){await closeManageForPrompt();const r=await Swal.fire({title:'Approve property?',text:item.title,icon:'question',showCancelButton:true,confirmButtonText:'Approve'});if(r.isConfirmed)await act(item,propertyService.approveProperty,{remarks:'Approved by administrator'},'Property approved')}
async function reject(item){await closeManageForPrompt();const r=await Swal.fire({title:'Reject property?',input:'textarea',inputLabel:'Reason',showCancelButton:true,confirmButtonText:'Reject',confirmButtonColor:'#dc2626',inputValidator:v=>v?.trim()?undefined:'Reason is required'});if(r.isConfirmed)await act(item,propertyService.rejectProperty,{remarks:r.value.trim()},'Property rejected')}
async function archive(item){await closeManageForPrompt();const r=await Swal.fire({title:'Archive property?',text:item.title,icon:'warning',showCancelButton:true,confirmButtonText:'Archive'});if(r.isConfirmed)await act(item,propertyService.archiveProperty,{remarks:'Archived by administrator'},'Property archived')}
async function feature(item){await closeManageForPrompt();await act(item,propertyService.featureProperty,{featured:!item.featured,remarks:item.featured?'Unfeatured by administrator':'Featured by administrator'},item.featured?'Property unfeatured':'Property featured')}
async function remove(item){await closeManageForPrompt();const r=await Swal.fire({title:'Delete property?',text:'This performs a soft delete.',icon:'warning',showCancelButton:true,confirmButtonText:'Delete',confirmButtonColor:'#dc2626'});if(r.isConfirmed)await act(item,propertyService.deleteProperty,undefined,'Property deleted')}
function clearFilters(){Object.assign(filters,{search:'',category:'',status:props.preset.status??'',trashed:props.preset.trashed??'',approval_status:props.preset.approval_status??'',featured:props.preset.featured!==undefined?String(Number(props.preset.featured)):'',agent_id:'',city:'',state:'',date_from:'',date_to:'',sort_by:'created_at',sort_direction:'desc'});sortOption.value='created_at:desc';load(1)}
function exportRows(){downloadCsv('feeta-properties.csv',[{label:'ID',value:p=>p.id},{label:'Title',value:p=>p.title},{label:'Category',value:p=>p.category},{label:'Agent',value:p=>p.agent?.name},{label:'Price',value:p=>p.price},{label:'City',value:p=>p.city},{label:'Status',value:p=>p.status},{label:'Approval Status',value:p=>p.approval_status},...(featureEnabled?[{label:'Featured',value:p=>p.featured}]:[]),{label:'Created',value:p=>p.created_at},{label:'Deleted At',value:p=>p.deleted_at}],properties.value)}
watch(sortOption,v=>{[filters.sort_by,filters.sort_direction]=v.split(':');load(1)});watch(()=>filters.search,()=>{clearTimeout(timer);timer=setTimeout(()=>load(1),450)});watch(()=>[filters.category,filters.status,filters.trashed,filters.approval_status,filters.featured,filters.agent_id,filters.city,filters.state,filters.date_from,filters.date_to],()=>load(1));onMounted(async()=>{const categoryResult=await masterPropertyService.getCategories({per_page:100,status:'active'}).catch(()=>[]);categories.value=categoryResult?.data||categoryResult||[];await Promise.all([load(page.value),loadStats()])});onBeforeUnmount(()=>clearTimeout(timer))
watch(()=>route.query.search,(value)=>{const nextSearch=String(value||'');if(nextSearch!==filters.search)filters.search=nextSearch})
</script>
<style scoped>
.property-management-page{--property-blue:#2563eb;--property-ink:#0f172a;--property-muted:#64748b;--property-line:#e2e8f0;--property-soft:#f8fafc;display:grid;gap:24px}
.property-page-hero{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px;border:1px solid rgba(148,163,184,.24);border-radius:18px;background:linear-gradient(135deg,#fff 0%,#f8fbff 58%,#f2f7ff 100%);box-shadow:0 18px 48px rgba(15,23,42,.08)}
.property-page-title{display:flex;align-items:center;gap:16px;min-width:0}.property-page-icon{width:54px;height:54px;display:grid;place-items:center;flex:0 0 54px;border-radius:16px;color:#fff;background:linear-gradient(135deg,#2563eb,#0f766e);box-shadow:0 12px 28px rgba(37,99,235,.25);font-size:26px}.property-page-kicker{display:block;margin-bottom:4px;color:#2563eb;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.property-page-title h5{color:var(--property-ink);font-size:24px;font-weight:800}.property-page-title p{color:var(--property-muted)}
.property-page-actions{display:flex;flex-wrap:wrap;gap:10px}.property-page-button{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 16px;border-radius:10px;border:1px solid transparent;font-weight:700;transition:.18s ease}.property-page-button:disabled{opacity:.6}.property-page-button--secondary{color:#1e40af;border-color:#bfdbfe;background:#eff6ff}.property-page-button--secondary:hover:not(:disabled){background:#dbeafe}.property-page-button--primary{color:#fff;background:#2563eb;box-shadow:0 12px 22px rgba(37,99,235,.24)}.property-page-button--primary:hover:not(:disabled){background:#1d4ed8}
.property-list-card{border:1px solid rgba(148,163,184,.25);border-radius:18px!important;box-shadow:0 18px 48px rgba(15,23,42,.08)}.property-list-card__header{background:#fff!important}
.property-filters{display:grid;grid-template-columns:minmax(280px,2fr) repeat(auto-fit,minmax(150px,1fr));gap:12px;align-items:center;width:100%}.search-control{min-height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid var(--property-line);border-radius:12px;background:#fff;color:#64748b;box-shadow:0 1px 2px rgba(15,23,42,.04)}.search-control input{width:100%;min-height:42px;border:0;outline:0;background:transparent;color:#0f172a}.property-filters .form-select,.property-filters .form-control{min-height:44px;border-color:var(--property-line);border-radius:12px;color:#334155;box-shadow:0 1px 2px rgba(15,23,42,.04)}.filter-clear-button{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #fecaca;border-radius:12px;color:#b91c1c;background:#fff5f5;font-weight:700}
.property-table{min-width:1180px;border-collapse:separate;border-spacing:0;table-layout:auto}.property-table th{padding:13px 12px;color:#64748b;font-size:11px;font-weight:800;text-transform:uppercase;background:#f8fafc;white-space:nowrap;border-bottom:1px solid var(--property-line)}.property-table td{padding:13px 12px;vertical-align:middle;border-color:#edf1f5;color:#334155}.property-table th:nth-child(1),.property-table td:nth-child(1){min-width:250px}.property-table th:nth-child(2),.property-table td:nth-child(2){min-width:120px}.property-table th:nth-child(3),.property-table td:nth-child(3){min-width:190px}.property-table th:nth-child(4),.property-table td:nth-child(4){min-width:115px}.property-table tbody tr{transition:.16s ease}.property-table tbody tr:hover{background:#f8fbff}.property-cell{display:flex;align-items:center;gap:10px;min-width:235px}.thumb{width:46px;height:42px;display:grid;place-items:center;flex:0 0 46px;border-radius:12px;color:#2563eb;background:linear-gradient(135deg,#eff6ff,#dff7ef);font-size:21px}.category-pill{display:inline-flex;align-items:center;padding:6px 10px;border:1px solid #e2e8f0;border-radius:999px;background:#f8fafc;color:#334155;font-size:11px;font-weight:800}.featured-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;color:#854d0e;background:#fef3c7;font-size:11px;font-weight:800}
.property-manage-button{min-width:112px;height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #bfdbfe;border-radius:10px;color:#1d4ed8;background:#eff6ff;font-weight:800;transition:.18s ease}.property-manage-button:hover:not(:disabled),.property-manage-button.show{color:#fff;background:#2563eb;border-color:#2563eb;box-shadow:0 10px 22px rgba(37,99,235,.22)}.property-manage-button:disabled{opacity:.68}.manage-chevron{font-size:15px}.property-action-menu{min-width:190px;padding:8px;border:1px solid rgba(148,163,184,.22);border-radius:14px;box-shadow:0 18px 45px rgba(15,23,42,.16)}.property-action-menu .dropdown-item{min-height:38px;display:flex;align-items:center;gap:10px;border-radius:10px;font-size:13px;font-weight:700}.property-action-menu .dropdown-item:hover{background:#f1f5f9}.property-action-menu .dropdown-divider{margin:7px 0}
.empty-actions{padding-top:14px}
@media (max-width:767px){.property-page-hero{align-items:flex-start;flex-direction:column}.property-page-actions,.property-page-button{width:100%}.property-filters{grid-template-columns:1fr}.property-cell{min-width:230px}.property-manage-button{min-width:104px}}
</style>
