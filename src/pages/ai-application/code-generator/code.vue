<template>
  <div class="dashboard-main-body"><div class="row gy-4 flex-wrap-reverse">
        <!-- Code Sidebar -->
        <CodeSidebar />
        <ChatSection />
    </div>
  </div>
</template>

<script>import CodeSidebar from '@/components/AiApplication/CodeGenerator/CodeSidebar.vue'
import ChatSection from '@/components/AiApplication/CodeGenerator/ChatSection.vue'

export default {
  name: "CodeGenerator",
  components: {CodeSidebar,
    ChatSection
  },
}
</script>