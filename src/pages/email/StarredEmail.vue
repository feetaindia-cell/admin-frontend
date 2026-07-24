<template>
    <div class="dashboard-main-body"><div class="row gy-4">
            <EmailSidebar />
            <StarredEmailData />
        </div>
    </div>

</template>
<script>import { Icon } from "@iconify/vue";
import EmailSidebar from "@/components/email/EmailSidebar.vue"
import StarredEmailData from "@/components/email/StarredEmail.vue"

export default {
    name: "StarredEmail",
    components: {Icon,
        EmailSidebar,
        StarredEmailData,
    },
};
</script>