<template>
  <div class="dashboard-main-body"><!-- invoive preview -->
         <Preview />
  </div>
</template>
<script>import Preview from '@/components/invoice/Preview.vue'

export default {
  name: 'InvoicePreview',
  components: {Preview,
  }
}
</script>