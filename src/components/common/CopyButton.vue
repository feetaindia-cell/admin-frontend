<template>
  <button
    v-if="value"
    type="button"
    class="copy-button"
    :title="copied ? 'Copied' : `Copy ${label}`"
    @click.stop="copy"
  >
    <iconify-icon :icon="copied ? 'solar:check-circle-outline' : 'solar:copy-outline'" />
  </button>
</template>

<script setup>
import Swal from 'sweetalert2'
import { ref } from 'vue'

const props = defineProps({
  value: { type: [String, Number], default: '' },
  label: { type: String, default: 'value' },
})

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(String(props.value))
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1400)
  } catch {
    await Swal.fire({
      icon: 'error',
      title: 'Copy failed',
      text: `Could not copy ${props.label}.`,
      timer: 1600,
      showConfirmButton: false,
    })
  }
}
</script>

<style scoped>
.copy-button {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  color: #487fff;
  background: #edf3ff;
  transition: background-color .2s ease, transform .2s ease;
}

.copy-button:hover {
  background: #dfe9ff;
  transform: translateY(-1px);
}
</style>
