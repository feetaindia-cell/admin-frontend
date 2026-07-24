<template>
    <div class="dashboard-main-body"><RolesPermission />
    </div>
</template>
<script>import RolesPermission from '@/components/Users/RolesPermission.vue'

export default {
    name: "Roles&Permission",
    components: {RolesPermission,
    },
}
</script>