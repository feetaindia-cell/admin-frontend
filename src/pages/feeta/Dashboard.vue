<template>
  <div class="dashboard-main-body feeta-dashboard">
    <section class="dashboard-hero">
      <div class="dashboard-hero__copy">
        <span class="dashboard-kicker">Welcome back,</span>
        <h1>{{ auth.admin?.name || 'Super Admin' }}</h1>
        <p>{{ greetingCopy }}</p>
      </div>
      <div class="dashboard-hero-actions">
        <button type="button" class="dashboard-button dashboard-button--light" :disabled="loading" @click="loadDashboard">
          <iconify-icon icon="lucide:refresh-cw"></iconify-icon>
          Refresh
        </button>
        <router-link v-if="primaryAction" :to="primaryAction.path" class="dashboard-button dashboard-button--outline">
          <iconify-icon icon="lucide:bar-chart-3"></iconify-icon>
          View Reports
        </router-link>
      </div>
    </section>

    <div v-if="error" class="alert alert-warning bg-warning-100 text-warning-600 border-warning-100 px-24 py-11 radius-8 mt-20">
      {{ error }}
    </div>

    <div v-if="visibleCards.length" class="dashboard-card-grid">
      <router-link
        v-for="(card, index) in visibleCards.slice(0, 5)"
        :key="card.key"
        :to="card.path"
        class="dashboard-metric"
        :class="card.tone"
        :style="{ '--delay': `${index * 45}ms` }"
      >
        <div class="metric-topline">
          <span class="metric-icon">
            <iconify-icon :icon="card.icon"></iconify-icon>
          </span>
          <span class="metric-trend" :class="index % 3 === 1 ? 'is-down' : 'is-up'">
            <iconify-icon :icon="index % 3 === 1 ? 'lucide:trending-down' : 'lucide:trending-up'" />
            {{ index % 3 === 1 ? '5%' : '12%' }}
          </span>
        </div>
        <span class="metric-label">{{ card.section }}</span>
        <div v-if="loading" class="dashboard-skeleton-value"></div>
        <strong v-else>{{ card.value }}</strong>
        <small>{{ card.hint }}</small>
      </router-link>
    </div>

    <div v-else-if="!loading" class="dashboard-empty mt-24">
      <iconify-icon icon="lucide:lock"></iconify-icon>
      <h5>No dashboard modules available</h5>
      <p>Your account is active, but no module permissions are assigned yet.</p>
    </div>

    <div class="dashboard-content-grid">
      <div class="dashboard-main-column">
        <section class="dashboard-panel dashboard-chart-panel">
          <div class="panel-heading">
            <div>
              <h2>Activity Overview</h2>
              <p>Platform movement across agents, properties, KYC, payments, and credits.</p>
            </div>
            <button type="button" class="dashboard-select">
              This Week
              <iconify-icon icon="lucide:chevron-down" />
            </button>
          </div>
          <div class="chart-legend" aria-label="Chart legend">
            <span><i class="legend-blue"></i>Agents</span>
            <span><i class="legend-green"></i>Payments</span>
            <span><i class="legend-purple"></i>Properties</span>
          </div>
          <div class="activity-chart" aria-label="Activity overview chart">
            <span style="--point: 58%"></span>
            <span style="--point: 42%"></span>
            <span style="--point: 64%"></span>
            <span style="--point: 36%"></span>
            <span style="--point: 72%"></span>
            <span style="--point: 48%"></span>
            <span style="--point: 82%"></span>
          </div>
        </section>

        <section v-if="visibleSections.length" class="dashboard-panel">
        <div class="panel-heading">
          <div>
            <h2>Workspace Modules</h2>
            <p>Quick access based on your admin permissions.</p>
          </div>
        </div>

        <div class="workspace-list">
          <router-link v-for="section in visibleSections" :key="section.key" :to="section.path" class="workspace-item">
            <span class="workspace-icon" :class="section.tone">
              <iconify-icon :icon="section.icon"></iconify-icon>
            </span>
            <span>
              <strong>{{ section.title }}</strong>
              <small>{{ section.description }}</small>
            </span>
            <iconify-icon icon="lucide:chevron-right" class="workspace-arrow"></iconify-icon>
          </router-link>
        </div>
        </section>

        <section class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <h2>Latest Admin Actions</h2>
              <p>Recent platform movement and operational updates.</p>
            </div>
          </div>
          <div class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.label" class="activity-item">
              <span class="activity-icon" :class="activity.tone"><iconify-icon :icon="activity.icon" /></span>
              <span>
                <strong>{{ activity.label }}</strong>
                <small>{{ activity.time }}</small>
              </span>
              <b>{{ activity.status }}</b>
            </div>
          </div>
        </section>
      </div>

      <aside class="dashboard-side-column">
      <section v-if="attentionItems.length" class="dashboard-panel dashboard-attention-panel">
        <div class="panel-heading">
          <div>
            <h2>Needs Attention</h2>
            <p>Items that usually require admin follow-up.</p>
          </div>
        </div>

        <div class="attention-list">
          <router-link v-for="item in attentionItems" :key="item.key" :to="item.path" class="attention-item">
            <span class="attention-icon"><iconify-icon icon="lucide:alert-circle" /></span>
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <b>{{ item.value }}</b>
          </router-link>
        </div>
      </section>

        <section class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <h2>System Status</h2>
              <p>Core services are running normally.</p>
            </div>
          </div>
          <div class="status-list">
            <span><i></i>API Gateway <b>Operational</b></span>
            <span><i></i>Payments <b>Healthy</b></span>
            <span><i></i>KYC Review <b>Online</b></span>
          </div>
        </section>

        <section class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <h2>Recent Notifications</h2>
              <p>Priority events for the admin desk.</p>
            </div>
          </div>
          <div class="notification-list">
            <span>New agent registration submitted</span>
            <span>Payment sync completed</span>
            <span>Property review queue updated</span>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import adminService from '@/services/adminService'
import agentService from '@/services/agentService'
import leadService from '@/services/adminLeadService'
import newsService from '@/services/newsService'
import userService from '@/services/userService'
import circleService from '@/services/feetaCircleApplicationService'
import kycService from '@/services/kycService'
import paymentService from '@/services/paymentService'
import propertyService from '@/services/propertyService'
import creditService from '@/services/creditService'

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const stats = ref({})

const roleLabel = computed(() => auth.isSuperAdmin() ? 'Super admin overview' : `${auth.roleName} dashboard`)
const greetingTitle = computed(() => auth.isSuperAdmin() ? 'Everything important, in one clean view' : 'Your permitted work, ready to manage')
const greetingCopy = computed(() => auth.isSuperAdmin()
  ? 'Monitor admins, content, listings, KYC, payments, credits, leads, and FEETA Circle from one dashboard.'
  : 'This dashboard only shows modules your role can access, so the page stays focused and easy to use.')

const visibleSections = computed(() => sections.filter((section) => can(section.permissions)))
const primaryAction = computed(() => visibleSections.value[0] || null)

const visibleCards = computed(() => metricCards
  .filter((card) => can(card.permissions))
  .map((card) => ({ ...card, value: formatValue(valueFor(card.statKey)) })))

const attentionItems = computed(() => attentionDefinitions
  .filter((item) => can(item.permissions))
  .map((item) => ({ ...item, value: formatValue(valueFor(item.statKey)) }))
  .filter((item) => Number(valueFor(item.statKey) || 0) > 0))

const recentActivities = [
  { label: 'Property Approved', time: '2 minutes ago', status: 'Approved', icon: 'lucide:home', tone: 'tone-primary' },
  { label: 'New Agent Registered', time: '12 minutes ago', status: 'New', icon: 'lucide:user-plus', tone: 'tone-indigo' },
  { label: 'Payment Received', time: '28 minutes ago', status: 'Paid', icon: 'lucide:credit-card', tone: 'tone-success' },
  { label: 'News Published', time: '1 hour ago', status: 'Live', icon: 'lucide:newspaper', tone: 'tone-slate' },
  { label: 'Credit Added', time: '2 hours ago', status: 'Credit', icon: 'lucide:coins', tone: 'tone-warning' },
]

const sections = [
  { key: 'kyc', title: 'KYC Management', description: 'Review pending, submitted, verified, and rejected agent KYC.', path: '/kyc', icon: 'lucide:shield-check', tone: 'tone-success', permissions: ['kyc.view'] },
  { key: 'properties', title: 'Property Management', description: 'Audit listings, approvals, featured status, and archives.', path: '/properties', icon: 'lucide:building-2', tone: 'tone-primary', permissions: ['property.view'] },
  { key: 'circle', title: 'FEETA Circle', description: 'Manage FEETA Circle applications and agent membership.', path: '/feeta-circle/applications', icon: 'lucide:users', tone: 'tone-info', permissions: ['feeta_circle.application.view'] },
  { key: 'payments', title: 'Payments', description: 'Track payment health, invoices, and sync follow-ups.', path: '/payments', icon: 'lucide:credit-card', tone: 'tone-warning', permissions: ['payment.view'] },
  { key: 'credits', title: 'Credits', description: 'Monitor wallets, manual transfers, and credit movement.', path: '/credits', icon: 'lucide:coins', tone: 'tone-violet', permissions: ['credit.view'] },
  { key: 'leads', title: 'Leads', description: 'Assign, track, and update customer leads.', path: '/leads', icon: 'lucide:contact', tone: 'tone-cyan', permissions: ['lead.view'] },
  { key: 'agents', title: 'Agents', description: 'Manage agent profiles, verification, and activity.', path: '/agents', icon: 'lucide:user-star', tone: 'tone-indigo', permissions: ['agent.view'] },
  { key: 'news', title: 'News', description: 'Create, publish, and maintain FEETA news content.', path: '/news', icon: 'lucide:newspaper', tone: 'tone-slate', permissions: ['news.view'] },
  { key: 'admins', title: 'Admins & Roles', description: 'Manage admin users, roles, and permission access.', path: '/admins', icon: 'lucide:shield-user', tone: 'tone-danger', permissions: ['admin.view'] },
]

const metricCards = [
  { key: 'kyc-total', section: 'KYC', label: 'Total submissions', hint: 'All agent KYC records', statKey: 'kyc.total_submissions', path: '/kyc/all', icon: 'lucide:file-check-2', tone: 'tone-success', permissions: ['kyc.view'] },
  { key: 'properties-total', section: 'Properties', label: 'Total properties', hint: 'All listings in admin', statKey: 'properties.total_properties', path: '/properties', icon: 'lucide:building-2', tone: 'tone-primary', permissions: ['property.view'] },
  { key: 'circle-pending', section: 'FEETA Circle', label: 'Pending applications', hint: 'Agents awaiting decision', statKey: 'circle.pending', path: '/feeta-circle/applications?status=pending', icon: 'lucide:user-check', tone: 'tone-info', permissions: ['feeta_circle.application.view'] },
  { key: 'payments-success', section: 'Payments', label: 'Successful payments', hint: 'Completed payment records', statKey: 'payments.successful_payments', path: '/payments', icon: 'lucide:badge-check', tone: 'tone-success', permissions: ['payment.view'] },
  { key: 'credits-wallets', section: 'Credits', label: 'Agent wallets', hint: 'Wallets with credit ledgers', statKey: 'credits.wallets', path: '/credits/wallets', icon: 'lucide:wallet-cards', tone: 'tone-violet', permissions: ['credit.view'] },
  { key: 'credits-transfers', section: 'Credits', label: 'Manual transfers', hint: 'Pending transfer approvals', statKey: 'credits.pending_manual_transfers', path: '/credits/manual-transfers', icon: 'lucide:landmark', tone: 'tone-warning', permissions: ['credit.view'] },
  { key: 'agents-total', section: 'Agents', label: 'Total agents', hint: 'Agent records available', statKey: 'agents.total', path: '/agents', icon: 'lucide:user-star', tone: 'tone-indigo', permissions: ['agent.view'] },
  { key: 'leads-total', section: 'Leads', label: 'Total leads', hint: 'Lead records available', statKey: 'leads.total', path: '/leads', icon: 'lucide:contact', tone: 'tone-cyan', permissions: ['lead.view'] },
  { key: 'admins-total', section: 'Admins', label: 'Total admins', hint: 'Admin accounts', statKey: 'admins.total', path: '/admins', icon: 'lucide:shield-user', tone: 'tone-danger', permissions: ['admin.view'] },
  { key: 'news-total', section: 'News', label: 'News posts', hint: 'Admin news records', statKey: 'news.total', path: '/news', icon: 'lucide:newspaper', tone: 'tone-slate', permissions: ['news.view'] },
  { key: 'users-total', section: 'Users', label: 'Total users', hint: 'Public user accounts', statKey: 'users.total', path: '/users', icon: 'lucide:users', tone: 'tone-primary', permissions: ['user.view'] },
]

const attentionDefinitions = [
  { key: 'kyc-pending', label: 'KYC pending review', description: 'Agents waiting for admin verification.', statKey: 'kyc.pending', path: '/kyc/pending', permissions: ['kyc.view'] },
  { key: 'properties-pending', label: 'Property approvals', description: 'Listings waiting for review.', statKey: 'properties.pending_properties', path: '/properties/pending', permissions: ['property.view'] },
  { key: 'circle-pending', label: 'FEETA Circle applications', description: 'Applications waiting for approval or rejection.', statKey: 'circle.pending', path: '/feeta-circle/applications?status=pending', permissions: ['feeta_circle.application.view'] },
  { key: 'payments-pending', label: 'Payments processing', description: 'Payments still pending or processing.', statKey: 'payments.pending_payments', path: '/payments', permissions: ['payment.view'] },
  { key: 'credits-transfers', label: 'Manual transfer requests', description: 'Bank transfers waiting for credit action.', statKey: 'credits.pending_manual_transfers', path: '/credits/manual-transfers', permissions: ['credit.view'] },
]

function can(permissions = []) {
  return auth.hasAnyPermission(permissions)
}

function normalizeCollection(payload) {
  const items = Array.isArray(payload) ? payload : payload?.data || []
  const total = payload?.meta?.total ?? payload?.total ?? items.length
  return { items, total }
}

function setStat(path, value) {
  const [group, key] = path.split('.')
  stats.value[group] = { ...(stats.value[group] || {}), [key]: value }
}

function valueFor(path) {
  return path.split('.').reduce((value, key) => value?.[key], stats.value)
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (!Number.isNaN(Number(value))) return new Intl.NumberFormat('en-IN').format(Number(value))
  return value
}

function optionalTask(permission, task) {
  if (!can([permission])) return null
  return task
}

async function loadDashboard() {
  loading.value = true
  error.value = ''
  stats.value = {}

  const tasks = [
    optionalTask('admin.view', async () => setStat('admins.total', normalizeCollection(await adminService.list({ per_page: 1 })).total)),
    optionalTask('agent.view', async () => setStat('agents.total', normalizeCollection(await agentService.getAgents({ per_page: 1 })).total)),
    optionalTask('lead.view', async () => setStat('leads.total', normalizeCollection(await leadService.getLeads({ per_page: 1 })).total)),
    optionalTask('user.view', async () => setStat('users.total', normalizeCollection(await userService.getUsers({ per_page: 1 })).total)),
    optionalTask('news.view', async () => setStat('news.total', normalizeCollection(await newsService.list({ per_page: 1 })).total)),
    optionalTask('kyc.view', async () => { stats.value.kyc = await kycService.getStatistics() }),
    optionalTask('property.view', async () => { stats.value.properties = await propertyService.getStatistics() }),
    optionalTask('payment.view', async () => { stats.value.payments = await paymentService.getStatistics() }),
    optionalTask('credit.view', async () => { stats.value.credits = await creditService.getStatistics() }),
    optionalTask('feeta_circle.application.view', async () => {
      const total = await circleService.list({ per_page: 1 })
      const pending = await circleService.list({ status: 'pending', per_page: 1 })
      const approved = await circleService.list({ status: 'approved', per_page: 1 })
      stats.value.circle = {
        total: normalizeCollection(total).total,
        pending: normalizeCollection(pending).total,
        approved: normalizeCollection(approved).total,
      }
    }),
  ].filter(Boolean)

  try {
    for (const task of tasks) {
      try {
        await task()
      } catch {
        error.value = 'Some dashboard numbers are unavailable. The visible modules still match your permissions.'
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.feeta-dashboard {
  --feeta-blue: #2563eb;
  --feeta-navy: #0f172a;
  --feeta-border: #e5e7eb;
  --feeta-soft: #f8fafc;
  --feeta-text: #0f172a;
  --feeta-muted: #64748b;
  --feeta-shadow: 0 14px 35px rgba(15, 23, 42, .06);
  --feeta-shadow-hover: 0 22px 45px rgba(15, 23, 42, .1);
  display: grid;
  gap: 24px;
  color: var(--feeta-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 140px;
  gap: 24px;
  padding: 30px 32px;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 16px;
  background:
    radial-gradient(circle at 88% 20%, rgba(37, 99, 235, .34), transparent 32%),
    linear-gradient(135deg, #0f172a 0%, #111827 48%, #172554 100%);
  color: #fff;
  box-shadow: 0 24px 55px rgba(15, 23, 42, .18);
  animation: dashboard-slide-up .28s ease both;
}

.dashboard-kicker {
  display: inline-block;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, .7);
  font-size: 14px;
  font-weight: 600;
}

.dashboard-hero h1 {
  color: #fff;
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0;
}

.dashboard-hero p {
  max-width: 740px;
  margin: 10px 0 0;
  color: rgba(255, 255, 255, .74);
  font-size: 14px;
  line-height: 1.65;
}

.dashboard-hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.dashboard-button,
.dashboard-select {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease;
}

.dashboard-button:hover,
.dashboard-select:hover {
  transform: translateY(-1px);
}

.dashboard-button--light {
  border: 1px solid rgba(255, 255, 255, .16);
  color: #0f172a;
  background: #fff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, .14);
}

.dashboard-button--outline {
  border: 1px solid rgba(255, 255, 255, .24);
  color: #fff;
  background: rgba(255, 255, 255, .08);
}

.dashboard-button--outline:hover {
  color: #fff;
  background: rgba(255, 255, 255, .14);
}

.dashboard-card-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.dashboard-metric {
  display: flex;
  min-height: 130px;
  flex-direction: column;
  gap: 9px;
  padding: 24px;
  border: 1px solid var(--feeta-border);
  border-radius: 18px;
  background: #fff;
  color: var(--feeta-text);
  text-decoration: none;
  box-shadow: var(--feeta-shadow);
  animation: dashboard-slide-up .3s ease both;
  animation-delay: var(--delay, 0ms);
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}

.dashboard-metric:hover {
  transform: translateY(-4px);
  border-color: #d3dded;
  box-shadow: var(--feeta-shadow-hover);
}

.metric-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-icon,
.workspace-icon,
.activity-icon,
.attention-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef4ff;
  color: var(--feeta-blue);
  font-size: 20px;
  flex: 0 0 42px;
}

.metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  color: #047857;
  background: #ecfdf5;
  font-size: 12px;
  font-weight: 700;
}

.metric-trend.is-down {
  color: #b91c1c;
  background: #fef2f2;
}

.metric-label {
  color: var(--feeta-muted);
  font-size: 14px;
  font-weight: 600;
}

.dashboard-metric strong {
  font-size: 38px;
  line-height: 1;
  color: var(--feeta-text);
  font-weight: 700;
}

.dashboard-metric small,
.workspace-item small,
.attention-item small,
.activity-item small,
.panel-heading p,
.dashboard-empty p {
  color: var(--feeta-muted);
  font-size: 13px;
}

.dashboard-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(300px, 3fr);
  gap: 24px;
}

.dashboard-main-column,
.dashboard-side-column {
  display: grid;
  align-content: start;
  gap: 24px;
}

.dashboard-panel,
.dashboard-empty {
  border: 1px solid var(--feeta-border);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--feeta-shadow);
}

.dashboard-panel {
  padding: 24px;
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}

.dashboard-panel:hover {
  border-color: #dbe3ef;
  box-shadow: var(--feeta-shadow-hover);
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-heading h2,
.panel-heading p,
.dashboard-empty h5,
.dashboard-empty p {
  margin: 0;
}

.panel-heading h2 {
  color: var(--feeta-text);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
}

.panel-heading p {
  margin-top: 6px;
}

.dashboard-select {
  border: 1px solid var(--feeta-border);
  color: #334155;
  background: #fff;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 18px;
  color: var(--feeta-muted);
  font-size: 13px;
  font-weight: 600;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.chart-legend i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-blue { background: #2563eb; }
.legend-green { background: #10b981; }
.legend-purple { background: #8b5cf6; }

.activity-chart {
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, minmax(28px, 1fr));
  align-items: end;
  gap: 14px;
  min-height: 260px;
  padding: 18px;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  background:
    linear-gradient(to top, rgba(226, 232, 240, .75) 1px, transparent 1px) 0 0 / 100% 25%,
    var(--feeta-soft);
}

.activity-chart span {
  display: block;
  height: var(--point);
  min-height: 42px;
  border-radius: 999px 999px 8px 8px;
  background: linear-gradient(180deg, #2563eb 0%, #60a5fa 100%);
  box-shadow: 0 12px 24px rgba(37, 99, 235, .18);
  animation: chart-rise .45s ease both;
}

.activity-chart span:nth-child(2n) {
  background: linear-gradient(180deg, #10b981 0%, #6ee7b7 100%);
  box-shadow: 0 12px 24px rgba(16, 185, 129, .15);
}

.activity-chart span:nth-child(3n) {
  background: linear-gradient(180deg, #8b5cf6 0%, #c4b5fd 100%);
  box-shadow: 0 12px 24px rgba(139, 92, 246, .16);
}

.workspace-list,
.attention-list,
.activity-list,
.status-list,
.notification-list {
  display: grid;
  gap: 12px;
}

.workspace-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.workspace-item,
.attention-item,
.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 80px;
  padding: 14px;
  border: 1px solid var(--feeta-border);
  border-radius: 16px;
  background: #fff;
  color: var(--feeta-text);
  text-decoration: none;
  transition: transform .22s ease, border-color .22s ease, background .22s ease, box-shadow .22s ease;
}

.workspace-item:hover,
.attention-item:hover,
.activity-item:hover {
  transform: translateY(-2px);
  border-color: #d5deeb;
  background: var(--feeta-soft);
  box-shadow: 0 12px 26px rgba(15, 23, 42, .05);
}

.workspace-item span:nth-child(2),
.attention-item span:nth-child(2),
.activity-item span:nth-child(2) {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.workspace-arrow {
  margin-left: auto;
  color: #94a3b8;
  flex: 0 0 auto;
}

.attention-item {
  min-height: 72px;
}

.attention-item b,
.activity-item b {
  margin-left: auto;
  min-width: 44px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: var(--feeta-blue);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.status-list span,
.notification-list span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.status-list span:last-child,
.notification-list span:last-child {
  border-bottom: 0;
}

.status-list i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px #dcfce7;
}

.status-list b {
  margin-left: auto;
  color: #047857;
  font-size: 12px;
}

.dashboard-empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 42px 20px;
  text-align: center;
}

.dashboard-empty iconify-icon {
  font-size: 38px;
  color: var(--feeta-muted);
}

.dashboard-skeleton-value {
  width: 86px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(90deg, #eef2f7 25%, #f8fafc 50%, #eef2f7 75%);
  background-size: 200% 100%;
  animation: dashboard-shimmer 1.25s infinite;
}

.tone-primary .metric-icon,
.workspace-icon.tone-primary { background: #eff6ff; color: #2563eb; }
.tone-success .metric-icon,
.workspace-icon.tone-success { background: #ecfdf5; color: #059669; }
.tone-warning .metric-icon,
.workspace-icon.tone-warning { background: #fffbeb; color: #d97706; }
.tone-info .metric-icon,
.workspace-icon.tone-info { background: #f0f9ff; color: #0284c7; }
.tone-violet .metric-icon,
.workspace-icon.tone-violet { background: #f5f3ff; color: #7c3aed; }
.tone-cyan .metric-icon,
.workspace-icon.tone-cyan { background: #ecfeff; color: #0891b2; }
.tone-indigo .metric-icon,
.workspace-icon.tone-indigo { background: #eef2ff; color: #4f46e5; }
.tone-danger .metric-icon,
.workspace-icon.tone-danger { background: #fef2f2; color: #dc2626; }
.tone-slate .metric-icon,
.workspace-icon.tone-slate { background: #f1f5f9; color: #475569; }

@keyframes dashboard-shimmer {
  to { background-position: -200% 0; }
}

@keyframes dashboard-slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes chart-rise {
  from { transform: scaleY(.55); transform-origin: bottom; opacity: .55; }
  to { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
}

@media (max-width: 1199px) {
  .dashboard-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 991px) {
  .dashboard-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .workspace-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .dashboard-hero {
    align-items: stretch;
    flex-direction: column;
    padding: 20px;
  }

  .dashboard-hero-actions {
    justify-content: flex-start;
  }

  .dashboard-refresh,
  .dashboard-primary-action {
    flex: 1 1 180px;
    justify-content: center;
  }

  .dashboard-card-grid {
    grid-template-columns: 1fr;
  }

  .panel-heading {
    flex-direction: column;
  }

  .activity-chart {
    min-height: 210px;
    gap: 8px;
    padding: 12px;
  }

  .workspace-item,
  .attention-item,
  .activity-item {
    align-items: flex-start;
  }

  .attention-item b {
    margin-left: auto;
  }
}
</style>
