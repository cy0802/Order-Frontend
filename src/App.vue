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
      admin: null
    };
  },
  methods: {
    async login(email, password) {
      console.log(email, password);
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
        console.error(error);
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
