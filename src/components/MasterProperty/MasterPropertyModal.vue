<template>
  <div v-if="open" class="modal fade show d-block" tabindex="-1" role="dialog" @click.self="$emit('close')">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content radius-16 bg-base">
        <div class="modal-header py-16 px-24 border-bottom">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <form @submit.prevent="$emit('submit')">
          <div class="modal-body p-24">
            <div v-if="error" class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100">{{ error }}</div>
            <slot />
          </div>
          <div class="modal-footer border-top px-24 py-16">
            <button type="button" class="btn btn-outline-secondary radius-8" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn btn-primary radius-8" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="open" class="modal-backdrop fade show"></div>
</template>

<script setup>
defineProps({
  open: Boolean,
  title: { type: String, default: '' },
  saving: Boolean,
  error: { type: String, default: '' },
})
defineEmits(['close', 'submit'])
</script>
