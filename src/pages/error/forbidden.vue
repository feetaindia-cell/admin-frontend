<template>
    <div class="dashboard-main-body"><Forbidden />
    </div>
</template>
<script>import Forbidden from '@/components/Error/Forbidden.vue'
export default {
    name: "ForbiddenError",
    components: {Forbidden
    },
}
</script>