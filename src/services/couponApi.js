import axios from 'axios';
import Coupon from '@/types/Coupon.js';

const apiClient = axios.create({
  baseURL: `https://${window.location.hostname}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCoupons = async (accessToken) => {
  let err = '';
  let data = [];
  try {
    const response = await apiClient.get(
      '/api/coupons', 
      { headers: { Authorization: `Bearer ${accessToken}` }}
    );
    data = response.data;
  } catch (error) {
    console.error(error);
    err = '優惠卷資料取得失敗';
  }
  const coupons = data.map((coupon) => {
    return new Coupon(
      coupon.id,
      coupon.Coupon.name,
      coupon.Coupon.id,
      coupon.Coupon.type,
      coupon.Coupon.discount,
      coupon.Coupon.percent_off,
      coupon.Coupon.expire,
      coupon.used
    );
  });
  return { err, coupons };
}