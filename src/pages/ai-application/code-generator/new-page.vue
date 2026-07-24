<template>
  <div class="dashboard-main-body"><div class="row gy-4 flex-wrap-reverse">
        <!-- Code Sidebar -->
        <CodeSidebar />
        <NewChat />
    </div>
  </div>
</template>

<script>import CodeSidebar from '@/components/AiApplication/CodeGenerator/CodeSidebar.vue'
import NewChat from '@/components/AiApplication/CodeGenerator/NewChat.vue'

export default {
  name: "CodeGenerator",
  components: {CodeSidebar,
    NewChat
  },
}
</script>