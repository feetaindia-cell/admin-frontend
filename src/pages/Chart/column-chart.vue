<template>
  <div class="dashboard-main-body"><div class="row gy-4">
      <ColumnOne />
      <ColumnTwo />
      <GroupColumn />
      <SimpleColumn />
    </div>

  </div>
</template>
<script>import ColumnOne from '@/components/Chart/ColumnChart/ColumnOne.vue'
import ColumnTwo from '@/components/Chart/ColumnChart/ColumnTwo.vue'
import GroupColumn from '@/components/Chart/ColumnChart/GroupColumn.vue'
import SimpleColumn from '@/components/Chart/ColumnChart/SimpleColumn.vue'

export default {
  name: "ColumnChart",
  components: {ColumnOne,
    ColumnTwo,
    GroupColumn,
    SimpleColumn
  },
}
</script>