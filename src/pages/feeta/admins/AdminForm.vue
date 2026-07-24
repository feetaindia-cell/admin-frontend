<template>
  <div class="dashboard-main-body admin-form-page">
    <section class="admin-form-hero" aria-labelledby="admin-form-title">
      <div class="admin-form-hero__title">
        <span class="admin-form-hero__icon" aria-hidden="true">
          <iconify-icon icon="ri:shield-user-line"></iconify-icon>
        </span>
        <div>
          <h1 id="admin-form-title">{{ isEdit ? 'Edit Administrator' : 'Create Administrator' }}</h1>
          <p>{{ isEdit ? 'Update administrator profile, access and account status.' : 'Create new administrators, assign roles and securely manage platform access.' }}</p>
        </div>
      </div>
      <div class="admin-form-hero-art" aria-hidden="true">
        <span class="admin-form-hero-art__halo"></span>
        <div class="admin-form-hero-art__card">
          <span><iconify-icon icon="ri:user-star-line"></iconify-icon></span>
          <strong>Admin</strong>
          <small>Secure access</small>
        </div>
        <div class="admin-form-hero-art__shield">
          <iconify-icon icon="ri:shield-check-line"></iconify-icon>
        </div>
        <i class="admin-form-hero-art__spark admin-form-hero-art__spark--one"></i>
        <i class="admin-form-hero-art__spark admin-form-hero-art__spark--two"></i>
      </div>
</section>

    <div v-if="error" class="admin-form-alert" role="alert">
      <iconify-icon icon="ri:error-warning-line"></iconify-icon>
      {{ error }}
    </div>

    <section class="admin-form-card" aria-label="Administrator form">
      <form @submit.prevent="submit">
        <fieldset :disabled="saving" class="admin-form-fieldset">
          <div class="admin-form-card__header">
            <div>
              <h2>Administrator Details</h2>
              <p>Fill the information below to create a new administrator account.</p>
            </div>
            <span class="admin-form-card__badge" aria-hidden="true">
              <iconify-icon icon="ri:shield-check-line"></iconify-icon>
              Secure setup
            </span>
          </div>
          <div class="admin-form-grid">
            <div :class="fieldGroupClass('name')">
              <label class="admin-field-label" for="admin-name">Full Name <span>*</span></label>
              <div class="admin-field-control">
                <span class="admin-field-icon" aria-hidden="true"><iconify-icon icon="ri:user-3-line"></iconify-icon></span>
                <div class="admin-input-shell">
                  <iconify-icon icon="ri:user-3-line" class="admin-input-icon"></iconify-icon>
                  <input id="admin-name" v-model="form.name" type="text" class="admin-input" placeholder="Enter administrator full name" aria-label="Full name" />
                  <iconify-icon v-if="isFieldValid('name')" icon="ri:check-line" class="admin-valid-icon"></iconify-icon>
                </div>
              </div>
              <p v-if="errors.name" class="admin-field-error">
                <iconify-icon icon="ri:error-warning-line"></iconify-icon>
                {{ errors.name[0] }}
              </p>
            </div>

            <div :class="fieldGroupClass('email')">
              <label class="admin-field-label" for="admin-email">Email <span>*</span></label>
              <div class="admin-field-control">
                <span class="admin-field-icon" aria-hidden="true"><iconify-icon icon="ri:mail-line"></iconify-icon></span>
                <div class="admin-input-shell">
                  <iconify-icon icon="ri:mail-line" class="admin-input-icon"></iconify-icon>
                  <input id="admin-email" v-model="form.email" type="email" class="admin-input" placeholder="Enter administrator email" aria-label="Email address" />
                  <iconify-icon v-if="isFieldValid('email')" icon="ri:check-line" class="admin-valid-icon"></iconify-icon>
                </div>
              </div>
              <p v-if="errors.email" class="admin-field-error">
                <iconify-icon icon="ri:error-warning-line"></iconify-icon>
                {{ errors.email[0] }}
              </p>
            </div>

            <div :class="fieldGroupClass('phone')">
              <label class="admin-field-label" for="admin-phone">Phone</label>
              <div class="admin-field-control">
                <span class="admin-field-icon" aria-hidden="true"><iconify-icon icon="ri:phone-line"></iconify-icon></span>
                <div class="admin-input-shell">
                  <iconify-icon icon="ri:phone-line" class="admin-input-icon"></iconify-icon>
                  <input id="admin-phone" v-model="form.phone" type="text" class="admin-input" placeholder="Enter phone number" aria-label="Phone number" />
                  <iconify-icon v-if="isFieldValid('phone')" icon="ri:check-line" class="admin-valid-icon"></iconify-icon>
                </div>
              </div>
            </div>

            <div :class="fieldGroupClass('password')">
              <label class="admin-field-label" for="admin-password">Password <span v-if="!isEdit">*</span></label>
              <div class="admin-field-control">
                <span class="admin-field-icon" aria-hidden="true"><iconify-icon icon="ri:lock-password-line"></iconify-icon></span>
                <div class="admin-input-shell">
                  <iconify-icon icon="ri:lock-password-line" class="admin-input-icon"></iconify-icon>
                  <input id="admin-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="admin-input admin-input--with-action" placeholder="Enter password" aria-label="Password" />
                  <button type="button" class="admin-password-toggle" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                    <iconify-icon :icon="showPassword ? 'ri:eye-off-line' : 'ri:eye-line'"></iconify-icon>
                  </button>
                </div>
              </div>
              <div v-if="form.password" class="admin-strength" aria-live="polite">
                <div class="admin-strength__track"><span :class="passwordStrength.class" :style="{ width: passwordStrength.width }"></span></div>
                <small>{{ passwordStrength.label }}</small>
              </div>
              <p v-if="errors.password" class="admin-field-error">
                <iconify-icon icon="ri:error-warning-line"></iconify-icon>
                {{ errors.password[0] }}
              </p>
            </div>

            <div class="admin-field-group">
              <label class="admin-field-label" for="admin-password-confirmation">Confirm Password</label>
              <div class="admin-field-control">
                <span class="admin-field-icon" aria-hidden="true"><iconify-icon icon="ri:lock-line"></iconify-icon></span>
                <div class="admin-input-shell">
                  <iconify-icon icon="ri:lock-line" class="admin-input-icon"></iconify-icon>
                  <input id="admin-password-confirmation" v-model="form.password_confirmation" :type="showPasswordConfirmation ? 'text' : 'password'" class="admin-input admin-input--with-action" placeholder="Confirm password" aria-label="Confirm password" />
                  <button type="button" class="admin-password-toggle" :aria-label="showPasswordConfirmation ? 'Hide confirm password' : 'Show confirm password'" @click="showPasswordConfirmation = !showPasswordConfirmation">
                    <iconify-icon :icon="showPasswordConfirmation ? 'ri:eye-off-line' : 'ri:eye-line'"></iconify-icon>
                  </button>
                </div>
              </div>
              <p v-if="form.password_confirmation" :class="['admin-password-match', passwordsMatch ? 'is-match' : 'is-mismatch']" aria-live="polite">
                <iconify-icon :icon="passwordsMatch ? 'ri:check-line' : 'ri:close-line'"></iconify-icon>
                {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
              </p>
            </div>

            <div v-if="auth.hasPermission('admin.role.assign')" class="admin-field-group">
              <label class="admin-field-label" for="admin-role">Role</label>
              <div v-if="selectedRoleName" class="admin-select-preview">
                <span :class="['admin-role-preview', roleBadgeClass(selectedRoleName)]">
                  <iconify-icon :icon="roleIcon(selectedRoleName)"></iconify-icon>
                  {{ selectedRoleName }}
                </span>
              </div>
              <div class="admin-field-control">
                <span class="admin-field-icon" aria-hidden="true"><iconify-icon icon="ri:vip-crown-line"></iconify-icon></span>
                <div class="admin-input-shell admin-select-shell">
                  <iconify-icon icon="ri:shield-keyhole-line" class="admin-input-icon"></iconify-icon>
                  <select id="admin-role" v-model="form.role_id" class="admin-input admin-select" :disabled="isSelf || rolesLoading" required aria-label="Role">
                    <option value="">{{ rolesLoading ? 'Loading roles...' : 'Select role' }}</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div v-if="auth.hasPermission('admin.status')" class="admin-field-group">
              <label class="admin-field-label" for="admin-status">Status</label>
              <div class="admin-status-preview">
                <span :class="['admin-status-preview__dot', `is-${form.status}`]"></span>
                {{ statusLabel(form.status) }}
              </div>
              <div class="admin-field-control">
                <span class="admin-field-icon" aria-hidden="true"><iconify-icon icon="ri:checkbox-circle-line"></iconify-icon></span>
                <div class="admin-input-shell admin-select-shell">
                  <iconify-icon icon="ri:checkbox-circle-line" class="admin-input-icon"></iconify-icon>
                  <select id="admin-status" v-model="form.status" class="admin-input admin-select" :disabled="isSelf" aria-label="Status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="admin-info-box">
            <span aria-hidden="true"><iconify-icon icon="ri:information-line"></iconify-icon></span>
            <div>
              <h2>Administrator Information</h2>
              <p>The administrator will automatically receive login credentials via email after account creation.</p>
              <ul>
                <li><iconify-icon icon="ri:check-line"></iconify-icon> Strong password recommended</li>
                <li><iconify-icon icon="ri:check-line"></iconify-icon> Valid email required</li>
                <li><iconify-icon icon="ri:check-line"></iconify-icon> Role permissions can be edited later</li>
              </ul>
            </div>
          </div>
        </fieldset>

        <div class="admin-form-actions">
          <router-link to="/admins" class="admin-cancel-btn">
            <iconify-icon icon="ri:close-line"></iconify-icon>
            Cancel
          </router-link>
          <button v-if="!isEdit" type="button" class="admin-draft-btn" disabled>
            <iconify-icon icon="ri:draft-line"></iconify-icon>
            Save Draft
          </button>
          <button type="submit" :disabled="saving" class="admin-save-btn">
            <span v-if="saving" class="spinner-border spinner-border-sm"></span>
            <iconify-icon v-else icon="ri:save-line"></iconify-icon>
            {{ saving ? 'Saving...' : 'Save Administrator' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import adminService from '@/services/adminService'
import roleService from '@/services/roleService'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ mode: { type: String, default: 'create' } })
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isEdit = computed(() => props.mode === 'edit')
const isSelf = computed(() => Number(route.params.id) === Number(auth.admin?.id))
const saving = ref(false)
const error = ref('')
const errors = ref({})
const roles = ref([])
const rolesLoading = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const form = reactive({ name: '', email: '', phone: '', password: '', password_confirmation: '', role_id: '', status: 'active' })
const original = reactive({ role_id: '', status: 'active' })

const selectedRoleName = computed(() => roles.value.find((role) => String(role.id) === String(form.role_id))?.name || '')
const passwordsMatch = computed(() => Boolean(form.password_confirmation) && form.password === form.password_confirmation)
const passwordStrength = computed(() => {
  const value = form.password || ''
  let score = 0
  if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  if (score <= 1) return { label: 'Weak', width: '33%', class: 'is-weak' }
  if (score <= 3) return { label: 'Medium', width: '66%', class: 'is-medium' }
  return { label: 'Strong', width: '100%', class: 'is-strong' }
})

function isFieldValid(field) {
  return Boolean(form[field]) && !errors.value[field]
}

function fieldGroupClass(field) {
  return ['admin-field-group', errors.value[field] ? 'has-error' : '', isFieldValid(field) ? 'is-valid' : '']
}

function roleBadgeClass(roleName) {
  const role = String(roleName).toLowerCase()
  if (role.includes('super')) return 'is-super'
  if (role.includes('system')) return 'is-system'
  if (role.includes('property')) return 'is-property'
  if (role.includes('faq')) return 'is-faq'
  return 'is-default'
}

function roleIcon(roleName) {
  const role = String(roleName).toLowerCase()
  if (role.includes('super')) return 'ri:vip-crown-line'
  if (role.includes('system')) return 'ri:settings-3-line'
  if (role.includes('property')) return 'ri:building-4-line'
  if (role.includes('faq')) return 'ri:questionnaire-line'
  return 'ri:shield-keyhole-line'
}

function statusLabel(status) {
  if (status === 'active') return 'Active'
  if (status === 'suspended') return 'Suspended'
  return 'Inactive'
}

async function loadAdmin() {
  if (!isEdit.value) return
  const admin = await adminService.get(route.params.id)
  Object.assign(form, {
    name: admin.name || '',
    email: admin.email || '',
    phone: admin.phone || '',
    role_id: admin.role_id || admin.role?.id || '',
    status: admin.status || 'active',
  })
  original.role_id = form.role_id
  original.status = form.status
}

async function loadRoles() {
  if (!auth.hasPermission('admin.role.assign')) return
  rolesLoading.value = true
  try {
    const payload = await roleService.list()
    const items = Array.isArray(payload) ? payload : payload?.data || []
    roles.value = items.filter((role) => Number(role.status) === 1 || String(role.status).toLowerCase() === 'active')
  } catch {
    roles.value = []
  } finally {
    rolesLoading.value = false
  }
}

async function submit() {
  saving.value = true
  error.value = ''
  errors.value = {}
  try {
    const payload = { ...form }
    let roleChanged = false
    if (isEdit.value && !payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }
    if (isEdit.value) {
      const nextRoleId = payload.role_id
      const nextStatus = payload.status
      delete payload.role_id
      delete payload.status
      await adminService.update(route.params.id, payload)
      if (auth.hasPermission('admin.role.assign') && !isSelf.value && String(nextRoleId || '') !== String(original.role_id || '')) {
        await adminService.assignRole(route.params.id, Number(nextRoleId))
        roleChanged = true
      }
      if (auth.hasPermission('admin.status') && !isSelf.value && nextStatus !== original.status) {
        if (nextStatus !== 'active') {
          const confirm = await Swal.fire({
            title: 'Deactivate admin?',
            text: 'Deactivation may revoke this admin\'s active sessions and API tokens.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Deactivate',
          })
          if (!confirm.isConfirmed) return
        }
        await adminService.updateStatus(route.params.id, nextStatus)
      }
    } else {
      if (!auth.hasPermission('admin.role.assign')) delete payload.role_id
      if (!auth.hasPermission('admin.status')) delete payload.status
      await adminService.create(payload)
    }
    await Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: isEdit.value ? 'Admin updated' : 'Admin created',
      text: roleChanged ? 'The new role was assigned successfully.' : undefined,
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: { popup: 'admin-success-toast' },
    })
    router.push('/admins')
  } catch (err) {
    errors.value = err.errors || {}
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadRoles()
  loadAdmin()
})
</script>

<style scoped>
.admin-form-page {
  --admin-primary: #2563EB;
  --admin-secondary: #4F46E5;
  --admin-purple: #7C3AED;
  --admin-green: #22C55E;
  --admin-orange: #F59E0B;
  --admin-red: #EF4444;
  --admin-gray: #64748B;
  --admin-text: #0F172A;
  --admin-muted: #64748B;
  --admin-border: rgba(148, 163, 184, .24);
  --admin-card: rgba(255, 255, 255, .82);
  --admin-shadow: 0 20px 60px rgba(15, 23, 42, .08);
  position: relative;
  isolation: isolate;
  min-height: calc(100vh - 72px);
  padding-bottom: 112px;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 12%, rgba(37, 99, 235, .16), transparent 28%),
    radial-gradient(circle at 86% 4%, rgba(124, 58, 237, .14), transparent 30%),
    linear-gradient(180deg, #F8FAFF, #F4F7FC);
  color: var(--admin-text);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.admin-form-page::before,
.admin-form-page::after {
  content: '';
  position: absolute;
  z-index: -1;
  border-radius: 999px;
  filter: blur(4px);
  opacity: .7;
  pointer-events: none;
}

.admin-form-page::before {
  width: 340px;
  height: 340px;
  top: 74px;
  right: -118px;
  background: radial-gradient(circle, rgba(37, 99, 235, .18), rgba(79, 70, 229, .05) 58%, transparent 70%);
}

.admin-form-page::after {
  width: 280px;
  height: 280px;
  left: -96px;
  bottom: 86px;
  background: radial-gradient(circle, rgba(124, 58, 237, .13), rgba(37, 99, 235, .04) 62%, transparent 72%);
}

.admin-form-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 390px);
  align-items: center;
  gap: 34px;
  margin-bottom: 28px;
  padding: 34px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .72);
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(255, 255, 255, .9), rgba(239, 246, 255, .66));
  box-shadow: var(--admin-shadow);
  backdrop-filter: blur(18px);
  animation: admin-form-in .45s cubic-bezier(.2, .8, .2, 1) both;
}

.admin-form-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: .42;
  pointer-events: none;
  background-image: radial-gradient(rgba(15, 23, 42, .10) .7px, transparent .7px);
  background-size: 18px 18px;
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 78%, transparent);
}

.admin-form-hero__title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 18px;
}

.admin-form-hero__icon {
  width: 76px;
  height: 76px;
  flex: 0 0 76px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .72);
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, var(--admin-primary), var(--admin-secondary) 56%, var(--admin-purple));
  box-shadow: 0 20px 44px rgba(37, 99, 235, .25);
}

.admin-form-hero__icon iconify-icon { font-size: 34px; }

.admin-form-hero h1 {
  margin: 0;
  color: var(--admin-text);
  font-size: clamp(30px, 4vw, 38px);
  line-height: 1.08;
  font-weight: 850;
  letter-spacing: 0;
}

.admin-form-hero p {
  max-width: 620px;
  margin: 11px 0 0;
  color: var(--admin-muted);
  font-size: 17px;
  line-height: 1.58;
}

.admin-form-hero-art {
  position: relative;
  z-index: 1;
  min-height: 210px;
  display: grid;
  place-items: center;
}

.admin-form-hero-art__halo {
  position: absolute;
  width: 230px;
  height: 230px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, .18), rgba(124, 58, 237, .08) 55%, transparent 70%);
  filter: blur(2px);
}

.admin-form-hero-art__card {
  position: relative;
  width: 190px;
  min-height: 132px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, .8);
  border-radius: 24px;
  background: rgba(255, 255, 255, .72);
  box-shadow: 0 24px 70px rgba(37, 99, 235, .15);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  transform: rotate(-3deg);
}

.admin-form-hero-art__card span {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  color: #fff;
  background: linear-gradient(135deg, var(--admin-primary), var(--admin-purple));
  box-shadow: 0 14px 30px rgba(79, 70, 229, .22);
}

.admin-form-hero-art__card iconify-icon { font-size: 23px; }
.admin-form-hero-art__card strong { color: #172554; font-size: 20px; font-weight: 850; }
.admin-form-hero-art__card small { color: var(--admin-muted); font-size: 13px; font-weight: 700; }

.admin-form-hero-art__shield {
  position: absolute;
  right: 48px;
  bottom: 30px;
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(34, 197, 94, .22);
  border-radius: 24px;
  color: #16A34A;
  background: rgba(240, 253, 244, .9);
  box-shadow: 0 20px 45px rgba(34, 197, 94, .14);
  animation: admin-float 4.8s ease-in-out infinite;
}

.admin-form-hero-art__shield iconify-icon { font-size: 34px; }

.admin-form-hero-art__spark {
  position: absolute;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(96, 165, 250, .72), rgba(124, 58, 237, .62));
  box-shadow: 0 16px 36px rgba(79, 70, 229, .16);
}

.admin-form-hero-art__spark--one { top: 24px; right: 88px; transform: rotate(14deg); }
.admin-form-hero-art__spark--two { left: 54px; bottom: 44px; width: 24px; height: 24px; border-radius: 9px; transform: rotate(-18deg); }
.admin-form-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 15px 17px;
  border: 1px solid #FECACA;
  border-radius: 18px;
  color: #B91C1C;
  background: rgba(255, 241, 242, .86);
  box-shadow: 0 18px 42px rgba(239, 68, 68, .08);
  font-size: 14px;
  font-weight: 700;
}

.admin-form-card {
  position: relative;
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, .72);
  border-radius: 28px;
  background: var(--admin-card);
  box-shadow: var(--admin-shadow);
  backdrop-filter: blur(20px);
  animation: admin-form-in .5s .05s cubic-bezier(.2, .8, .2, 1) both;
  transition: box-shadow .3s ease, transform .3s ease;
}

.admin-form-card:hover { box-shadow: 0 30px 80px rgba(37, 99, 235, .14); }

.admin-form-fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
.admin-form-fieldset:disabled { opacity: .78; }

.admin-form-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 30px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(148, 163, 184, .18);
}

.admin-form-card__header h2 {
  margin: 0;
  color: var(--admin-text);
  font-size: 24px;
  line-height: 1.2;
  font-weight: 850;
}

.admin-form-card__header p {
  margin: 8px 0 0;
  color: var(--admin-muted);
  font-size: 15px;
  line-height: 1.55;
}

.admin-form-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 13px;
  border-radius: 999px;
  color: #166534;
  background: rgba(220, 252, 231, .9);
  border: 1px solid rgba(34, 197, 94, .18);
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.admin-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px 32px;
}

.admin-field-group { min-width: 0; }

.admin-field-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  color: #334155;
  font-size: 15px;
  font-weight: 800;
}

.admin-field-label span { color: var(--admin-red); }
.admin-field-control { display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 12px; align-items: center; }

.admin-field-icon {
  width: 54px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .82);
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(135deg, var(--admin-primary), var(--admin-secondary) 58%, var(--admin-purple));
  box-shadow: 0 14px 30px rgba(37, 99, 235, .18);
}

.admin-field-icon iconify-icon { font-size: 22px; }
.admin-input-shell { position: relative; display: flex; align-items: center; min-width: 0; }
.admin-input-icon { position: absolute; left: 18px; z-index: 1; color: #94A3B8; font-size: 19px; pointer-events: none; }

.admin-input {
  width: 100%;
  min-height: 58px;
  padding: 0 48px 0 52px;
  border: 1px solid #E8EDF7;
  border-radius: 18px;
  color: #111827;
  background: #FFFFFF;
  font-size: 15px;
  font-weight: 650;
  transition: border-color .3s ease, box-shadow .3s ease, background-color .3s ease, transform .3s ease;
}

.admin-input::placeholder { color: #A8B3C4; font-weight: 550; }
.admin-input:hover { border-color: #D8E2F0; transform: translateY(-1px); }
.admin-input:focus { border-color: var(--admin-primary); box-shadow: 0 0 0 4px rgba(37, 99, 235, .12); outline: 0; }
.admin-input:disabled { cursor: not-allowed; background: #F8FAFC; color: #94A3B8; }
.admin-input--with-action { padding-right: 58px; }

.admin-password-toggle {
  position: absolute;
  right: 7px;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 15px;
  color: #64748B;
  background: transparent;
  transition: color .3s ease, background-color .3s ease, transform .3s ease;
}

.admin-password-toggle:hover { color: var(--admin-primary); background: #EFF6FF; transform: scale(1.04); }
.admin-password-toggle iconify-icon { font-size: 20px; }

.admin-valid-icon { position: absolute; right: 18px; color: var(--admin-green); font-size: 19px; pointer-events: none; }
.admin-field-group.is-valid .admin-input { border-color: rgba(34, 197, 94, .42); }
.admin-field-group.has-error .admin-input { border-color: rgba(239, 68, 68, .72); box-shadow: 0 0 0 4px rgba(239, 68, 68, .08); }

.admin-field-error,
.admin-password-match { display: flex; align-items: center; gap: 6px; margin: 9px 0 0 66px; font-size: 13px; font-weight: 750; }
.admin-field-error { color: #DC2626; }
.admin-password-match.is-match { color: #16A34A; }
.admin-password-match.is-mismatch { color: #DC2626; }

.admin-strength { display: flex; align-items: center; gap: 12px; margin: 11px 0 0 66px; }
.admin-strength__track { height: 8px; flex: 1; overflow: hidden; border-radius: 999px; background: #EAF0F8; }
.admin-strength__track span { display: block; height: 100%; border-radius: inherit; transition: width .3s ease, background-color .3s ease; }
.admin-strength__track .is-weak { background: var(--admin-red); }
.admin-strength__track .is-medium { background: var(--admin-orange); }
.admin-strength__track .is-strong { background: var(--admin-green); }
.admin-strength small { min-width: 58px; color: #475569; font-size: 13px; font-weight: 800; }

.admin-select { appearance: none; cursor: pointer; }
.admin-select-shell { border-radius: 20px; background: linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, rgba(37, 99, 235, .42), rgba(124, 58, 237, .28)) border-box; }
.admin-select-shell .admin-input { background: transparent; }
.admin-select-shell::after { content: ''; position: absolute; right: 20px; width: 10px; height: 10px; border-right: 2px solid #94A3B8; border-bottom: 2px solid #94A3B8; transform: rotate(45deg) translateY(-3px); pointer-events: none; transition: transform .3s ease, border-color .3s ease; }
.admin-select-shell:focus-within::after { border-color: var(--admin-primary); transform: rotate(45deg) translate(1px, -1px); }

.admin-select-preview,
.admin-status-preview { margin: 0 0 10px 66px; }

.admin-role-preview,
.admin-status-preview {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 850;
  animation: admin-dropdown-in .24s ease both;
}

.admin-role-preview.is-super { color: #92400E; background: #FFF7ED; border-color: #FED7AA; }
.admin-role-preview.is-system { color: #1D4ED8; background: #EFF6FF; border-color: #BFDBFE; }
.admin-role-preview.is-property { color: #4338CA; background: #EEF2FF; border-color: #C7D2FE; }
.admin-role-preview.is-faq { color: #7E22CE; background: #FAF5FF; border-color: #E9D5FF; }
.admin-role-preview.is-default { color: #475569; background: #F8FAFC; border-color: #E2E8F0; }

.admin-status-preview { color: #166534; background: #F0FDF4; border-color: #BBF7D0; }
.admin-status-preview__dot { width: 9px; height: 9px; border-radius: 50%; background: #94A3B8; box-shadow: 0 0 0 4px rgba(148, 163, 184, .12); }
.admin-status-preview__dot.is-active { background: var(--admin-green); box-shadow: 0 0 0 4px rgba(34, 197, 94, .14); }
.admin-status-preview__dot.is-inactive { background: #94A3B8; }
.admin-status-preview__dot.is-suspended { background: var(--admin-red); box-shadow: 0 0 0 4px rgba(239, 68, 68, .14); }

.admin-info-box {
  position: relative;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 16px;
  margin-top: 34px;
  padding: 22px;
  overflow: hidden;
  border: 1px solid rgba(147, 197, 253, .32);
  border-radius: 24px;
  color: #1D4ED8;
  background: linear-gradient(135deg, rgba(239, 246, 255, .92), rgba(238, 242, 255, .78));
  box-shadow: 0 20px 52px rgba(37, 99, 235, .10);
}

.admin-info-box::after { content: ''; position: absolute; right: -34px; top: -44px; width: 150px; height: 150px; border-radius: 50%; background: rgba(96, 165, 250, .22); filter: blur(2px); }
.admin-info-box > span { width: 54px; height: 54px; display: inline-flex; align-items: center; justify-content: center; border-radius: 18px; color: #fff; background: linear-gradient(135deg, var(--admin-primary), var(--admin-secondary)); box-shadow: 0 16px 34px rgba(37, 99, 235, .22); font-size: 25px; }
.admin-info-box h2 { margin: 0 0 6px; color: #172554; font-size: 18px; font-weight: 850; }
.admin-info-box p { margin: 0; color: #315DBA; font-size: 15px; line-height: 1.58; font-weight: 650; }
.admin-info-box ul { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0 0; padding: 0; list-style: none; }
.admin-info-box li { display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px; border: 1px solid rgba(37, 99, 235, .12); border-radius: 999px; color: #334155; background: rgba(255, 255, 255, .72); font-size: 13px; font-weight: 750; }
.admin-info-box li iconify-icon { color: var(--admin-green); }

.admin-form-actions {
  position: sticky;
  bottom: 18px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 34px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, .72);
  border-radius: 22px;
  background: rgba(255, 255, 255, .78);
  box-shadow: 0 20px 60px rgba(15, 23, 42, .10);
  backdrop-filter: blur(18px);
}

.admin-cancel-btn,
.admin-draft-btn,
.admin-save-btn {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 22px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 850;
  transition: transform .3s ease, box-shadow .3s ease, background-color .3s ease, color .3s ease, border-color .3s ease;
}

.admin-cancel-btn { border: 1px solid #E2E8F0; color: #334155; background: #fff; }
.admin-cancel-btn:hover { color: #B91C1C; border-color: #FECACA; background: #FFF1F2; transform: translateY(-2px); }
.admin-draft-btn { border: 1px solid #E2E8F0; color: #64748B; background: #F8FAFC; cursor: not-allowed; }
.admin-save-btn { position: relative; overflow: hidden; border: 0; color: #fff; background: linear-gradient(135deg, var(--admin-primary), var(--admin-secondary) 58%, var(--admin-purple)); box-shadow: 0 18px 38px rgba(37, 99, 235, .28); }
.admin-save-btn::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(255, 255, 255, .32), transparent 48%); opacity: 0; transform: scale(.7); transition: opacity .3s ease, transform .3s ease; }
.admin-save-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 22px 48px rgba(37, 99, 235, .34); }
.admin-save-btn:hover:not(:disabled)::after { opacity: 1; transform: scale(1.6); }
.admin-save-btn:disabled { cursor: not-allowed; opacity: .72; }
.admin-save-btn > * { position: relative; z-index: 1; }

:global(.admin-success-toast) { border: 1px solid #BBF7D0 !important; border-radius: 16px !important; box-shadow: 0 18px 44px rgba(15, 23, 42, .16) !important; }

@keyframes admin-form-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes admin-dropdown-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes admin-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

@media (max-width: 1180px) {
  .admin-form-hero { grid-template-columns: 1fr; }
  .admin-form-hero-art { min-height: 170px; }
}

@media (max-width: 991px) {
  .admin-form-page { padding-bottom: 132px; }
  .admin-form-card { padding: 26px; }
  .admin-form-grid { grid-template-columns: 1fr; }
}

@media (max-width: 575px) {
  .admin-form-hero { padding: 24px 18px; border-radius: 24px; }
  .admin-form-hero__title { align-items: flex-start; }
  .admin-form-hero__icon { width: 58px; height: 58px; flex-basis: 58px; }
  .admin-form-hero-art { display: none; }
  .admin-form-card { padding: 20px; border-radius: 24px; }
  .admin-form-card__header { flex-direction: column; }
  .admin-field-control { grid-template-columns: 46px minmax(0, 1fr); gap: 10px; }
  .admin-field-icon { width: 46px; height: 46px; border-radius: 16px; }
  .admin-input { min-height: 54px; border-radius: 16px; }
  .admin-field-error,
  .admin-password-match,
  .admin-strength,
  .admin-select-preview,
  .admin-status-preview { margin-left: 56px; }
  .admin-info-box { grid-template-columns: 1fr; }
  .admin-form-actions { align-items: stretch; flex-direction: column-reverse; bottom: 10px; }
  .admin-cancel-btn,
  .admin-draft-btn,
  .admin-save-btn { width: 100%; }
}
</style>
