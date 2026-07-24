<template>
  <div class="dashboard-main-body"><div class="row gy-4 flex-wrap-reverse">

      <!-- Chat Sidebar -->
       <TextSidebar />
       <ChatSection />

    </div>
  </div>
</template>
<script>import TextSidebar from '@/components/AiApplication/TextGenerator/TextSidebar.vue'
import ChatSection from '@/components/AiApplication/TextGenerator/ChatSection.vue'

export default {
  name: "TextGenerator",
  components: {TextSidebar,
    ChatSection
  },
}
</script>