import axios from 'axios';

const BASE_URL = `${window.location.protocol}//${window.location.hostname}/api/charge-page/`;

// 獲取所有訂單資料
export const fetchOrdersAPI = async (accessToken) => {
  try {
    // const token = sessionStorage.getItem('token'); // 從 sessionStorage 獲取 token
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data; // 假設後端返回的是訂單的 JSON 陣列
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error.response?.data?.message || 'Failed to fetch orders';
  }
};

// 確認結帳的 API 請求
export const confirmChargeAPI = async (orderId, userId, accessToken) => {
  try {
    // const token = sessionStorage.getItem('token'); // 從 sessionStorage 獲取 token
    const response = await axios.post(
      `${BASE_URL}confirm-charge`,
      {
        order_id: orderId,
        paid_state: true,
        user_id: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data; // 假設後端成功時返回操作結果
  } catch (error) {
    console.error('Error confirming charge:', error);
    throw error.response?.data?.message || 'Failed to confirm charge';
  }
};
