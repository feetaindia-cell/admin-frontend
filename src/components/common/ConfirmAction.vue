<template>
  <button type="button" :class="buttonClass" :disabled="loading" @click="confirm">
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
import Swal from 'sweetalert2'

const props = defineProps({
  label: { type: String, default: 'Confirm' },
  title: { type: String, default: 'Are you sure?' },
  text: { type: String, default: 'This action cannot be undone.' },
  confirmText: { type: String, default: 'Yes, continue' },
  buttonClass: { type: String, default: 'btn btn-danger-600' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirmed'])

async function confirm() {
  const result = await Swal.fire({
    title: props.title,
    text: props.text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: props.confirmText,
    cancelButtonText: 'Cancel',
  })
  if (result.isConfirmed) emit('confirmed')
}
</script>
