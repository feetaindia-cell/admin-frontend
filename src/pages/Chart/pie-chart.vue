<template>
    <div class="dashboard-main-body"><div class="row gy-4">
        <BasicChart />
        <DonutChart />
        <RadarChart />
        <MultipleseriesChart />
        </div>

    </div>
</template>
<script>import BasicChart from '@/components/Chart/PieChart/BasicChart.vue'
import DonutChart from '@/components/Chart/PieChart/DonutChart.vue'
import RadarChart from '@/components/Chart/PieChart/RadarChart.vue'
import MultipleseriesChart from '@/components/Chart/PieChart/MultipleseriesChart.vue'

export default {
  name: "PieChart",
  components: {BasicChart,
    DonutChart,
    RadarChart,
    MultipleseriesChart
  },
}
</script>