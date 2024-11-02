<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title @click="handleMenuItemClick(menuItems[0])">王品集團</v-app-bar-title>
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
import RegisterDialog from './components/RegisterDialog.vue';
import { RouterView, useRouter } from 'vue-router';
import { ref, provide, onMounted } from 'vue';
import User from './types/User.js';
import { login, register } from './services/userApi.js';

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
  setTimeout(() => {
    alert.value = false;
  }, 4000); // Close after 3 seconds
};

onMounted(() => {
  user.value.loadUser();
});

provide('user', user);

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
  console.log(email, name, phone, password);
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
