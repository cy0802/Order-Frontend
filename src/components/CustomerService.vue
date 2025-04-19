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
                <div v-if="msg.isAudio">
                  <audio :src="msg.audioUrl" controls></audio>
                </div>
                <div v-else>
                  <p v-html="marked.parseInline(msg.msg)"></p>
                </div>
              </div>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              icon
              :color="recording ? 'red' : 'primary'"
              @click="recording ? stopRecording() : startRecording()"
            >
              <v-icon>{{ recording ? 'mdi-stop-circle' : 'mdi-microphone' }}</v-icon>
            </v-btn>
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
import { sendMessage, sendVoice } from '@/services/chatApi';
import { marked } from 'marked';

// format
// {id: int, type: 'customer'|'service', msg: string}
const msgs = ref([]);

const newMessage = ref('');

const randomSessionId = Array.from('abcdefghijklmnopqrstuvwxyz1234567890')
  .sort(() => Math.random() - 0.5)
  .slice(0, 12)
  .join('');

const recording   = ref(false);
let mediaRecorder = null;
const audioChunks = ref([]);
const loading = ref(false);

const startRecording = async() => {
  console.log('Starting recording...');
  if (!navigator.mediaDevices?.getUserMedia) {
    console.log('Browser does not support audio recording.');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', e => {
      if (e.data.size > 0) {
        audioChunks.value.push(e.data);
      }
    });

    mediaRecorder.addEventListener('stop', sendUserVoice);
    mediaRecorder.start();
    recording.value = true;
  } catch (err) {
    console.log(`Could not start recording: ${err.message}`);
  }
}

const sendUserVoice = async () => {
  console.log('Sending user voice...');
  const userBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
  const userUrl  = URL.createObjectURL(userBlob);

  console.log(`User audio URL: ${userUrl}, size: ${userBlob.size} bytes`);

  // msgs.value.push({
  //   id: msgs.value.length + 1,
  //   type: 'customer',
  //   isAudio: true,
  //   audioUrl: userUrl,
  // });

  loading.value = true;
  try {
    console.log(`@sendUserVoice: User audio blob size: ${userBlob.size} bytes`);
    
    msgs.value.push({
      id: msgs.value.length + 1,
      type: 'service',
      msg: '',
      isAudio: false,
      audioUrl: '',
    });

    const { audioBlob: botBlob } = await sendVoice(randomSessionId, userBlob);

    const botUrl = URL.createObjectURL(botBlob);
    
    if (botBlob) {
      // Replace the last message with an icon
      msgs.value[msgs.value.length - 1].audioUrl = botUrl;
      msgs.value[msgs.value.length - 1].isAudio = true;
      console.log(botUrl);
    }
  } catch (err) {
    console.log(`Could not send voice: ${err.message}`);
    msgs.value[msgs.value.length - 1].msg = 'Something went wrong, please try again.';
  } finally {
    loading.value = false;
  }
}

/** stop recording */
const stopRecording = () => {
  if (mediaRecorder && recording.value) {
    mediaRecorder.stop();
    recording.value = false;
  }
}

const handleSendMsg = async () => {
  if (newMessage.value.trim() === '') return;

  // Add the new message as a customer message
  msgs.value.push({
    id: msgs.value.length + 1,
    type: 'customer',
    msg: newMessage.value.trim(),
    isAudio: false,
  });

  const tmp = newMessage.value;

  // Clear the input field
  newMessage.value = '';

  const responseMsgs = await sendMessage(tmp, randomSessionId);

  if (responseMsgs == null || (typeof responseMsgs !== 'string' && responseMsgs.length === 0)) {
    // Add a service message indicating no response
    msgs.value.push({
      id: msgs.value.length + 1,
      type: 'service',
      msg: 'Sorry, something went wrong. Please try again later.',
      isAudio: false,
    });
    return;
  } else if (typeof responseMsgs === 'string') {
    // Handle the case where responseMsgs is a single string
    msgs.value.push({
      id: msgs.value.length + 1,
      type: 'service',
      msg: responseMsgs,
      isAudio: false,
    });
  } else {
    responseMsgs.forEach((responseMsg) => {
      msgs.value.push({
        id: msgs.value.length + 1,
        type: 'service',
        msg: responseMsg.content,
        isAudio: false,
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
