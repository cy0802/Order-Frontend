<template>
  <v-btn 
    icon
    class="ml-7"
    @click='activate'
  >
    <v-icon>mdi-login</v-icon>
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

<script>
import { ref } from 'vue';

export default {
  emits: ['login'],
  setup(_, { emit }) {
    const dialog = ref(false);
    const valid = ref(false);
    const email = ref('');
    const password = ref('');
    const emailRules = [
      v => !!v || 'Email is required',
      v => /.+@.+\..+/.test(v) || 'Email must be valid',
    ];

    const login = () => {
      if (valid.value) {
        emit('login', email.value, password.value);
        dialog.value = false;
      }
    };

    const activate = () => {
      dialog.value = true;
      email.value = '';
      password.value = '';
    };

    return {
      dialog,
      valid,
      email,
      password,
      emailRules,
      login,
      activate,
    };
  },
};
</script>

<style scoped>
</style>