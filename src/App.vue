<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title @click="handleMenuItemClick(menuItems[0])">王品集團</v-app-bar-title>
      <v-spacer></v-spacer>
      <LoginDialog 
        @login="login"
        v-if="!loggedIn"
      />
      <v-menu v-if="loggedIn" v-model="menu">
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
            <v-list-item
              v-for="(item, index) in menuItems"
              :key="index"
              @click="handleMenuItemClick(item)"
            >
              <v-list-item>
                <v-icon>{{ item.icon }}</v-icon>
                {{ item.title }}
              </v-list-item>
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
        <RouterView 
          @showAlert="showAlert"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import LoginDialog from './components/LoginDialog.vue';
import axios from 'axios';
import { RouterView, useRouter } from 'vue-router';
import { ref, provide, onMounted } from 'vue';

const loggedIn = ref(false);
const userName = ref(null);
const userId = ref(null);
const userPhone = ref(null);
const userEmail =  ref(null);
const accessToken = ref(null);
const isAdmin = ref(null);
const alert = ref(false);
const errorMsg = ref(null);
const alertType = ref('error');
const menu = ref(false);

const router = useRouter();

const dropdown = ref(false);
const menuItems = ref([
  { title: '回首頁', action: '', icon: 'mdi-home' },
  { title: '歷史訂單', action: 'history', icon: 'mdi-history' },
  { title: '登出', action: 'logout', icon: 'mdi-logout' },
]);

const handleMenuItemClick = (item) => {
  if (item.action === 'logout') {
    logout();
  } else {
    router.push({ path: '/' + item.action });
  }
  dropdown.value = false;
};

const showAlert = (type, msg) => {
  alert.value = true;
  errorMsg.value = msg;
  alertType.value = type;
};

const loadUserData = () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData) {
    userId.value = userData.userId;
    userName.value = userData.userName;
    userPhone.value = userData.userPhone;
    userEmail.value = userData.userEmail;
    isAdmin.value = userData.isAdmin;
    loggedIn.value = userData.loggedIn;
    accessToken.value = userData.accessToken;
  }
};

onMounted(() => {
  loadUserData();
});

provide('accessToken', accessToken);
provide('userId', userId);
provide('userName', userName);
provide('userPhone', userPhone);
provide('userEmail', userEmail);
provide('isAdmin', isAdmin);
provide('loggedIn', loggedIn);

const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:8000/api/login', {
      email: email,
      password: password
    });
    const { id, name, token, phone, admin } = response.data;
    userId.value = id;
    userName.value = name;
    userEmail.value = email;
    userPhone.value = phone;
    accessToken.value = token;
    isAdmin.value = admin;
    loggedIn.value = true;
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('isAdmin', isAdmin);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      showAlert('error', '帳號或密碼錯誤');
    } else {
      console.error(error);
    }
  }
};

const logout = () => {
  userId.value = null;
  userName.value = null;
  userEmail.value = null;
  userPhone.value = null;
  accessToken.value = null;
  isAdmin.value = null;
  loggedIn.value = false;
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isAdmin');
  router.push({ name: 'home' });
}
</script>
