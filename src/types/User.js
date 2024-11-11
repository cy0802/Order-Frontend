import { getCoupons } from '@/services/couponApi.js';
export default class User {
  constructor(
    userId = null, 
    userName = null, 
    userPhone = null, 
    userEmail = null, 
    isAdmin = false, 
    accessToken = null
  ) {
    this.userId = userId;
    this.userName = userName;
    this.accessToken = accessToken;
    this.userPhone = userPhone;
    this.userEmail = userEmail;
    this.isAdmin = isAdmin;
    this.loggedIn = !!userId;
    this.coupons = [];
    if (this.userId != null) {
      // token exprire in 3 hours
      this.tokenExprire = new Date().getTime() + 3 * 60 * 60 * 1000;
      this.loadUserCoupons();
    } else {
      this.tokenExprire = null;
    }
  }

  storeUser() {
    if (!this.userName) return;
    localStorage.setItem('userId', this.userId);
    localStorage.setItem('userName', this.userName);
    localStorage.setItem('accessToken', this.accessToken);
    localStorage.setItem('userPhone', this.userPhone);
    localStorage.setItem('userEmail', this.userEmail);
    localStorage.setItem('isAdmin', this.isAdmin);
    localStorage.setItem('tokenExprire', this.tokenExprire);
    this.loggedIn = true;
    if (Date.now() > this.tokenExprire) {
      this.logout();
    }
  }

  async loadUserCoupons() {
    if (!this.userId) {
      return;
    }
    const { err, coupons: fetchedCoupons } = await getCoupons(this.accessToken);
    if (err) {
      console.error(err);
      return;
    }
    this.coupons = fetchedCoupons;
  }

  loadUser() {
    if (!localStorage.getItem('userId')) {
      return;
    }
    if (Date.now() > localStorage.getItem('tokenExprire')) {
      this.logout();
      return;
    }
    this.userId = localStorage.getItem('userId');
    this.userName = localStorage.getItem('userName');
    this.accessToken = localStorage.getItem('accessToken');
    this.userPhone = localStorage.getItem('userPhone');
    this.userEmail = localStorage.getItem('userEmail');
    this.isAdmin = localStorage.getItem('isAdmin') == 'true' ? true : false;
    this.tokenExprire = localStorage.getItem('tokenExprire');
    this.loggedIn = true;
    this.loadUserCoupons();
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    this.userId = null;
    this.userName = null;
    this.accessToken = null;
    this.userPhone = null;
    this.userEmail = null;
    this.isAdmin = false;
    this.loggedIn = false;
    this.coupons = [];
  }
}