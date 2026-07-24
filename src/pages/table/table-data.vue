<template>
    <div class="dashboard-main-body"><DataTable />
    </div>
</template>
<script>import DataTable from '@/components/Table/DataTable.vue'

export default {
  name: "TableData",
  components: {DataTable,
  },
}
</script>