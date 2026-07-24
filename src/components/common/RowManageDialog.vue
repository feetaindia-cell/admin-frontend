<template>
  <Teleport to="body">
    <div v-if="modelValue" class="row-manage-backdrop" @click.self="$emit('update:modelValue', false)">
      <section class="row-manage-dialog" role="dialog" aria-modal="true" :aria-label="title || 'Manage'">
        <header class="row-manage-header">
          <div>
            <span class="row-manage-kicker">Manage</span>
            <h6 class="mb-0">{{ title || 'Record actions' }}</h6>
            <p v-if="subtitle" class="mb-0">{{ subtitle }}</p>
          </div>
          <button type="button" class="row-manage-close" aria-label="Close" @click="$emit('update:modelValue', false)">
            <iconify-icon icon="lucide:x" />
          </button>
        </header>
        <div class="row-manage-actions" @click="$emit('update:modelValue', false)">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.row-manage-backdrop{position:fixed;inset:0;z-index:1060;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.42);backdrop-filter:blur(3px)}
.row-manage-dialog{width:min(430px,100%);overflow:hidden;border:1px solid rgba(148,163,184,.32);border-radius:16px;background:#fff;box-shadow:0 28px 80px rgba(15,23,42,.28)}
.row-manage-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px;border-bottom:1px solid #edf1f6}
.row-manage-kicker{display:block;margin-bottom:4px;color:#2563eb;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.row-manage-header h6{color:#0f172a;font-weight:850}.row-manage-header p{margin-top:5px;color:#64748b;font-size:13px}
.row-manage-close{width:34px;height:34px;display:grid;place-items:center;flex:0 0 34px;border:1px solid #e2e8f0;border-radius:10px;color:#64748b;background:#fff;font-size:18px}.row-manage-close:hover{color:#0f172a;background:#f8fafc}
.row-manage-actions{display:grid;gap:8px;padding:14px}.row-manage-actions :deep(a),.row-manage-actions :deep(button),.row-manage-actions :deep(span){min-height:42px;display:flex;align-items:center;gap:10px;width:100%;padding:0 12px;border:1px solid #e2e8f0;border-radius:10px;color:#334155;background:#fff;text-align:left;font-size:13px;font-weight:750}.row-manage-actions :deep(a:hover),.row-manage-actions :deep(button:hover:not(:disabled)){color:#1d4ed8;background:#eff6ff;border-color:#bfdbfe}.row-manage-actions :deep(button.text-danger:hover:not(:disabled)){color:#b91c1c;background:#fff5f5;border-color:#fecaca}.row-manage-actions :deep(button.text-success:hover:not(:disabled)){color:#15803d;background:#f0fdf4;border-color:#bbf7d0}.row-manage-actions :deep(button:disabled),.row-manage-actions :deep(span.disabled){opacity:.62;cursor:not-allowed}
:global(.manage-row){transition:background-color .16s ease,box-shadow .16s ease,transform .16s ease}
:global(.manage-cell){width:1%;text-align:center;white-space:nowrap}
:global(.manage-row-button){min-width:84px;min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:1px solid #bfdbfe;border-radius:10px;color:#1d4ed8;background:#eff6ff;font-size:12px;font-weight:800;line-height:1;transition:background-color .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease}
:global(.manage-row-button:hover),:global(.manage-row-button:focus-visible){color:#fff;background:#2563eb;border-color:#2563eb;box-shadow:0 10px 20px rgba(37,99,235,.22);outline:0}
:global(.manage-row-button iconify-icon){font-size:15px}
@media (max-width:767px){:global(.manage-row-button){min-width:76px;min-height:32px;padding:0 10px}}
</style>
