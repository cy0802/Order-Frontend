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
  }

  storeUser() {
    if (!this.userName) return;
    localStorage.setItem('userId', this.userId);
    localStorage.setItem('userName', this.userName);
    localStorage.setItem('accessToken', this.accessToken);
    localStorage.setItem('userPhone', this.userPhone);
    localStorage.setItem('userEmail', this.userEmail);
    localStorage.setItem('isAdmin', this.isAdmin);
    this.loggedIn = true;
  }

  loadUser() {
    if (!localStorage.getItem('userId')) {
      return;
    }
    this.userId = localStorage.getItem('userId');
    this.userName = localStorage.getItem('userName');
    this.accessToken = localStorage.getItem('accessToken');
    this.userPhone = localStorage.getItem('userPhone');
    this.userEmail = localStorage.getItem('userEmail');
    this.isAdmin = localStorage.getItem('isAdmin');
    this.loggedIn = true;
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
  }
}