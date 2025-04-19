import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessage = async (userMessage, sessionId) => {
  console.log("call to sendMessage", userMessage, sessionId);
  if (!userMessage) return;

  try {
    const response = await apiClient.post(`${window.location.protocol}//${window.location.hostname}/api/chat`, {
      message: userMessage,
      sessionId: sessionId
    });
    return response.data.response;
  } catch (error) {
    console.error("Lex Error:", error);
  }
  return null;
}

export async function sendVoice(sessionId, audioBlob) {
  console.log(`audioblob size: ${audioBlob.size}`);

  // 1) Build a FormData payload
  const form = new FormData();
  form.append('audio', audioBlob, 'recording.webm');  // field name must match upload.single('audio')
  form.append('sessionId', sessionId);

  // 2) Post with multipart/form-data and expect binary (blob) back
  const res = await apiClient.post(
    // adjust your baseURL/config—here’s a generic example:
    `${window.location.protocol}//${window.location.hostname}/api/chat/voice`,
    form,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob'   // <— important so axios doesn’t try to JSON.parse
    }
  );

  if (res.status !== 200) {
    throw new Error(`Voice API error: ${res.status}`);
  }

  // 3) res.data is the MP3 blob
  return {
    audioBlob: res.data,
    sessionId: res.headers['x-session-id'] || sessionId
  };
}