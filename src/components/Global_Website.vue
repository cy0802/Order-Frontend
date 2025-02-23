<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title>這個點餐系統</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-menu v-if="user.loggedIn" v-model="menu">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" variant="text">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card min-width="200">
          <v-list>
            <v-list-item>Hi, {{ user.userName }}</v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list>
            <v-list-item @click="logout">
              <v-icon>mdi-logout</v-icon>
              登出
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-alert v-model="alert" :type="alertType" closable class="fixed-alert">
          {{ errorMsg }}
        </v-alert>
        
        <v-card class="pa-5">
          <v-row v-if="!user.loggedIn" justify="center">
            <h3>歡迎加入這個點餐系統</h3>
          </v-row>
          <v-row v-if="!user.loggedIn" justify="center">
            <GlobalRegisterDialog @showAlert="showAlert" @fetchMetadata="fetchMetadata" />
            <GlobalLoginDialog @showAlert="showAlert" @fetchMetadata="fetchMetadata"/>
          </v-row>
          
          <!-- <v-row v-if="user.loggedIn" justify="center">
            <p>你好 {{ user.userName }}</p>
          </v-row> -->
          
          <v-card-title v-if="user.loggedIn" class="h6">店家資料</v-card-title>
          <v-col v-if="user.loggedIn">
            <p>hostname: {{ hostname }}</p>
            <p>您的點餐系統網址：http://{{ hostname }}.example.com</p>
          </v-col>
          <v-text-field v-if="user.loggedIn" v-model="brandName" label="店名" required></v-text-field>
          <v-text-field v-if="user.loggedIn" v-model="tableNum" label="桌數" required></v-text-field>
          <v-btn v-if="user.loggedIn" @click="updateMetadata">更新店家資訊</v-btn>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, inject, provide, onMounted, defineEmits } from 'vue';
import GlobalLoginDialog from './GlobalLoginDialog.vue';
import GlobalRegisterDialog from './GlobalRegisterDialog.vue';

const emit = defineEmits(['showAlert']);
const user = inject('user');
const URL = `http://${window.location.hostname}/api/tenant/`;

const brandName = ref('');
const tableNum = ref(1);
const hostname = ref({});
const menu = ref(false);
const alert = ref(false);
const errorMsg = ref(null);
const alertType = ref('error');

provide('user', user);
provide('URL', URL);

const logout = () => {
  user.value.logout();
};

const fetchMetadata = async () => {
  try {
    const response = await fetch(`${URL}get-metadata`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.value.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) throw new Error('載入失敗');
    
    const metadata = await response.json();
    brandName.value = metadata[0].name;
    tableNum.value = metadata[0].table_num;
    hostname.value = metadata[0].hostname;
  } catch (error) {
    emit('showAlert', 'error', '載入失敗');
    console.error("Fail to get metadata: ", error);
  }
};

const updateMetadata = async () => {
  try {
    const response = await fetch(`${URL}update-metadata`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user.value.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: brandName.value, table_num: tableNum.value }),
    });
    
    if (!response.ok) throw new Error('更新失敗');
    
    const metadata = await response.json();
    brandName.value = metadata[0].name;
    tableNum.value = metadata[0].table_num;
    hostname.value = metadata[0].hostname;
    emit('showAlert', 'success', '更新成功');
  } catch (error) {
    emit('showAlert', 'error', '更新失敗');
    console.error("Fail to update metadata: ", error);
  }
};

// const computedHostname = computed(() => hostname.value);

onMounted(() => {
  user.value.loadUser();
  if (user.value.loggedIn) fetchMetadata();
});
</script>

<style scoped>
.fixed-alert {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 90%;
  width: 800px;
}
</style>
