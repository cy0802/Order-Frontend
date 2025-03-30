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
