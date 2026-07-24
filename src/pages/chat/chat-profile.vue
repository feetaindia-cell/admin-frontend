<template>
  <div class="dashboard-main-body"><div class="chat-wrapper">
      <ChatProfile />
      <ChatMessage />
    </div>

  </div>
</template>
<script>import { Icon } from "@iconify/vue"; 
import ChatProfile from "@/components/chat/ChatProfile.vue"
import ChatMessage from "@/components/chat/ChatMessage.vue"

export default {
  name: "Chat",
  components: {Icon,
    ChatProfile,
    ChatMessage,
  },
};
</script>