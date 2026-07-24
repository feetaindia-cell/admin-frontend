<template>
  <div class="dashboard-main-body"><!-- Edit Invoice -->
    <EditInvoice />
    
  </div>
</template>
<script>import EditInvoice from '@/components/invoice/Edit.vue'

export default {
  name: "InvoiceEdit",
  components: {EditInvoice,
  },
};
</script>