import axios from 'axios';
import User from '../types/User';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password, accessToken) => {
  let err = null;
  let loginedUser = null;
  try {
    const response = await apiClient.post('/api/login', 
      { email: email, password: password }, 
      { headers: { "Authorization": "Bearer " + accessToken }}
    );
    const { id, name, token, phone, admin } = response.data;
    loginedUser = new User(id, name, phone, email, admin, token);
    loginedUser.storeUser();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      err = '帳號或密碼錯誤';
    } else {
      console.error(error);
    }
  }
  return { err, loginedUser };
};