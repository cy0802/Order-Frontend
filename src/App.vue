<template>
  
  <Global_Website v-if="global_page" @showAlert="showAlert" />

  <v-app v-if="!global_page">
    <v-app-bar app color="primary">
      <v-app-bar-title @click="handleMenuItemClick(menuItems[0])">{{ metadata.name }}</v-app-bar-title>
      <v-spacer></v-spacer>
      <RegisterDialog 
        @register="handleRegister"
        v-if="!user.loggedIn"
      />
      <LoginDialog 
        @login="handleLogin"
        v-if="!user.loggedIn"
      />
      <v-menu v-if="user.loggedIn" v-model="menu">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" variant="text">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card min-width="200">
          <v-list>
            <v-list-item>
              Hi, {{ user.userName }}
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list max-height="400px">
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
        class="mb4 fixed-alert"
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
  <!-- variant="tonal" -->
</template>

<script setup>
import LoginDialog from './components/LoginDialog.vue';
import RegisterDialog from './components/RegisterDialog.vue';

import Global_Website from './components/Global_Website.vue';

import Metadata from './types/Metadata.js';

import { RouterView, useRouter } from 'vue-router';
import { ref, provide, onMounted } from 'vue';
import User from './types/User.js';
import { login, register } from './services/userApi.js';
import { getMetadata } from './services/metadataApi.js';
import { computed } from 'vue';

const user = ref(new User());
const alert = ref(false);
const errorMsg = ref(null);
const alertType = ref('error');
const menu = ref(false);
const metadata = ref(new Metadata());

const router = useRouter();

const dropdown = ref(false);

const global_page = computed(() => {
  return window.location.hostname.split('.')[0] === 'global-website'
});

const customerMenuItems = computed(() => [
  { title: '回首頁', action: '', icon: 'mdi-home' },
  { title: '歷史訂單', action: 'history', icon: 'mdi-history' },
  { title: '優惠卷', action: 'coupons', icon: 'mdi-ticket-percent-outline'},
  { title: '登出', action: 'logout', icon: 'mdi-logout' },
]);  

const clerkMenuItems = computed( () => [
  { title: '回首頁', action: '', icon: 'mdi-home' },
  { title: '訂單狀態', action: 'show-orders', icon: 'mdi-note-outline'},
  { title: '歷史訂單', action: 'history', icon: 'mdi-history' },
  { title: '結帳系統', action: 'charge-page', icon: 'mdi-cash-check'},
  // { title: '管理菜單', action: 'menu-management', icon: 'mdi-note-edit-outline'},
  { title: '登出', action: 'logout', icon: 'mdi-logout' },
]);

const adminMenuItems = computed(() => [
  { title: '回首頁', action: '', icon: 'mdi-home' },
  { title: '訂單狀態', action: 'show-orders', icon: 'mdi-note-outline'},
  { title: '歷史訂單', action: 'history', icon: 'mdi-history' },
  { title: '結帳系統', action: 'charge-page', icon: 'mdi-cash-check'},
  { title: '管理菜單', action: 'menu-management', icon: 'mdi-note-edit-outline'},
  { title: '發送折價券', action: 'coupon-distribution-page', icon: 'coupon-distribution-page'},
  { title: '權限管理', action: 'permission-management', icon: 'mdi-account-key'},
  { title: '登出', action: 'logout', icon: 'mdi-logout' },
]);

const menuItems = computed(() => {
  return user.value.isAdmin ? adminMenuItems.value : user.value.isClerk ? clerkMenuItems.value : customerMenuItems.value;
});

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
  setTimeout(() => {
    alert.value = false;
  }, 4000); // Close after 3 seconds
};

const fetchMetadata = async () => {
  const { err, metadata: fetchedMetadata } = await getMetadata();
  if (err) {
    showAlert('error', err);
  } else {
    metadata.value = fetchedMetadata;
  }
};

onMounted(() => {
  user.value.loadUser();
  fetchMetadata();
});

provide('user', user);
provide('metadata', metadata);

const handleLogin = async (email, password) => {
  const { err, loginedUser } = await login(email, password);
  if (err) {
    showAlert('error', err);
  } else {
    showAlert('success', '登入成功');
    user.value = loginedUser;
  }
};

const handleRegister = async (email, name, phone, password) => {
  const { err, loginedUser } = await register(email, name, phone, password);
  if (err) {
    showAlert('error', err);
  } else {
    showAlert('success', '註冊成功');
    user.value = loginedUser;
  }
};

const logout = () => {
  user.value.logout();
  router.push({ path: '/' });
}
</script>

<style scoped>
.fixed-alert {
  position: fixed; /* 固定在螢幕的位置 */
  top: 80px; /* 距離螢幕上方 20px */
  left: 50%; /* 水平居中 */
  transform: translateX(-50%); /* 水平移動，確保完全居中 */
  z-index: 9999; /* 確保在其他內容之上 */
  max-width: 90%; /* 防止視窗過小時超出螢幕 */
  width: 800px; /* 設定提示框寬度 */
}
</style>