<template>
  <div class="dashboard-main-body"><div class="row gy-4">
    <VoiceSidebar />
    <ChatSection />
  </div>
    
  </div>
</template>

<script>import VoiceSidebar from '@/components/AiApplication/VoiceGenerator/VoiceSidebar.vue'
import ChatSection from '@/components/AiApplication/VoiceGenerator/ChatSection.vue'

export default {
  name: "TextGenerator",
  components: {VoiceSidebar,
    ChatSection
  },
}
</script>