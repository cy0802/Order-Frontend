<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card variant="elevated">
          <v-card-title class="text-center my-4">您的優惠卷</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="coupon in coupons"
                :key="coupon.id"
                cols="12"
              >
                <v-card class="mx-auto" variant="elevated" color="secondary">
                  <v-card-title class="text-h6 font-weight-regular mt-1">{{ coupon.couponName }}</v-card-title>
                  <v-card-subtitle class="pb-2">
                    {{ coupon.used ? '已使用' : '未使用' }}
                  </v-card-subtitle>
                  <v-card-text>
                    <p>有效期限：{{ coupon.expire }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

import { computed, inject } from 'vue';

const user = inject('user');
const coupons = computed(() => user.value.coupons);

</script>