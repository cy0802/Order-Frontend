<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title @click="goToIndex">王品集團</v-app-bar-title>
      <v-spacer></v-spacer>
      <LoginDialog 
        @login="login"
        v-if="!loggedIn"
      />
      <v-menu v-if="loggedIn">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" variant="text">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card min-width="200">
          <v-list>
            <v-list-item>
              Hi, {{ userName }}
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list>
            <v-list-item @click="logout">
              <v-icon class='mr-2'>mdi-logout</v-icon>
              登出
            </v-list-item>
            <v-list-item @click="goToIndex">
              <v-icon class="mr-2">mdi-home</v-icon>
              回首頁
            </v-list-item>
            <v-list-item @click="showHistory">
              <v-icon class="mr-2">mdi-history</v-icon>
              歷史訂單
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-alert
          v-model="alert"
          :type="alertType"
          closable
          close-label="關閉"
          class="mb-4"
          variant="tonal"
          border="start"
          :border-color="alertType"
          elevation="2"
        >
          {{ errorMsg }}
        </v-alert>
        <ProductTabs 
          v-if="page === 'product'"
          :userId="userId"
          :userToken="accessToken"
          @showAlert="showAlert"
        />
        <HistoryPage
          v-if="page === 'history'"
          :userToken="accessToken"
          @showAlert="showAlert"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import ProductTabs from './components/ProductTabs.vue';
import LoginDialog from './components/LoginDialog.vue';
import HistoryPage from './components/HistoryPage.vue';
import axios from 'axios';
export default {
  name: 'App',
  components: {
    ProductTabs,
    LoginDialog,
    HistoryPage
  },
  data() {
    return {
      loggedIn: false,
      userName: null,
      userId: null,
      userPhone: null,
      userEmail: null,
      accessToken: null,
      admin: null,
      alert: false,
      errorMsg: null,
      alertType: 'error',
      menu: false,
      page: 'product'
    };
  },
  created() {
    if (localStorage.getItem('accessToken')) {
      this.userId = localStorage.getItem('userId');
      this.userName = localStorage.getItem('userName');
      this.userPhone = localStorage.getItem('userPhone');
      this.userEmail = localStorage.getItem('userEmail');
      this.admin = localStorage.getItem('admin');
      this.accessToken = localStorage.getItem('accessToken');
      this.loggedIn = true;
    }
  },
  methods: {
    async login(email, password) {
      try {
        const response = await axios.post('http://localhost:8000/api/login', {
          email: email,
          password: password
        });
        const { id, name, email: userEmail, token, phone, admin } = response.data;
        this.userId = id;
        this.userName = name;
        this.userEmail = userEmail;
        this.userPhone = phone;
        this.accessToken = token;
        this.admin = admin;
        this.loggedIn = true;
        localStorage.setItem('userId', id);
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('admin', admin);
      } catch (error) {
        if (error.status === 401) {
          this.showAlert('error', '帳號或密碼錯誤');
        } else {
          console.error(error);
        }
      }
    },
    showAlert(type, msg) {
      this.alert = true;
      this.errorMsg = msg;
      this.alertType = type;
    },
    goToIndex() {
      this.page = 'product';
    },
    logout() {
      this.userId = null;
      this.userName = null;
      this.userPhone = null;
      this.userEmail = null;
      this.admin = null;
      this.loggedIn = false;
      this.accessToken = null;
      this.page = 'product';
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('admin');
      localStorage.removeItem('accessToken');
      this.showAlert('info', '已登出');
    },
    showHistory() {
      this.page = 'history';
    }
  }
}
</script>
