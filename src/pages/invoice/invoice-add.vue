<template>
  <div class="dashboard-main-body"><!-- Add Invoice -->
    <AddInvoice />
    
  </div>
</template>
<script>import AddInvoice from '@/components/invoice/AddInvoice.vue'

export default {
  name: "InvoiceAdd",
  components: {AddInvoice,
  },
};
</script>