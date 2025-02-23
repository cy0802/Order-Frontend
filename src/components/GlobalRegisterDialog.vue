<template>
  <v-btn class="mr-3" @click="activate"> 註冊 </v-btn>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-text class="mt-4">
        <v-form ref="form" v-model="valid" @keyup.enter="register">
          <v-text-field
            v-model="email"
            label="電子信箱地址"
            :rules="emailRules"
            required
            variant="outlined"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model="name"
            label="店名"
            :rules="notEmpty"
            required
            variant="outlined"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model="hostname"
            label="hostname(小寫)"
            required
            variant="outlined"
          ></v-text-field>
          <v-text-field
              v-model="phone"
              label="店家電話號碼"
              :rules="notEmpty"
              required
              variant="outlined"
              class="mb-2"
            ></v-text-field>
          <v-text-field
            v-model="password"
            label="密碼"
            type="password"
            required
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="password2"
            label="再次確認密碼"
            :rules="passwordRules"
            type="password"
            required
            variant="outlined"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="mb-2 mr-4">
        <v-btn color="error" variant="tonal" text @click="dialog = false"
          >取消</v-btn
        >
        <v-btn color="success" variant="tonal" text @click="register"
          >註冊</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import User from '@/types/User';
  import { ref, defineEmits, inject } from 'vue'
  
  const user = inject('user');
  const URL = inject('URL');
  const emit = defineEmits(['showAlert', 'fetchMetadata']);

  // 使用 ref 管理狀態
  const dialog = ref(false);
  const valid = ref(false);
  const email = ref("");
  const name = ref("");
  const phone = ref("");
  const hostname = ref("");
  const password = ref("");
  const password2 = ref("");

  // 定義規則
  const emailRules = [
    (v) => !!v || "此欄位不可為空",
    (v) => /.+@.+\..+/.test(v) || "請輸入正確的電子信箱地址",
  ];

  const passwordRules = [
    (v) => !!v || "請填入密碼",
    (v) => v === password.value || "密碼不一致",
  ];

  const notEmpty = [(v) => !!v || "此欄位不可為空"];

  // 註冊功能
  const register = async () => {
    if (valid.value) {
      try {
        const response = await fetch(`${URL}register-tenant`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.value.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.value,
            name: name.value,
            phone: phone.value,
            hostname: hostname.value,
            password: password.value,
          }),
        });

        if (!response.ok) {
          emit('showAlert', 'error', '註冊失敗');
        }

        const responseData = await response.json();
        const loginedUser = new User(
          responseData.user.id,
          responseData.user.name,
          responseData.user.phone,
          responseData.user.email,
          true,
          false,
          false,
          responseData.token
        );
        loginedUser.storeUser();
        user.value = loginedUser;
        console.log("user.value after storeUser:", user.value);
        emit('showAlert', 'success', '登入成功');
        emit('fetchMetadata');
      } catch (error) {
        emit('showAlert', 'error', '登入失敗');
        console.error("fail to get user data: ", error);
      }
    }
  }
  // 激活註冊對話框
  const activate = () => {
    dialog.value = true;
    email.value = "";
    password.value = "";
  };
</script>
