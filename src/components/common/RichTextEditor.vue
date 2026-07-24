<template>
  <div class="border border-neutral-200 radius-8 overflow-hidden">
    <div ref="toolbarRef">
      <span class="ql-formats">
        <select class="ql-header">
          <option value="1"></option>
          <option value="2"></option>
          <option selected></option>
        </select>
      </span>
      <span class="ql-formats">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <button class="ql-strike"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered"></button>
        <button class="ql-list" value="bullet"></button>
        <button class="ql-blockquote"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-link"></button>
        <button class="ql-image"></button>
        <button class="ql-clean"></button>
      </span>
    </div>
    <div ref="editorRef" class="height-200 bg-base"></div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Write content...' },
})

const emit = defineEmits(['update:modelValue'])
const editorRef = ref(null)
const toolbarRef = ref(null)
let quill = null
let updatingFromModel = false

onMounted(async () => {
  await nextTick()
  quill = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: props.placeholder,
    modules: { toolbar: toolbarRef.value },
  })
  quill.root.innerHTML = props.modelValue || ''
  quill.on('text-change', () => {
    if (updatingFromModel) return
    emit('update:modelValue', quill.root.innerHTML)
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (!quill || value === quill.root.innerHTML) return
    updatingFromModel = true
    quill.root.innerHTML = value || ''
    updatingFromModel = false
  },
)

onBeforeUnmount(() => {
  quill = null
})
</script>
