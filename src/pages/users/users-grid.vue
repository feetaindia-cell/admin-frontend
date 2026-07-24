<template>
    <div class="dashboard-main-body"><UserGrid />
    </div>
</template>
<script>import UserGrid from '@/components/Users/UserGrid.vue'

export default {
    name: "UsersGrid",
    components: {UserGrid,
    },
}
</script>