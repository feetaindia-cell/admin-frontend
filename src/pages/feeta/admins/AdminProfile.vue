<template>
  <div class="dashboard-main-body profile-page">
    <section class="profile-head">
      <div class="profile-avatar">{{ initials }}</div>
      <div class="profile-title">
        <span>My Profile</span>
        <h1>{{ auth.admin?.name || 'FEETA Admin' }}</h1>
        <p>{{ auth.admin?.email || 'Update your admin account details' }}</p>
      </div>
      <span class="profile-role">{{ auth.roleName }}</span>
    </section>

    <div v-if="error" class="profile-alert">
      <iconify-icon icon="lucide:circle-alert" />
      {{ error }}
    </div>

    <section class="profile-panel">
      <div class="profile-panel-head">
        <div>
          <h2>Profile Details</h2>
          <p>Country is fixed to India. State and city are loaded from location management.</p>
        </div>
        <button type="button" class="refresh-button" :disabled="loadingOptions || saving" @click="reload">
          <iconify-icon icon="lucide:refresh-cw" />
          Refresh
        </button>
      </div>

      <form @submit.prevent="submit">
        <fieldset :disabled="saving" class="profile-fieldset">
          <div class="profile-grid">
            <label class="profile-field">
              <span>Full name</span>
              <input v-model.trim="form.name" type="text" placeholder="Full name" />
              <small v-if="errors.name">{{ errors.name[0] }}</small>
            </label>

            <label class="profile-field">
              <span>Email</span>
              <input v-model.trim="form.email" type="email" placeholder="Email address" />
              <small v-if="errors.email">{{ errors.email[0] }}</small>
            </label>

            <label class="profile-field">
              <span>Phone</span>
              <input v-model.trim="form.phone" type="text" placeholder="Phone number" />
              <small v-if="errors.phone">{{ errors.phone[0] }}</small>
            </label>

            <label class="profile-field">
              <span>Country</span>
              <input v-model="form.country" type="text" disabled />
            </label>

            <label class="profile-field">
              <span>State</span>
              <select v-model="form.state_id" @change="handleStateChange">
                <option value="">{{ loadingOptions ? 'Loading states...' : 'Select state' }}</option>
                <option v-for="state in states" :key="state.id" :value="state.id">{{ state.name }}</option>
              </select>
              <small v-if="errors.state_id">{{ errors.state_id[0] }}</small>
            </label>

            <label class="profile-field">
              <span>City</span>
              <select v-model="form.city_id" :disabled="!form.state_id || loadingCities">
                <option value="">{{ loadingCities ? 'Loading cities...' : 'Select city' }}</option>
                <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
              </select>
              <small v-if="errors.city_id">{{ errors.city_id[0] }}</small>
            </label>

            <label class="profile-field">
              <span>New password</span>
              <input v-model="form.password" type="password" placeholder="Leave blank to keep current password" autocomplete="new-password" />
              <small v-if="errors.password">{{ errors.password[0] }}</small>
            </label>

            <label class="profile-field">
              <span>Confirm password</span>
              <input v-model="form.password_confirmation" type="password" placeholder="Confirm new password" autocomplete="new-password" />
            </label>
          </div>
        </fieldset>

        <div class="profile-actions">
          <button type="button" class="secondary-button" :disabled="saving" @click="resetForm">
            <iconify-icon icon="lucide:rotate-ccw" />
            Reset
          </button>
          <button type="submit" class="primary-button" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm"></span>
            <iconify-icon v-else icon="lucide:save" />
            {{ saving ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { computed, onMounted, reactive, ref } from 'vue'
import authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const saving = ref(false)
const loadingOptions = ref(false)
const loadingCities = ref(false)
const error = ref('')
const errors = ref({})
const states = ref([])
const cities = ref([])
const form = reactive({
  name: '',
  email: '',
  phone: '',
  country: 'India',
  state_id: '',
  city_id: '',
  password: '',
  password_confirmation: '',
})

const initials = computed(() => {
  return (auth.admin?.name || 'FEETA Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'FA'
})

function fillForm(admin = auth.admin) {
  Object.assign(form, {
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || '',
    country: 'India',
    state_id: admin?.state_id ? String(admin.state_id) : '',
    city_id: admin?.city_id ? String(admin.city_id) : '',
    password: '',
    password_confirmation: '',
  })
}

function collection(value) {
  return Array.isArray(value) ? value : value?.data || []
}

async function loadOptions(stateId = form.state_id) {
  loadingOptions.value = true
  try {
    const payload = await authService.profileLocationOptions(stateId || null)
    states.value = collection(payload?.states)
    cities.value = collection(payload?.cities)
  } finally {
    loadingOptions.value = false
  }
}

async function loadCities() {
  if (!form.state_id) {
    cities.value = []
    return
  }
  loadingCities.value = true
  try {
    const payload = await authService.profileLocationOptions(form.state_id)
    cities.value = collection(payload?.cities)
  } finally {
    loadingCities.value = false
  }
}

async function handleStateChange() {
  form.city_id = ''
  await loadCities()
}

async function reload() {
  error.value = ''
  errors.value = {}
  await auth.loadProfile()
  fillForm()
  await loadOptions()
}

function resetForm() {
  error.value = ''
  errors.value = {}
  fillForm()
}

function payload() {
  const data = {
    name: form.name,
    email: form.email,
    phone: form.phone,
    country: 'India',
    state_id: form.state_id || null,
    city_id: form.city_id || null,
  }

  if (form.password) {
    data.password = form.password
    data.password_confirmation = form.password_confirmation
  }

  return data
}

async function submit() {
  saving.value = true
  error.value = ''
  errors.value = {}
  try {
    await auth.updateProfile(payload())
    fillForm()
    await Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Profile updated',
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    })
  } catch (err) {
    errors.value = err.errors || {}
    error.value = err.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  fillForm()
  await loadOptions()
})
</script>

<style scoped>
.profile-page { display: grid; gap: 22px; color: #0f172a; font-family: Inter, sans-serif; }
.profile-head { display: flex; align-items: center; gap: 18px; padding: 24px; border: 1px solid #e5eaf2; border-radius: 8px; background: #fff; }
.profile-avatar { width: 64px; height: 64px; display: grid; place-items: center; flex: 0 0 64px; border-radius: 50%; color: #fff; background: #2563eb; font-size: 20px; font-weight: 800; }
.profile-title { min-width: 0; flex: 1; }
.profile-title span { color: #2563eb; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.profile-title h1 { margin: 4px 0; color: #0f172a; font-size: 28px; font-weight: 800; }
.profile-title p { margin: 0; color: #64748b; font-size: 14px; word-break: break-word; }
.profile-role { padding: 8px 12px; border: 1px solid #dbeafe; border-radius: 8px; color: #1d4ed8; background: #eff6ff; font-size: 13px; font-weight: 700; }
.profile-alert { display: flex; align-items: center; gap: 9px; padding: 14px 16px; border: 1px solid #fecaca; border-radius: 8px; color: #b91c1c; background: #fff1f2; font-weight: 700; }
.profile-panel { padding: 24px; border: 1px solid #e5eaf2; border-radius: 8px; background: #fff; }
.profile-panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid #edf1f6; }
.profile-panel-head h2 { margin: 0; color: #0f172a; font-size: 20px; font-weight: 800; }
.profile-panel-head p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
.profile-fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
.profile-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.profile-field { display: grid; gap: 8px; min-width: 0; }
.profile-field span { color: #334155; font-size: 13px; font-weight: 800; }
.profile-field input, .profile-field select { width: 100%; min-height: 44px; padding: 0 12px; border: 1px solid #d9e2ef; border-radius: 8px; color: #111827; background: #fff; font-size: 14px; outline: 0; }
.profile-field input:focus, .profile-field select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, .12); }
.profile-field input:disabled, .profile-field select:disabled { color: #64748b; background: #f8fafc; }
.profile-field small { color: #dc2626; font-size: 12px; font-weight: 700; }
.profile-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.primary-button, .secondary-button, .refresh-button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 15px; border-radius: 8px; font-size: 13px; font-weight: 800; }
.primary-button { border: 0; color: #fff; background: #2563eb; }
.secondary-button, .refresh-button { border: 1px solid #d9e2ef; color: #334155; background: #fff; }
.primary-button:disabled, .secondary-button:disabled, .refresh-button:disabled { cursor: not-allowed; opacity: .65; }
@media (max-width: 767px) {
  .profile-head, .profile-panel-head, .profile-actions { align-items: stretch; flex-direction: column; }
  .profile-grid { grid-template-columns: 1fr; }
  .profile-role, .primary-button, .secondary-button, .refresh-button { width: 100%; }
}
</style>
