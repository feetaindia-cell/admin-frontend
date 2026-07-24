<template>
    <div class="dashboard-main-body"><div class="row gy-4">
            <EmailSidebar />
            <VeiwDetails />
        </div>
    </div>

</template>
<script>import { Icon } from "@iconify/vue"; 
import EmailSidebar from "@/components/email/EmailSidebar.vue"
import VeiwDetails from "@/components/email/VeiwDetails.vue"

export default {
  name: "EmailViewDetails",
  components: {Icon,
    EmailSidebar,
    VeiwDetails,
  },
};
</script>