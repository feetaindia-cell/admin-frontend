<template>
  <div class="dashboard-main-body"><div class="row gy-4">
      <VideoSidebar />
      <ChatSection />
    </div>
  </div>
</template>
<script>import VideoSidebar from '@/components/AiApplication/VideoGenerator/VideoSidebar.vue'
import ChatSection from '@/components/AiApplication/VideoGenerator/ChatSection.vue'

export default {
  name: "TextGenerator",
  components: {VideoSidebar,
    ChatSection
  },
}
</script>