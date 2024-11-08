export default class Coupon {
  constructor(
    id = null, // (user, coupon_id) -> id
    couponName = null,
    couponId = null,
    type = null,
    discount = null,
    percentOff = null,
    expire = null,
    used = null
  ) {
    this.id = id;
    this.couponName = couponName;
    this.couponId = couponId;
    this.type = type;
    this.discount = discount;
    this.percentOff = percentOff;
    this.expire = expire ? expire.replace('T', ' ').split('.')[0] : null;
    this.used = used;
  }
}