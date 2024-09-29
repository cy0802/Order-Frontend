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
        <v-form ref="form" v-model="valid">
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
export default {
  emits: ['login'],
  data() {
    return {
      dialog: false,
      valid: false,
      email: '',
      password: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid',
      ]
    };
  },
  methods: {
    login() {
      if (this.$refs.form.validate()) {
        this.$emit('login', this.email, this.password );
        this.dialog = false;
      }
    },
    activate() {
      this.dialog = true;
      this.email = '';
      this.password = '';
    }
  },
};
</script>

<style scoped>
</style>