<template>
  <div class="dashboard-main-body"><div class="row gy-4">
      <DefaultTable />
      <BorderedTable />
      <StripedRows1 />
      <StripedRows2 />
      <TableBorderColor1 />
      <TableBorderColor2 />
      <TableBorderColor3 />
    </div>
  </div>
</template>
<script>import DefaultTable from '@/components/Table/BasicTable/DefaultTable.vue'
import BorderedTable from '@/components/Table/BasicTable/BorderedTable.vue'
import StripedRows1 from '@/components/Table/BasicTable/StripedRows1.vue'
import StripedRows2 from '@/components/Table/BasicTable/StripedRows2.vue'
import TableBorderColor1 from '@/components/Table/BasicTable/TableBorderColor1.vue'
import TableBorderColor2 from '@/components/Table/BasicTable/TableBorderColor2.vue'
import TableBorderColor3 from '@/components/Table/BasicTable/TableBorderColor3.vue'

export default {
  name: "BasicTable",
  components: {DefaultTable,
    BorderedTable,
    StripedRows1,
    StripedRows2,
    TableBorderColor1,
    TableBorderColor2,
    TableBorderColor3
  },
}
</script>