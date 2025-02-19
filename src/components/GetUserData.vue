<template>
  <v-dialog max-width="600">
    <v-card>
      <v-tabs v-model="tab">
        <v-tab>帳號資訊</v-tab>
        <v-tab>歷史訂單紀錄</v-tab>
        <v-tab>優惠券</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item>
          <v-col>
              <p>暱稱：{{ choosenUser.user.name }}</p>
              <p>email：{{ choosenUser.user.email }}</p>
              <p>電話號碼：{{ choosenUser.user.phone ? choosenUser.user.phone : '無資料' }}</p>
              <p>目前權限：{{ permissionTitle }}</p>
              <p>註冊時間：{{ formatDate(choosenUser.user.createdAt) }}</p>
          </v-col>
        </v-window-item>
        
        <v-window-item>
          <!-- thank you ycy @@ -->
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-title class="text-center my-4">歷史訂單</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item
                        v-for="order in userHistory"
                        :key="order.id"
                      >
                        <v-list-item-title>訂購時間：{{ formatDate(order.createdAt) }}</v-list-item-title>
                        <v-list-item-subtitle>總價格：${{ order.price }} / {{ order.paid_state ? '已結帳' : '尚未付款' }}</v-list-item-subtitle>
                        <v-list>
                          <v-list-item
                            v-for="item in order.Order_Products"
                            :key="item.id"
                          >
                            
                            <v-list-item-title>
                              {{ item.Product.name }} * {{ item.quantity }}
                              <v-chip
                                v-for="option in item.Options"
                                :key="option.id"
                                size="small"
                                class="mb-1 ml-1"
                              >
                                {{ option.name }} (+${{ option.price }})
                              </v-chip>
                            </v-list-item-title>
                            <v-list-item-subtitle>單件價格：${{ item.Product.price }} / {{ (item.serve_state == 'completed') ? '已出餐' : '尚未出餐' }}</v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                        <v-divider></v-divider>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-window-item>

        <v-window-item>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-card variant="elevated">
                  <!-- <v-card-title class="text-center my-4">您的優惠卷</v-card-title> -->
                  <v-card-text>
                    <v-row>
                      <v-col
                        v-for="coupon in userCoupon"
                        :key="coupon.id"
                        cols="12"
                      >
                        <v-card class="mx-auto" variant="elevated" color="secondary">
                          <v-card-title class="text-h6 font-weight-regular mt-1">{{ coupon.Coupon.name }}</v-card-title>
                          <v-card-subtitle class="pb-2">
                            {{ coupon.used ? '已使用' : '未使用' }}
                          </v-card-subtitle>
                          <v-card-text>
                            <p>有效期限：{{ formatDate(coupon.Coupon.expire) }}</p>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-window-item>
      </v-window>

      <v-card-actions>
        <v-btn @click="emit('close')">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import {inject, defineEmits, ref, computed} from 'vue';
  
  const emit = defineEmits('close');
  const choosenUser = inject('choosenUser');
  const userHistory = inject('userHistory');
  const userCoupon = inject('userCoupon');
  const tab = ref(0);
  const permissionTitle = computed(() => 
    choosenUser.value.user.permission === 'clerk' ? '店員' :
    choosenUser.value.user.permission === 'customer' ? '顧客' :
    choosenUser.value.user.permission === 'admin' ? '管理員' : '');

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
</script>