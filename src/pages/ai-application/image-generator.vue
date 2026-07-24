<template>
  <div class="dashboard-main-body"><div class="row gy-4">
      <ImageSidebar />
      <ChatSection />
    </div>
  </div>
</template>
<script>import ImageSidebar from '@/components/AiApplication/ImageGenerator/ImageSidebar.vue'
import ChatSection from '@/components/AiApplication/ImageGenerator/ChatSection.vue'

export default {
  name: "ImageGenerator",
  components: {ImageSidebar,
    ChatSection
  },
}
</script>