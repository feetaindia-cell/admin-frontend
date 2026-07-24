<template>
    <div class="dashboard-main-body"><KanbanData />
    </div>

</template>
<script>import { Icon } from "@iconify/vue"; 
import KanbanData from "@/components/kanban/Kanban.vue"

export default {
  name: "Kanban",
  components: {Icon,
    KanbanData,
  },
};
</script>