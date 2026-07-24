<template>
  <div class="dashboard-main-body">
<LoadingState v-if="loading" message="Loading agent profile..." />
    <ErrorState v-else-if="error" :message="error" @retry="loadAgent" />

    <template v-else>
      <section class="agent-hero mb-24">
        <div class="agent-avatar"><img v-if="agent.profile?.profile_pic" :src="mediaUrl(agent.profile.profile_pic)" :alt="agentName" /><span v-else>{{ getInitials(agentName) }}</span></div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 flex-wrap"><h4 class="mb-0">{{ agentName }}</h4><StatusBadge :status="agent.status" /><AgentVerificationBadge :status="agent.verification_status" /></div>
          <div class="hero-contact mt-10"><span><iconify-icon icon="ri:mail-line" />{{ safe(agent.email) }}<CopyButton :value="agent.email" label="email" /></span><span><iconify-icon icon="ri:phone-line" />{{ safe(agent.phone) }}<CopyButton :value="agent.phone" label="phone" /></span></div>
          <div class="hero-meta mt-10"><span><iconify-icon icon="ri:calendar-line" /> Joined {{ formatDate(agent.created_at, true) }}</span><span><iconify-icon icon="ri:login-box-line" /> Last login {{ formatDate(agent.last_login_at, true) }}</span></div>
        </div>
        <div class="hero-actions">
          <router-link to="/agents" class="btn btn-outline-primary-600"><iconify-icon icon="ri:arrow-left-line" class="me-6" />Back</router-link>
          <router-link v-if="auth.hasPermission('agent.update')" :to="`/agents/${agent.id}/edit`" class="btn btn-primary-600"><iconify-icon icon="ri:edit-line" class="me-6" />Edit</router-link>
          <button v-if="auth.hasPermission('credit.add')" class="btn btn-success-600" :disabled="actionLoading" @click="openCreditModal('add')"><iconify-icon icon="ri:add-circle-line" class="me-6" />Add Credits</button>
          <button v-if="auth.hasPermission('credit.deduct')" class="btn btn-warning-600" :disabled="actionLoading" @click="openCreditModal('deduct')"><iconify-icon icon="ri:subtract-line" class="me-6" />Deduct</button>
        </div>
      </section>

      <AgentSummaryCards :cards="kpiCards" class="mb-24" />

      <div class="profile-tabs mb-24">
        <button v-for="tab in visibleTabs" :key="tab.key" :class="{ active: activeTab === tab.key }" type="button" @click="selectTab(tab.key)">
          <iconify-icon :icon="tab.icon" />{{ tab.label }}
        </button>
      </div>

      <section v-if="activeTab === 'overview'" class="row gy-4">
        <div class="col-xl-7">
          <div class="profile-card h-100">
            <SectionHeading icon="ri:id-card-line" title="Profile details" subtitle="Personal, contact and business information" />
            <div class="detail-grid">
              <Info label="First name" :value="safe(agent.first_name)" /><Info label="Last name" :value="safe(agent.last_name)" /><Info label="Email" :value="safe(agent.email)" /><Info label="Phone" :value="safe(agent.phone)" />
              <Info label="WhatsApp" :value="safe(agent.profile?.whatsapp)" /><Info label="City" :value="safe(agent.profile?.city)" /><Info label="State" :value="safe(agent.profile?.state)" /><Info label="Agency" :value="safe(agent.profile?.agency_name)" />
              <Info label="Designation" :value="safe(agent.profile?.designation)" /><Info label="Experience" :value="safe(agent.profile?.experience)" /><Info label="RERA ID" :value="safe(agent.profile?.rera_id)" /><Info label="Pincode" :value="safe(agent.profile?.pincode)" />
              <Info label="Operations" :value="safe(agent.profile?.operations)" wide /><Info label="Address" :value="safe(agent.profile?.address)" wide /><Info label="About" :value="safe(agent.profile?.about_me)" wide />
            </div>
          </div>
        </div>
        <div class="col-xl-5">
          <div class="profile-card mb-24">
            <SectionHeading icon="ri:shield-check-line" title="KYC verification" subtitle="Available verification information" />
            <AgentVerificationBadge :status="agent.kyc?.verification_status || agent.verification_status" />
            <div class="side-list mt-12"><div><span>KYC request ID</span><strong>{{ safe(agent.kyc?.kyc_request_id) }}</strong></div><div><span>Verified at</span><strong>{{ formatDate(agent.kyc?.kyc_verified_at) }}</strong></div><div v-if="agent.kyc?.remarks"><span>Remarks</span><strong>{{ agent.kyc.remarks }}</strong></div></div>
            <div class="kyc-action-row mt-16">
              <router-link v-if="auth.hasPermission('kyc.view')" :to="`/kyc/${agent.id}`" class="btn btn-sm btn-outline-primary-600"><iconify-icon icon="ri:eye-line" />View KYC</router-link>
              <router-link v-if="auth.hasPermission('kyc.history')" :to="`/kyc/${agent.id}?tab=history`" class="btn btn-sm btn-outline-secondary"><iconify-icon icon="ri:history-line" />History</router-link>
              <button v-if="auth.hasPermission('kyc.approve') && !agentKycApproved" type="button" class="btn btn-sm btn-success-600" :disabled="actionLoading" @click="approveKycFromProfile"><iconify-icon icon="ri:shield-check-line" />Verify</button>
              <button v-if="auth.hasPermission('kyc.reject') && !agentKycRejected" type="button" class="btn btn-sm btn-danger-600" :disabled="actionLoading" @click="rejectKycFromProfile"><iconify-icon icon="ri:close-circle-line" />Reject</button>
            </div>
          </div>
          <div class="profile-card">
            <SectionHeading icon="ri:bank-card-line" title="Payment summary" subtitle="Payment and invoice totals" />
            <div class="side-list"><div><span>Total payments</span><strong>{{ agent.payment_summary?.total_payments ?? 0 }}</strong></div><div><span>Successful</span><strong>{{ agent.payment_summary?.successful_payments ?? 0 }}</strong></div><div><span>Failed</span><strong>{{ agent.payment_summary?.failed_payments ?? 0 }}</strong></div><div><span>Total paid</span><strong>{{ formatCurrency(agent.payment_summary?.total_paid_amount) }}</strong></div></div>
          </div>
        </div>
      </section>

      <section v-if="activeTab === 'properties'" class="profile-card">
        <SectionHeading icon="ri:building-2-line" title="Properties" subtitle="Agent property records" action-label="Open full property page" :action-to="`/agents/${agent.id}/properties`" />
        <TableState :loading="tabLoading.properties" :error="tabErrors.properties" @retry="loadProperties(page.properties)">
          <div v-if="properties.length" class="table-responsive"><table class="table profile-table mb-0"><thead><tr><th>Property</th><th>Category</th><th>Price</th><th>Status</th><th>Created</th><th class="manage-cell">Manage</th></tr></thead><tbody><tr v-for="item in properties" :key="item.id" class="manage-row"><td><strong>{{ safe(item.name) }}</strong><div class="text-secondary-light text-xs">#{{ item.id }}</div></td><td>{{ safe(item.category || item.property_type) }}</td><td>{{ formatCurrency(item.price) }}</td><td><StatusBadge :status="item.status" /></td><td>{{ formatDate(item.created_at, true) }}</td><td class="manage-cell"><button type="button" class="manage-row-button" @click="openPropertyManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td></tr></tbody></table></div>
          <EmptyState v-else icon="ri:building-2-line" title="No properties found" message="No property records are available for this agent." />
          <Pager v-if="properties.length" name="properties" />
        </TableState>
      </section>

      <section v-if="activeTab === 'credits'" class="profile-card">
        <SectionHeading icon="ri:wallet-3-line" title="Credits" subtitle="Wallet balance and quick credit actions" />
        <div class="row gy-4">
          <div v-for="card in creditCards" :key="card.label" class="col-sm-6 col-xl-3"><div class="credit-card"><span>{{ card.label }}</span><strong>{{ card.value }}</strong></div></div>
        </div>
        <div class="credit-actions mt-24">
          <button v-if="auth.hasPermission('credit.add')" class="btn btn-success-600" :disabled="actionLoading" @click="openCreditModal('add')"><iconify-icon icon="ri:add-line" class="me-6" />Add Credits</button>
          <button v-if="auth.hasPermission('credit.deduct')" class="btn btn-warning-600" :disabled="actionLoading" @click="openCreditModal('deduct')"><iconify-icon icon="ri:subtract-line" class="me-6" />Deduct Credits</button>
          <button class="btn btn-outline-primary-600" @click="selectTab('transactions')">View Transactions</button>
          <button class="btn btn-outline-primary-600" @click="selectTab('payments')">View Payments</button>
          <button class="btn btn-outline-primary-600" @click="selectTab('manual')">View Manual Transfers</button>
          <button class="btn btn-outline-primary-600" :disabled="tabLoading.credits" @click="loadWallet"><iconify-icon icon="ri:refresh-line" class="me-6" />Refresh</button>
        </div>
      </section>

      <section v-if="activeTab === 'transactions'" class="profile-card">
        <SectionHeading icon="ri:receipt-line" title="Credit Transactions" subtitle="Complete credit transaction history" :action-to="`/credits/${agent.id}/transactions`" action-label="Open Credit Page" />
        <div class="tab-toolbar"><label class="search-control"><iconify-icon icon="ri:search-line" /><input v-model="filters.transactions.search" type="search" placeholder="Search remarks" @keyup.enter="loadTransactions(1)" /></label><select v-model="filters.transactions.type" class="form-select"><option value="">All types</option><option v-for="type in transactionTypes" :key="type" :value="type">{{ titleCase(type) }}</option></select><select v-model="filters.transactions.manual_transfer" class="form-select"><option value="">All sources</option><option value="1">Manual transfers</option><option value="0">Admin/System</option></select><button class="btn btn-outline-primary-600" @click="loadTransactions(1)">Refresh</button></div>
        <TableState :loading="tabLoading.transactions" :error="tabErrors.transactions" @retry="loadTransactions(page.transactions)">
          <div v-if="transactions.length" class="table-responsive"><table class="table profile-table mb-0"><thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Remarks</th><th>Created By</th><th>Date</th></tr></thead><tbody><tr v-for="item in transactions" :key="item.id"><td>#{{ item.id }}</td><td><StatusBadge :status="item.type" /></td><td :class="Number(item.credits) >= 0 ? 'text-success-600' : 'text-danger-600'" class="fw-bold">{{ Number(item.credits) >= 0 ? '+' : '' }}{{ item.credits }}</td><td>{{ safe(item.description) }}</td><td>{{ item.created_by ? `#${item.created_by}` : 'System' }}</td><td>{{ formatDate(item.created_at) }}</td></tr></tbody></table></div>
          <EmptyState v-else icon="ri:history-line" title="No transactions found" message="No credit transactions match filters." /><Pager v-if="transactions.length" name="transactions" />
        </TableState>
      </section>

      <section v-if="activeTab === 'payments'" class="profile-card">
        <SectionHeading icon="ri:bank-card-line" title="Payments" subtitle="Payments linked to this agent" :action-to="`/payments?agent_id=${agent.id}`" action-label="Open Payments Page" />
        <div class="tab-toolbar"><label class="search-control"><iconify-icon icon="ri:search-line" /><input v-model="filters.payments.search" type="search" placeholder="Search payment or invoice" @keyup.enter="loadPayments(1)" /></label><select v-model="filters.payments.status" class="form-select"><option value="">All statuses</option><option v-for="status in paymentStatuses" :key="status" :value="status">{{ titleCase(status) }}</option></select><button class="btn btn-outline-primary-600" @click="loadPayments(1)">Refresh</button></div>
        <TableState :loading="tabLoading.payments" :error="tabErrors.payments" @retry="loadPayments(page.payments)">
          <div v-if="payments.length" class="table-responsive"><table class="table profile-table mb-0"><thead><tr><th>Payment</th><th>Invoice</th><th>Amount</th><th>Status</th><th>Property</th><th>Created</th><th class="manage-cell">Manage</th></tr></thead><tbody><tr v-for="item in payments" :key="item.id" class="manage-row"><td>#{{ item.id }}<div class="text-secondary-light text-xs">{{ safe(item.razorpay_payment_id) }}</div></td><td>{{ safe(item.invoice?.invoice_number) }}</td><td>{{ formatCurrency(item.amount) }}</td><td><StatusBadge :status="item.status" /></td><td>{{ item.listing_id ? `#${item.listing_id}` : 'Not linked' }}</td><td>{{ formatDate(item.created_at, true) }}</td><td class="manage-cell"><button type="button" class="manage-row-button" @click="openPaymentManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td></tr></tbody></table></div>
          <EmptyState v-else icon="ri:bank-card-line" title="No payments found" message="No payments match filters." /><Pager v-if="payments.length" name="payments" />
        </TableState>
      </section>

      <section v-if="activeTab === 'manual'" class="profile-card">
        <SectionHeading icon="ri:bank-line" title="Manual Transfers" subtitle="Manual bank transfer requests from this agent" action-to="/credits/manual-transfers" action-label="Open Transfer Page" />
        <div class="tab-toolbar"><label class="search-control"><iconify-icon icon="ri:search-line" /><input v-model="filters.manual.search" type="search" placeholder="Search reference or bank" @keyup.enter="loadManualTransfers(1)" /></label><select v-model="filters.manual.status" class="form-select"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><button class="btn btn-outline-primary-600" @click="loadManualTransfers(1)">Refresh</button></div>
        <TableState :loading="tabLoading.manual" :error="tabErrors.manual" @retry="loadManualTransfers(page.manual)">
          <div v-if="manualTransfers.length" class="table-responsive"><table class="table profile-table mb-0"><thead><tr><th>ID</th><th>Amount</th><th>Reference</th><th>Bank</th><th>Status</th><th>Submitted</th><th class="manage-cell">Manage</th></tr></thead><tbody><tr v-for="item in manualTransfers" :key="item.id" class="manage-row"><td>#{{ item.id }}</td><td>{{ formatCurrency(item.transfer_amount) }}</td><td>{{ safe(item.transaction_reference_number) }}</td><td>{{ safe(item.sender_bank_name) }}</td><td><StatusBadge :status="item.status" /></td><td>{{ formatDate(item.created_at, true) }}</td><td class="manage-cell"><button type="button" class="manage-row-button" @click="openTransferManage(item)"><iconify-icon icon="lucide:settings" /> Manage</button></td></tr></tbody></table></div>
          <EmptyState v-else icon="ri:bank-line" title="No manual transfers" message="No manual transfers match filters." /><Pager v-if="manualTransfers.length" name="manual" />
        </TableState>
      </section>

      <section v-if="activeTab === 'activity'" class="profile-card">
        <SectionHeading icon="ri:history-line" title="Activity" subtitle="Agent and credit admin activity" />
        <TableState :loading="tabLoading.activity" :error="tabErrors.activity" @retry="loadActivity(page.activity)">
          <div v-if="activity.length" class="table-responsive"><table class="table profile-table mb-0"><thead><tr><th>ID</th><th>Action</th><th>Module</th><th>Description</th><th>Date</th></tr></thead><tbody><tr v-for="item in activity" :key="item.id"><td>#{{ item.id }}</td><td>{{ safe(item.action) }}</td><td>{{ safe(item.module) }}</td><td>{{ safe(item.description) }}</td><td>{{ formatDate(item.created_at) }}</td></tr></tbody></table></div>
          <EmptyState v-else icon="ri:history-line" title="No activity found" message="No activity logs are available for this agent." /><Pager v-if="activity.length" name="activity" />
        </TableState>
      </section>
    </template>
    <RowManageDialog v-model="paymentManageOpen" :title="selectedPayment ? `Payment #${selectedPayment.id}` : ''" :subtitle="selectedPayment ? safe(selectedPayment.razorpay_payment_id) : ''">
      <router-link v-if="selectedPayment" :to="`/payments/${selectedPayment.id}`"><iconify-icon icon="ri:eye-line" /> View payment</router-link>
      <router-link v-if="selectedPayment && auth.hasPermission('payment.invoice.view') && selectedPayment.invoice" :to="`/payments/${selectedPayment.id}/invoice`"><iconify-icon icon="ri:file-list-3-line" /> Invoice</router-link>
    </RowManageDialog>
    <RowManageDialog v-model="propertyManageOpen" :title="selectedProperty ? safe(selectedProperty.name) : ''" :subtitle="selectedProperty ? `#${selectedProperty.id}` : ''">
      <router-link v-if="selectedProperty" :to="`/agents/${agent.id}/properties/${selectedProperty.id}`"><iconify-icon icon="ri:eye-line" /> View property</router-link>
      <router-link v-if="selectedProperty" :to="`/agents/${agent.id}/properties`"><iconify-icon icon="ri:list-check" /> Open property page</router-link>
    </RowManageDialog>
    <RowManageDialog v-model="transferManageOpen" :title="selectedTransfer ? `Transfer #${selectedTransfer.id}` : ''" :subtitle="selectedTransfer ? safe(selectedTransfer.transaction_reference_number) : ''">
      <button v-if="selectedTransfer" type="button" :disabled="actionLoading" @click="viewTransfer(selectedTransfer)"><iconify-icon icon="ri:eye-line" /> Details</button>
      <button v-if="selectedTransfer && selectedTransfer.status === 'pending' && auth.hasPermission('credit.approve')" type="button" class="text-success" :disabled="actionLoading" @click="approveTransfer(selectedTransfer)"><iconify-icon icon="ri:check-line" /> Approve</button>
      <button v-if="selectedTransfer && selectedTransfer.status === 'pending' && auth.hasPermission('credit.reject')" type="button" class="text-danger" :disabled="actionLoading" @click="rejectTransfer(selectedTransfer)"><iconify-icon icon="ri:close-line" /> Reject</button>
    </RowManageDialog>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CopyButton from '@/components/common/CopyButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import RowManageDialog from '@/components/common/RowManageDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AgentSummaryCards from '@/components/feeta/agents/AgentSummaryCards.vue'
import AgentVerificationBadge from '@/components/feeta/agents/AgentVerificationBadge.vue'
import Pagination from '@/components/pagination/index.vue'
import agentService from '@/services/agentService'
import creditService from '@/services/creditService'
import kycService from '@/services/kycService'
import paymentService from '@/services/paymentService'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate, safeValue, titleCase } from '@/utils/finance'
import { mediaUrl } from '@/utils/mediaUrl'

const Info = defineComponent({ props: { label: String, value: [String, Number], wide: Boolean }, setup: (p) => () => h('div', { class: ['detail-item', p.wide ? 'is-wide' : ''] }, [h('span', p.label), h('strong', p.value)]) })
const SectionHeading = defineComponent({ props: { icon: String, title: String, subtitle: String, actionTo: String, actionLabel: String }, setup: (p) => () => h('div', { class: 'section-heading section-heading-action' }, [h('span', [h('iconify-icon', { icon: p.icon })]), h('div', { class: 'flex-grow-1' }, [h('h6', { class: 'mb-2' }, p.title), h('p', { class: 'mb-0' }, p.subtitle)]), p.actionTo ? h('a', { class: 'btn btn-outline-primary-600 btn-sm', href: p.actionTo }, p.actionLabel || 'Open') : null]) })
const TableState = defineComponent({ props: { loading: Boolean, error: String }, emits: ['retry'], setup: (p, { slots, emit }) => () => p.loading ? h(LoadingState, { message: 'Loading data...' }) : p.error ? h('div', { class: 'p-24' }, [h(ErrorState, { message: p.error, onRetry: () => emit('retry') })]) : slots.default?.() })

const route = useRoute()
const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const actionLoading = ref(false)
const activeTab = ref(String(route.query.tab || 'overview'))
const agent = ref({})
const wallet = ref({})
const properties = ref([])
const transactions = ref([])
const payments = ref([])
const manualTransfers = ref([])
const activity = ref([])
const paymentManageOpen = ref(false)
const transferManageOpen = ref(false)
const propertyManageOpen = ref(false)
const selectedPayment = ref(null)
const selectedTransfer = ref(null)
const selectedProperty = ref(null)
const total = reactive({ properties: 0, transactions: 0, payments: 0, manual: 0, activity: 0 })
const page = reactive({ properties: 1, transactions: 1, payments: 1, manual: 1, activity: 1 })
const perPage = 10
const tabLoading = reactive({ credits: false, properties: false, transactions: false, payments: false, manual: false, activity: false })
const tabErrors = reactive({ properties: '', transactions: '', payments: '', manual: '', activity: '' })
const filters = reactive({
  transactions: { search: '', type: '', manual_transfer: '' },
  payments: { search: '', status: '' },
  manual: { search: '', status: '' },
})
const tabs = [
  { key: 'overview', label: 'Overview', icon: 'ri:id-card-line', permissions: [] },
  { key: 'properties', label: 'Properties', icon: 'ri:building-2-line', permissions: ['agent.properties.view'] },
  { key: 'credits', label: 'Credits', icon: 'ri:wallet-3-line', permissions: ['credit.view'] },
  { key: 'transactions', label: 'Transactions', icon: 'ri:receipt-line', permissions: ['credit.history'] },
  { key: 'payments', label: 'Payments', icon: 'ri:bank-card-line', permissions: ['payment.view'] },
  { key: 'manual', label: 'Manual Transfers', icon: 'ri:bank-line', permissions: ['credit.view'] },
  { key: 'activity', label: 'Activity', icon: 'ri:history-line', permissions: ['agent.view'] },
]
const transactionTypes = ['purchase', 'deduction', 'refund', 'adjustment']
const paymentStatuses = ['pending', 'processing', 'success', 'failed', 'refunded']

const agentName = computed(() => safe(agent.value.name))
const agentKycStatus = computed(() => String(agent.value.kyc?.verification_status || agent.value.verification_status || '').toLowerCase())
const agentKycApproved = computed(() => ['approved', 'verified'].includes(agentKycStatus.value))
const agentKycRejected = computed(() => agentKycStatus.value === 'rejected')
const walletSummary = computed(() => Object.keys(wallet.value || {}).length ? wallet.value : agent.value.wallet_summary || {})
const walletBalance = computed(() => Number(walletSummary.value.current_credits ?? walletSummary.value.available_credits ?? walletSummary.value.remaining_credits ?? 0))
const visibleTabs = computed(() => tabs.filter((tab) => auth.hasAnyPermission(tab.permissions || [])))
const kpiCards = computed(() => [
  { label: 'Total Properties', value: agent.value.property_summary?.total_properties ?? 0, icon: 'ri:home-4-line', iconClass: 'bg-primary-50 text-primary-600' },
  { label: 'Active Properties', value: agent.value.property_summary?.active_properties ?? 0, icon: 'ri:checkbox-circle-line', iconClass: 'bg-success-focus text-success-600' },
  { label: 'Wallet Balance', value: walletBalance.value, icon: 'ri:wallet-3-line', iconClass: 'bg-info-focus text-info-600' },
  { label: 'Total Payments', value: agent.value.payment_summary?.total_payments ?? 0, icon: 'ri:bank-card-line', iconClass: 'bg-warning-focus text-warning-600' },
])
const creditCards = computed(() => [
  { label: 'Current Credits', value: walletBalance.value },
  { label: 'Purchased Credits', value: walletSummary.value.purchased_credits ?? 0 },
  { label: 'Used Credits', value: walletSummary.value.used_credits ?? 0 },
  { label: 'Wallet Status', value: walletBalance.value > 0 ? 'Active' : 'Empty' },
  { label: 'Remaining Credits', value: walletSummary.value.remaining_credits ?? walletBalance.value },
  { label: 'Last Updated', value: formatDate(walletSummary.value.updated_at, true) },
])

function safe(value) { return safeValue(value) }
function normalize(payload) { const data = Array.isArray(payload) ? payload : payload?.data || []; return { data, total: payload?.meta?.total ?? data.length } }
function getInitials(name) { return String(name || 'Agent').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A' }
const Pager = defineComponent({ props: { name: String }, setup: (p) => () => h('div', { class: 'px-24 pb-24 pt-20' }, [h(Pagination, { currentPage: page[p.name], totalPages: Math.max(1, Math.ceil(total[p.name] / perPage)), startIndex: total[p.name] ? (page[p.name] - 1) * perPage : 0, endIndex: Math.min(((page[p.name] - 1) * perPage) + getTabRows(p.name).length, total[p.name]), totalItems: total[p.name], onPageChanged: (next) => loadTab(p.name, next) })]) })
function getTabRows(name) { return ({ properties, transactions, payments, manual: manualTransfers, activity }[name]?.value) || [] }
async function loadAgent() { loading.value = true; error.value = ''; try { agent.value = await agentService.getAgent(route.params.id); wallet.value = agent.value.wallet_summary || {} } catch (err) { error.value = err.message } finally { loading.value = false } }
async function loadWallet() { tabLoading.credits = true; try { wallet.value = await creditService.getWallet(route.params.id) } finally { tabLoading.credits = false } }
async function loadProperties(next = 1) { tabLoading.properties = true; tabErrors.properties = ''; page.properties = next; try { const r = normalize(await agentService.getAgentProperties(route.params.id, { page: next, per_page: perPage })); properties.value = r.data; total.properties = r.total } catch (err) { tabErrors.properties = err.message } finally { tabLoading.properties = false } }
async function loadTransactions(next = 1) { tabLoading.transactions = true; tabErrors.transactions = ''; page.transactions = next; try { const params = { ...filters.transactions, page: next, per_page: perPage }; const r = normalize(await creditService.getTransactions(route.params.id, params)); const term = filters.transactions.search.trim().toLowerCase(); transactions.value = term ? r.data.filter((x) => String(x.description || x.reference_id || '').toLowerCase().includes(term)) : r.data; total.transactions = r.total } catch (err) { tabErrors.transactions = err.message } finally { tabLoading.transactions = false } }
async function loadPayments(next = 1) { tabLoading.payments = true; tabErrors.payments = ''; page.payments = next; try { const r = normalize(await paymentService.getPayments({ ...filters.payments, agent_id: route.params.id, page: next, per_page: perPage })); payments.value = r.data; total.payments = r.total } catch (err) { tabErrors.payments = err.message } finally { tabLoading.payments = false } }
async function loadManualTransfers(next = 1) { tabLoading.manual = true; tabErrors.manual = ''; page.manual = next; try { const r = normalize(await creditService.getManualTransfers({ ...filters.manual, agent_id: route.params.id, page: next, per_page: perPage })); manualTransfers.value = r.data; total.manual = r.total } catch (err) { tabErrors.manual = err.message } finally { tabLoading.manual = false } }
async function loadActivity(next = 1) { tabLoading.activity = true; tabErrors.activity = ''; page.activity = next; try { const r = normalize(await agentService.getAgentActivity(route.params.id, { page: next, per_page: perPage })); activity.value = r.data; total.activity = r.total } catch (err) { tabErrors.activity = err.message } finally { tabLoading.activity = false } }
function loadTab(name, next = 1) { return ({ properties: loadProperties, transactions: loadTransactions, payments: loadPayments, manual: loadManualTransfers, activity: loadActivity, credits: loadWallet }[name]?.(next)) }
function selectTab(tab) { activeTab.value = tab; loadTab(tab, page[tab] || 1) }
function openPropertyManage(item) { selectedProperty.value = item; propertyManageOpen.value = true }
function openPaymentManage(item) { selectedPayment.value = item; paymentManageOpen.value = true }
function openTransferManage(item) { selectedTransfer.value = item; transferManageOpen.value = true }
async function openCreditModal(mode) {
  if (actionLoading.value) return
  const isDeduct = mode === 'deduct'
  const title = isDeduct ? 'Deduct Credits' : 'Add Credits'
  const result = await Swal.fire({ title, html: `<input id="credits" type="number" min="1" class="swal2-input" placeholder="Amount"><input id="reason" class="swal2-input" placeholder="Reason"><textarea id="remarks" class="swal2-textarea" placeholder="Remarks"></textarea>`, icon: isDeduct ? 'warning' : 'question', showCancelButton: true, confirmButtonText: title, showLoaderOnConfirm: true, preConfirm: () => { const amount = Number(document.getElementById('credits').value); const reason = document.getElementById('reason').value.trim(); const remarks = document.getElementById('remarks').value.trim(); if (!amount || amount < 1) return Swal.showValidationMessage('Amount must be greater than zero'); if (isDeduct && amount > walletBalance.value) return Swal.showValidationMessage(`Cannot deduct more than available balance (${walletBalance.value}).`); if (!reason || !remarks) return Swal.showValidationMessage('Reason and remarks are required'); return { amount, reason, remarks } } })
  if (!result.isConfirmed) return
  actionLoading.value = true
  try { if (isDeduct) await creditService.deductCredits(route.params.id, result.value); else await creditService.addCredits(route.params.id, result.value); await Swal.fire({ icon: 'success', title: isDeduct ? 'Credits deducted' : 'Credits added', timer: 1200, showConfirmButton: false }); await Promise.all([loadAgent(), loadWallet(), loadTransactions(1), loadActivity(1)]) } catch (err) { await Swal.fire(title + ' failed', err.message, 'error') } finally { actionLoading.value = false }
}
async function approveKycFromProfile() {
  const result = await Swal.fire({ title: 'Verify KYC?', input: 'textarea', inputPlaceholder: 'Optional verification remarks', icon: 'question', showCancelButton: true, confirmButtonText: 'Verify KYC' })
  if (!result.isConfirmed) return
  actionLoading.value = true
  try { await kycService.approve(agent.value.id, { remarks: result.value || '' }); await Swal.fire({ icon: 'success', title: 'KYC verified', timer: 1200, showConfirmButton: false }); await loadAgent() } catch (err) { await Swal.fire('KYC verification failed', err.message, 'error') } finally { actionLoading.value = false }
}
async function rejectKycFromProfile() {
  const result = await Swal.fire({ title: 'Reject KYC?', html: '<input id="kyc-reason" class="swal2-input" placeholder="Reason"><textarea id="kyc-remarks" class="swal2-textarea" placeholder="Optional remarks"></textarea>', icon: 'warning', showCancelButton: true, confirmButtonText: 'Reject KYC', confirmButtonColor: '#dc2626', preConfirm: () => { const reason = document.getElementById('kyc-reason').value.trim(); const remarks = document.getElementById('kyc-remarks').value.trim(); if (!reason) return Swal.showValidationMessage('Reason is required'); return { reason, remarks } } })
  if (!result.isConfirmed) return
  actionLoading.value = true
  try { await kycService.reject(agent.value.id, result.value); await Swal.fire({ icon: 'success', title: 'KYC rejected', timer: 1200, showConfirmButton: false }); await loadAgent() } catch (err) { await Swal.fire('KYC rejection failed', err.message, 'error') } finally { actionLoading.value = false }
}
async function viewTransfer(item) { await Swal.fire({ title: `Transfer #${item.id}`, html: `<div class="text-start"><p><b>Reference:</b> ${safe(item.transaction_reference_number)}</p><p><b>Bank:</b> ${safe(item.sender_bank_name)}</p><p><b>Amount:</b> ${formatCurrency(item.transfer_amount)}</p><p><b>Status:</b> ${safe(item.status)}</p><p><b>Remarks:</b> ${safe(item.admin_note)}</p></div>` }) }
async function approveTransfer(item) { if (actionLoading.value) return; const remarks = await Swal.fire({ title: 'Approve transfer?', text: `${formatCurrency(item.transfer_amount)} · ${safe(item.transaction_reference_number)}`, input: 'textarea', inputLabel: 'Remarks', icon: 'question', showCancelButton: true, confirmButtonText: 'Approve', showLoaderOnConfirm: true, inputValidator: (v) => v?.trim() ? undefined : 'Remarks are required' }); if (!remarks.isConfirmed) return; actionLoading.value = true; try { await creditService.approveTransfer(item.id, { remarks: remarks.value.trim() }); await Swal.fire({ icon: 'success', title: 'Transfer approved', timer: 1200, showConfirmButton: false }); await Promise.all([loadAgent(), loadManualTransfers(page.manual), loadWallet(), loadTransactions(1), loadActivity(1)]) } catch (err) { await Swal.fire('Approval failed', err.message, 'error') } finally { actionLoading.value = false } }
async function rejectTransfer(item) { if (actionLoading.value) return; const result = await Swal.fire({ title: 'Reject transfer?', html: '<input id="transfer-reason" class="swal2-input" placeholder="Reason"><textarea id="transfer-remarks" class="swal2-textarea" placeholder="Remarks"></textarea>', icon: 'warning', showCancelButton: true, confirmButtonText: 'Reject', confirmButtonColor: '#dc2626', showLoaderOnConfirm: true, preConfirm: () => { const reason = document.getElementById('transfer-reason').value.trim(); const remarks = document.getElementById('transfer-remarks').value.trim(); if (!reason || !remarks) return Swal.showValidationMessage('Reason and remarks are required'); return { reason, remarks } } }); if (!result.isConfirmed) return; actionLoading.value = true; try { await creditService.rejectTransfer(item.id, result.value); await Swal.fire({ icon: 'success', title: 'Transfer rejected', timer: 1200, showConfirmButton: false }); await Promise.all([loadAgent(), loadManualTransfers(page.manual), loadWallet(), loadTransactions(1), loadActivity(1)]) } catch (err) { await Swal.fire('Rejection failed', err.message, 'error') } finally { actionLoading.value = false } }
watch(() => filters.transactions.type, () => loadTransactions(1)); watch(() => filters.transactions.manual_transfer, () => loadTransactions(1)); watch(() => filters.payments.status, () => loadPayments(1)); watch(() => filters.manual.status, () => loadManualTransfers(1))
onMounted(async () => { await loadAgent(); await loadTab(activeTab.value) })
</script>

<style scoped>
.agent-hero{display:flex;align-items:center;gap:20px;padding:26px;border:1px solid #dce6fa;border-radius:16px;background:linear-gradient(135deg,#fff,#edf4ff)}.agent-avatar{width:82px;height:82px;display:grid;place-items:center;flex:0 0 82px;overflow:hidden;border:4px solid #fff;border-radius:22px;color:#fff;background:linear-gradient(135deg,#487fff,#315ed1);font-size:27px;font-weight:750;box-shadow:0 10px 24px rgba(72,127,255,.2)}.agent-avatar img{width:100%;height:100%;object-fit:cover}.hero-contact,.hero-meta{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.hero-contact>span,.hero-meta>span{display:inline-flex;align-items:center;gap:7px;color:#475569;font-size:13px}.hero-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;max-width:520px}.profile-tabs{display:flex;flex-wrap:wrap;gap:10px}.profile-tabs button{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid #dbe3ee;border-radius:999px;background:#fff;color:#475569;font-weight:700}.profile-tabs button.active,.profile-tabs button:hover{color:#315ed1;border-color:#a9c2ff;background:#edf3ff}.profile-card{padding:22px;border:1px solid #e5eaf2;border-radius:14px;background:#fff}.section-heading{display:flex;align-items:center;gap:12px;padding-bottom:17px;margin-bottom:18px;border-bottom:1px solid #edf1f6}.section-heading>span{width:40px;height:40px;display:grid;place-items:center;flex:0 0 40px;border-radius:10px;color:#487fff;background:#edf3ff;font-size:20px}.section-heading p{color:#64748b;font-size:12px}.section-heading-action{flex-wrap:wrap}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0 28px}:deep(.detail-item){display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #f0f3f7}:deep(.detail-item span),.side-list span{color:#64748b}:deep(.detail-item strong),.side-list strong{text-align:right;color:#172033;word-break:break-word}:deep(.detail-item.is-wide){grid-column:1/-1}.side-list>div{display:flex;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid #f0f3f7}.kyc-action-row{display:flex;flex-wrap:wrap;gap:8px}.credit-card{height:100%;padding:18px;border:1px solid #e4ebf7;border-radius:14px;background:#f8fbff}.credit-card span{display:block;color:#64748b;font-size:12px}.credit-card strong{display:block;margin-top:8px;color:#172033;font-size:24px}.credit-actions,.tab-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:12px}.tab-toolbar{margin-bottom:18px}.tab-toolbar>*{min-width:180px;flex:1 1 180px}.search-control{min-height:42px;display:flex;align-items:center;gap:9px;padding:0 13px;border:1px solid #d9e0ea;border-radius:9px;background:#fff;flex:2 1 280px}.search-control input{width:100%;border:0;outline:0;background:transparent}.profile-table th{padding:13px 15px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.04em;background:#f8fafc;white-space:nowrap}.profile-table td{padding:14px 15px;vertical-align:middle;border-color:#eef2f7}.table-view{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;color:#2563eb;background:#eff6ff}@media(max-width:991px){.agent-hero{align-items:flex-start;flex-wrap:wrap}.hero-actions{justify-content:flex-start;max-width:none;width:100%}}@media(max-width:575px){.agent-hero{flex-direction:column}.detail-grid{grid-template-columns:1fr}:deep(.detail-item.is-wide){grid-column:auto}.tab-toolbar>*{width:100%;flex:1 1 100%}}
</style>
