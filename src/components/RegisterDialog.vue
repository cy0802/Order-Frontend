<template>
  <v-btn 
    class="mr-3"
    @click='activate'
  >
    註冊
  </v-btn>
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
              label="姓名"
              :rules="notEmpty"
              required
              variant="outlined"
              class="mb-2"
            ></v-text-field>
            <v-text-field
              v-model="phone"
              label="手機號碼"
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
        <v-card-actions class='mb-2 mr-4'>
          <v-btn color="error" variant="tonal" text @click="dialog = false">取消</v-btn>
          <v-btn color="success" variant="tonal" text @click="register">註冊</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    emits: ['register'],
    setup(_, { emit }) {
      const dialog = ref(false);
      const valid = ref(false);
      const email = ref('');
      const name = ref('');
      const phone = ref('');
      const password = ref('');
      const password2 = ref('');
      const emailRules = [
        v => !!v || '此欄位不可為空',
        v => /.+@.+\..+/.test(v) || '請輸入正確的電子信箱地址',
      ];

      const passwordRules = [
        v => !!v || '請填入密碼',
        v => v === password.value || '密碼不一致',
      ];

      const notEmpty = [
        v => !!v || '此欄位不可為空',
      ];
  
      const register = () => {
        if (valid.value) {
          emit('register', email.value, name.value, phone.value, password.value);
          dialog.value = false;
        }
      };
  
      const activate = () => {
        dialog.value = true;
        email.value = '';
        password.value = '';
      };

      return {
        name,
        phone,
        password2,
        emailRules,
        passwordRules,
        dialog,
        valid,
        email,
        password,
        register,
        activate,
        notEmpty,
      };
    },
  };
  </script>
  
  <style scoped>
  </style>