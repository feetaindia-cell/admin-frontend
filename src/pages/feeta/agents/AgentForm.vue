<template>
  <div class="dashboard-main-body"><div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-24 py-11 radius-8">{{ error }}</div>
    <LoadingState v-if="loading" message="Loading agent..." />

    <div v-else class="card h-100 p-0 radius-12">
      <div class="card-body p-24">
        <div class="row justify-content-center">
          <div class="col-xxl-8 col-xl-9 col-lg-10">
            <div class="card border">
              <div class="card-body">
                <form @submit.prevent="submit">
                  <div class="row">
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">First Name</label>
                      <input v-model="form.firstName" type="text" class="form-control radius-8" placeholder="Enter first name" />
                      <div v-if="errors.firstName" class="text-danger-600 text-sm mt-1">{{ errors.firstName[0] }}</div>
                    </div>
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Last Name</label>
                      <input v-model="form.lastName" type="text" class="form-control radius-8" placeholder="Enter last name" />
                      <div v-if="errors.lastName" class="text-danger-600 text-sm mt-1">{{ errors.lastName[0] }}</div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Email</label>
                      <input v-model="form.email" type="email" class="form-control radius-8" placeholder="Enter email address" />
                      <div v-if="errors.email" class="text-danger-600 text-sm mt-1">{{ errors.email[0] }}</div>
                    </div>
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Phone</label>
                      <input v-model="form.phone" type="text" class="form-control radius-8" placeholder="Enter phone number" />
                      <div v-if="errors.phone" class="text-danger-600 text-sm mt-1">{{ errors.phone[0] }}</div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">City</label>
                      <input v-model="form.city" type="text" class="form-control radius-8" placeholder="Enter city" />
                    </div>
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Pincode</label>
                      <input v-model="form.pincode" type="text" class="form-control radius-8" placeholder="Enter pincode" />
                    </div>
                  </div>

                  <div class="mb-20">
                    <label class="form-label fw-semibold text-primary-light text-sm mb-8">Address</label>
                    <input v-model="form.address" type="text" class="form-control radius-8" placeholder="Enter address" />
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Agency Name</label>
                      <input v-model="form.agency_name" type="text" class="form-control radius-8" placeholder="Enter agency name" />
                    </div>
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Designation</label>
                      <input v-model="form.designation" type="text" class="form-control radius-8" placeholder="Enter designation" />
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Experience</label>
                      <input v-model="form.experience" type="text" class="form-control radius-8" placeholder="Enter experience" />
                    </div>
                    <div class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">WhatsApp</label>
                      <input v-model="form.whatsapp" type="text" class="form-control radius-8" placeholder="Enter WhatsApp number" />
                    </div>
                  </div>

                  <div class="mb-20">
                    <label class="form-label fw-semibold text-primary-light text-sm mb-8">About</label>
                    <textarea v-model="form.about_me" class="form-control radius-8" rows="4" placeholder="About agent"></textarea>
                  </div>

                  <div v-if="auth.hasPermission('agent.status') || auth.hasPermission('agent.verify')" class="row">
                    <div v-if="auth.hasPermission('agent.status')" class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Status</label>
                      <select v-model="statusDraft" class="form-control radius-8 form-select">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div v-if="auth.hasPermission('agent.verify')" class="col-md-6 mb-20">
                      <label class="form-label fw-semibold text-primary-light text-sm mb-8">Verification Status</label>
                      <select v-model="verificationDraft" class="form-control radius-8 form-select">
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div class="d-flex align-items-center justify-content-center gap-3">
                    <router-link :to="`/agents/${route.params.id}`" class="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"><iconify-icon icon="ri:close-line" class="me-6" />Cancel</router-link>
                    <button type="submit" :disabled="saving" class="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8">
                      <iconify-icon icon="ri:save-line" class="me-6" />{{ saving ? 'Saving...' : 'Save' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'import LoadingState from '@/components/common/LoadingState.vue'
import agentService from '@/services/agentService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const errors = ref({})
const currentStatus = ref('active')
const currentVerification = ref('pending')
const statusDraft = ref('active')
const verificationDraft = ref('pending')
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  pincode: '',
  address: '',
  agency_name: '',
  designation: '',
  experience: '',
  whatsapp: '',
  about_me: '',
  profile_pic: '',
  operations: '',
  rera_id: '',
  specialties: '',
  accreditation: '',
})

function mapAgentToForm(agent) {
  form.firstName = agent.first_name || agent.firstName || ''
  form.lastName = agent.last_name || agent.lastName || ''
  form.email = agent.email || ''
  form.phone = agent.phone || ''
  form.city = agent.profile?.city || agent.city || ''
  form.pincode = agent.profile?.pincode || agent.pincode || ''
  form.address = agent.profile?.address || agent.address || ''
  form.agency_name = agent.profile?.agency_name || agent.agency_name || ''
  form.designation = agent.profile?.designation || agent.designation || ''
  form.experience = agent.profile?.experience || agent.experience || ''
  form.whatsapp = agent.profile?.whatsapp || agent.whatsapp || ''
  form.about_me = agent.profile?.about_me || agent.about_me || ''
  form.profile_pic = agent.profile?.profile_pic || agent.profile_pic || ''
  form.operations = agent.profile?.operations || agent.operations || ''
  form.rera_id = agent.profile?.rera_id || agent.rera_id || ''
  form.specialties = agent.profile?.specialties || agent.specialties || ''
  form.accreditation = agent.profile?.accreditation || agent.accreditation || ''
  currentStatus.value = agent.status || 'active'
  currentVerification.value = agent.verification_status || 'pending'
  statusDraft.value = currentStatus.value
  verificationDraft.value = currentVerification.value
}

async function loadAgent() {
  const agent = await agentService.getAgent(route.params.id)
  mapAgentToForm(agent)
}

async function submit() {
  saving.value = true
  error.value = ''
  errors.value = {}
  try {
    await agentService.updateAgent(route.params.id, { ...form })

    if (auth.hasPermission('agent.status') && statusDraft.value !== currentStatus.value) {
      if (['inactive', 'blocked'].includes(statusDraft.value)) {
        const confirm = await Swal.fire({
          title: 'Change agent status?',
          text: 'Suspending or blocking an agent may revoke access and can affect related listings based on backend rules.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Update status',
        })
        if (!confirm.isConfirmed) return
      }
      await agentService.updateAgentStatus(route.params.id, { status: statusDraft.value })
      currentStatus.value = statusDraft.value
    }

    if (auth.hasPermission('agent.verify') && verificationDraft.value !== currentVerification.value) {
      await agentService.updateAgentVerification(route.params.id, {
        verification_status: verificationDraft.value,
        remarks: 'Updated from agent edit screen',
      })
      currentVerification.value = verificationDraft.value
    }

    router.push(`/agents/${route.params.id}`)
  } catch (err) {
    errors.value = err.errors || {}
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    await loadAgent()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
