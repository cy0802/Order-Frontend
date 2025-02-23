<template>
  <v-btn class="mr-3" @click="activate">
    登入
  </v-btn>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-text class="mt-4">
        <v-form ref="form" v-model="valid" @keyup.enter="login">
          <v-text-field
            v-model="email"
            label="Email"
            :rules="emailRules"
            required
            variant="outlined"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
            variant="outlined"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class='mb-2 mr-4'>
        <v-btn color="error" variant="tonal" text @click="dialog = false">取消</v-btn>
        <v-btn color="success" variant="tonal" text @click="login">登入</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import User from '@/types/User';
import { ref, defineEmits, inject } from 'vue';

const emit = defineEmits(['showAlert', 'fetchMetadata']);
const user = inject('user');
const URL = inject('URL');

const dialog = ref(false);
const valid = ref(false);
const email = ref('');
const password = ref('');
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
];

const login = async () => {
  if (valid.value) {
      try {
        const response = await fetch(`${URL}login-tenant`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.value.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        });

        if (!response.ok) {
          emit('showAlert', 'error', '註冊失敗');
        }

        const responseData = await response.json();
        const loginedUser = new User(
          responseData.id,
          responseData.name,
          responseData.phone,
          responseData.email,
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
};

const activate = () => {
  dialog.value = true;
  email.value = '';
  password.value = '';
};
</script>

<style scoped>
</style>
