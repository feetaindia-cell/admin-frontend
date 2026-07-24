<template>
  <div class="dashboard-main-body"><div class="chat-wrapper">
      <ChatSidebar />
      <ChatMessage />
    </div>

  </div>
</template>
<script>import { Icon } from "@iconify/vue"; 
import ChatSidebar from "@/components/chat/ChatSidebar.vue"
import ChatMessage from "@/components/chat/ChatMessage.vue"

export default {
  name: "Chat",
  components: {Icon,
    ChatSidebar,
    ChatMessage,
  },
};
</script>