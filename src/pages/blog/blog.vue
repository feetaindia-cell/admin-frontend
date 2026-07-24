<template>
    <div class="dashboard-main-body"><div class="row gy-4">
            <!-- Style One -->
            <BlogStyleOne />
            <!-- Style Two -->
            <BlogStyleTwo />
            <!-- Style Three -->
            <BlogStyleThree />
        </div>
    </div>
</template>
<script>import BlogStyleOne from '@/components/Blog/BlogStyles/BlogStyleOne.vue'
import BlogStyleTwo from '@/components/Blog/BlogStyles/BlogStyleTwo.vue'
import BlogStyleThree from '@/components/Blog/BlogStyles/BlogStyleThree.vue'
export default {
    name: "Blog",
    components: {BlogStyleOne,
        BlogStyleTwo,
        BlogStyleThree
    },
}
</script>