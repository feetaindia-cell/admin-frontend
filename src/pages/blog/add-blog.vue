<template>
    <div class="dashboard-main-body"><div class="row gy-4">
            <AddNewPost />
            <!-- Sidebar Start -->
            <LatestPost />
        </div>
    </div>
</template>
<script>import AddNewPost from '@/components/Blog/AddBlog/AddNewPost.vue'
import LatestPost from '@/components/Blog/AddBlog/LatestPost.vue'
export default {
    name: "AddBlog",
    components: {AddNewPost,
        LatestPost
    },
}
</script>