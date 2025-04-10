import axios from 'axios';
import User from '../types/User';

const apiClient = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}`,
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
    const { id, name, token, phone, permission } = response.data;
    loginedUser = new User(id, name, phone, email, false, permission === 'admin', permission === 'clerk', token);
    loginedUser.storeUser();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      err = '帳號或密碼錯誤';
    } 
    else if(error.response?.status === 403) {
      err = '此帳號已被停權';
    }
    else {
      console.error(error);
    }
  }
  return { err, loginedUser };
};

export const register = async (email, name, phone, password) => {
  let err = null;
  let loginedUser = null;
  try {
    const response = await apiClient.post('/api/register', { name, email, password, phone });
    const { id, token, permission } = response.data;
    loginedUser = new User(id, name, phone, email, false, permission === 'admin', permission === 'clerk', token);
    loginedUser.storeUser();
  } catch (error) {
    if (error.response && error.response.status === 400) {
      err = '此信箱已被註冊';
    } else {
      console.error(error);
      err = '註冊失敗，請再試一次';
    }
  }
  return { err, loginedUser };
}