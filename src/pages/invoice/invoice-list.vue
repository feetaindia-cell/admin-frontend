<template>
  <div class="dashboard-main-body"><!-- Card -->
    <List />

  </div>
</template>

<script>import List from '@/components/invoice/List.vue'

export default {
  name: "InvoiceList",
  components: {List,
  },
};
</script>