<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title>王品集團</v-app-bar-title>
      <v-spacer></v-spacer>
      <LoginDialog 
        @login="login"
        v-if="!loggedIn"
      />
      <p v-if="loggedIn" class="mr-7">Hi, {{ userName }}</p>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-alert
          v-model="loginError"
          type="error"
          closable
          close-label="關閉"
          class="mb-4"
          variant="tonal"
          border="start"
          border-color="error"
          elevation="2"
        >
          帳號或密碼錯誤
        </v-alert>
        <ProductTabs />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import ProductTabs from './components/ProductTabs.vue';
import LoginDialog from './components/LoginDialog.vue';
import axios from 'axios';
export default {
  name: 'App',
  components: {
    ProductTabs,
    LoginDialog
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
      loginError: false
    };
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
      } catch (error) {
        if (error.response.status === 401) {
          this.loginError = true;
        } else {
          console.error(error);
        }
      }
    },
    logout() {
      this.userId = null;
      this.userName = null;
      this.userPhone = null;
      this.userEmail = null;
      this.admin = null;
      this.loggedIn = false;
      this.accessToken = null;
    }
  }
}
</script>
