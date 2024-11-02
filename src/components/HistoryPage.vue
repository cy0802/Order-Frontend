<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-center my-4">歷史訂單</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item-group>
                <v-list-item
                  v-for="order in orders"
                  :key="order.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>訂購時間：{{ formatDate(order.createdAt) }}</v-list-item-title>
                    <v-list-item-subtitle>總價格：${{ order.price }} / {{ order.paid_state ? '已結帳' : '尚未付款' }}</v-list-item-subtitle>
                    <v-list>
                      <v-list-item
                        v-for="item in order.Order_Products"
                        :key="item.id"
                      >
                        <v-list-item-content>
                          <v-list-item-title>{{ item.Product.name }} * {{ item.quantity }}</v-list-item-title>
                          <v-list-item-subtitle>單件價格：${{ item.Product.price }} / {{ item.serve_state ? '已出餐' : '尚未出餐' }}</v-list-item-subtitle>
                          <v-list-item-subtitle></v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-list-item-content>
                  <v-divider></v-divider>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import axios from 'axios';
import { inject, ref, onMounted, defineEmits } from 'vue';

const user = inject('user');
const orders = ref([]);
const emit = defineEmits(['showAlert']);

const fetchOrderHistory = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/orders/history', {
      headers: {
        Authorization: `Bearer ${user.value.accessToken}`,
      }
    });
    orders.value = response.data;
  } catch (error) {
    if (error.response.status === 401) {
      emit('showAlert', 'error', '請登入以查看歷史訂單');
      return;
    }
    emit('showAlert', 'error', '發生錯誤，請再試一次');
  }
};

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

onMounted(() => {
  fetchOrderHistory();
});


</script>

<style scoped>
</style>