<template>
  <div class="dashboard-main-body"><div class="row gy-4 flex-wrap-reverse">

      <!-- Chat Sidebar -->
      <TextSidebar />
      <!-- Chat Area -->
      <NewChat />

    </div>
  </div>
</template>
<script>import TextSidebar from '@/components/AiApplication/TextGenerator/TextSidebar.vue'
import NewChat from '@/components/AiApplication/TextGenerator/NewChat.vue'

export default {
  name: "TextGenerator",
  components: {TextSidebar,
    NewChat
  },
}
</script>