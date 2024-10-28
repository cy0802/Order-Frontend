<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title @click="handleMenuItemClick(menuItems[0])">王品集團</v-app-bar-title>
      <v-spacer></v-spacer>
      <LoginDialog 
        @login="login"
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
import User from '../types/User.js';

const user = ref(new User());
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

onMounted(() => {
  user.value.loadUser();
});

provide('user', user);

const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:8000/api/login', {
      email: email,
      password: password
    });
    const { id, name, token, phone, admin } = response.data;
    user.value = new User(id, name, phone, email, admin, token);
    user.value.storeUser();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      showAlert('error', '帳號或密碼錯誤');
    } else {
      console.error(error);
    }
  }
};

const logout = () => {
  user.value.logout();
  router.push({ name: 'home' });
}
</script>
