import axios from 'axios';

const apiClient = axios.create({
  baseURL: `https://${window.location.hostname}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const addOrder = async (order, accessToken) => {
  let err = '';
  try {
    await apiClient.post(
      '/api/orders', 
      order.payload(), 
      { headers: { Authorization: `Bearer ${accessToken}` }}
    );
  } catch (error) {
    console.error(error);
    err = '訂單建立失敗';
  }
  return err;
}