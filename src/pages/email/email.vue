<template>
    <div class="dashboard-main-body"><div class="row gy-4">
        <EmailSidebar />
        <EmailData />
        </div>
    </div>
</template>
<script>import { Icon } from "@iconify/vue"; 
import EmailSidebar from "@/components/email/EmailSidebar.vue"
import EmailData from "@/components/email/EmailData.vue"

export default {
  name: "Email",
  components: {Icon,
    EmailSidebar,
    EmailData,
  },
};
</script>