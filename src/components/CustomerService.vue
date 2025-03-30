<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4" outlined style="height: 75vh;">
          <v-card-text>
            <div class="chat-container">
              <div
                v-for="msg in msgs"
                :key="msg.id"
                :class="['chat-message', msg.type === 'customer' ? 'customer' : 'service']"
              >
                <p v-html="marked.parseInline(msg.msg)"></p>
              </div>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-text-field
              v-model="newMessage"
              label="輸入訊息"
              variant="outlined"
              class="flex-grow-1 mt-2"
              @keyup.enter="handleSendMsg"
            ></v-text-field>
            <v-btn color="primary" @click="handleSendMsg" class="mb-3">
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { sendMessage } from '@/services/chatApi';
import { marked } from 'marked';

// format
// {id: int, type: 'customer'|'service', msg: string}
const msgs = ref([]);

const newMessage = ref('');

const randomSessionId = Array.from('abcdefghijklmnopqrstuvwxyz1234567890')
  .sort(() => Math.random() - 0.5)
  .slice(0, 12)
  .join('');

const handleSendMsg = async () => {
  if (newMessage.value.trim() === '') return;

  // Add the new message as a customer message
  msgs.value.push({
    id: msgs.value.length + 1,
    type: 'customer',
    msg: newMessage.value.trim()
  });

  const tmp = newMessage.value;

  // Clear the input field
  newMessage.value = '';

  const responseMsgs = await sendMessage(tmp, randomSessionId);

  if (responseMsgs == null || responseMsgs.length === 0) {
    // Add a service message indicating no response
    msgs.value.push({
      id: msgs.value.length + 1,
      type: 'service',
      msg: 'Sorry, something went wrong. Please try again later.'
    });
    return;
  } else {
    responseMsgs.forEach((responseMsg) => {
      msgs.value.push({
        id: msgs.value.length + 1,
        type: 'service',
        msg: responseMsg.content
      });
    });
  }

  // Scroll to the bottom of the chat container
  const chatContainer = document.querySelector('.chat-container');
  chatContainer.scrollTop = chatContainer.scrollHeight;
};
</script>

<style scoped>
.chat-container {
  height: 50vh;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

/* Make bubbles auto-size to their text (up to a max width). */
.chat-message {
  display: inline-block;        /* Allows bubble size to adapt to content */
  margin: 10px 0;
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;              /* Avoids spanning the entire container */
  word-wrap: break-word;       /* Break long words to avoid overflow */
  white-space: pre-wrap;       /* Preserve line breaks, but still wrap text */
}

/* Customer messages align to the right */
.chat-message.customer {
  background-color: #e3f2fd;
  margin-left: auto;
  text-align: right;
}

/* Service messages align to the left */
.chat-message.service {
  background-color: #f1f1f1;
  margin-right: auto;
  text-align: left;
}
</style>
