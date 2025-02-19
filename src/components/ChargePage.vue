<template>
  <div>
    <v-card-title class="text-center my-4">結帳系統</v-card-title>
    <v-card>
    <v-tabs v-model="filter" grow color="primary">
      <v-tab value="unpaid">尚未結帳</v-tab>
      <v-tab value="paid">歷史訂單</v-tab>
    </v-tabs>

    <v-tabs-items v-model="filter">
      <v-tab-item>
        <div class="order-list">
          <div
            v-for="(order, index) in filteredOrders"
            :key="order.id"
            class="order-tile"
          >
            <v-list-item outlined>
              <v-list-item-title class="headline">
                桌號: {{ order.table_id }}
              </v-list-item-title>
              <v-divider></v-divider>
              <p class="my-4"><strong>客人:</strong> {{ order.user ? order.user.name : "無" }}</p>
              <p class="my-4"><strong>負責人:</strong> {{ order.handler ? order.handler.name : "無" }}</p>
            </v-list-item>

            <v-btn
              icon
              @click.stop="showOrderDetails(order)"
              style="margin-left: 16px;"
              class="my-4"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            
            <!-- 分隔線 -->
            <v-divider 
              v-if="index < filteredOrders.length - 1"
              class="my-4"
            ></v-divider>
            <OrderDetailsModal
              v-if="selectedOrder === order"
              :order="selectedOrder"
              :is-unpaid="filter === 'unpaid'"
              @close="selectedOrder = null"
              @checkout="handleCheckout"
            />
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </v-card>

    <!-- <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      :is-unpaid="filter === 'unpaid'"
      @close="selectedOrder = null"
      @checkout="handleCheckout"
    /> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, defineEmits } from "vue";
import axios from "axios";
import OrderDetailsModal from "./OrderDetailsModal.vue";
const emit = defineEmits(['showAlert']);

const URL = `http://${window.location.hostname}/api/charge-page/`;

const user = inject('user');
const orders = ref([]); // 從後端獲取的所有訂單
const filter = ref("unpaid"); // 預設篩選條件
const selectedOrder = ref(null); // 被選中的訂單

// 從後端獲取訂單資料
const fetchOrders = async () => {
  try {
    const response = await axios.get(URL);
    orders.value = response.data;
  } catch (error) {
    emit('showAlert', 'error', '訂單加載失敗，請再試一次')
    console.error("Failed to fetch orders:", error);
  }
};

// 計算篩選後的訂單
const filteredOrders = computed(() =>
  orders.value.filter((order) =>
    filter.value === "unpaid" ? !order.paid_state : order.paid_state
  )
);

// 設定篩選條件
// const filterOrders = (type) => {
//   filter.value = type;
// };

// 顯示訂單詳情
const showOrderDetails = (order) => {
  if(selectedOrder.value === order) {
    selectedOrder.value = null;
  }
  else {
    selectedOrder.value = order;
  }
};

// 處理結帳
const handleCheckout = async (orderId) => {
  try {
    // const userId = sessionStorage.getItem("user_id"); // 假設目前使用者的 ID
    const response = await fetch(URL + "confirm-charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.value.accessToken}`, // 在 headers 中添加 token
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderId, // 傳送的資料
        paid_state: true,
        user_id: user.value.userId,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json(); // 解析後端返回的錯誤訊息
      emit('showAlert', 'error', errorData.message || "結帳失敗，請再試一次")
      throw new Error(errorData.message || "Failed to checkout");
    }
    emit('showAlert', 'success', '結帳成功');
    selectedOrder.value = null;
    await fetchOrders(); // 更新訂單資料
  } catch (error) {
    emit('showAlert', 'error', error || "結帳失敗，請再試一次");
    console.error("Failed to checkout:", error);
  }
};

// 在組件加載時調用
onMounted(fetchOrders);
</script>

<style>

</style>
