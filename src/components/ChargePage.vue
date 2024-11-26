<template>
  <div>
    <div class="filters">
      <button
        :class="{ active: filter === 'unpaid' }"
        @click="filterOrders('unpaid')"
      >
        尚未結帳
      </button>
      <button
        :class="{ active: filter === 'paid' }"
        @click="filterOrders('paid')"
      >
        歷史訂單
      </button>
    </div>

    <div class="order-list">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-tile"
        @click="showOrderDetails(order)"
      >
        <p>桌號: {{ order.table_id }}</p>
        <p>客人: {{ order.user ? order.user.name : "無" }}</p>
        <p>負責人: {{ order.handler ? order.handler.name : "無" }}</p>
      </div>
    </div>

    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      :is-unpaid="filter === 'unpaid'"
      @close="selectedOrder = null"
      @checkout="handleCheckout"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, defineEmits } from "vue";
import axios from "axios";
import OrderDetailsModal from "./OrderDetailsModal.vue";
const emit = defineEmits(['showAlert']);

const URL = "http://localhost:8000/api/charge-page/";

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
const filterOrders = (type) => {
  filter.value = type;
};

// 顯示訂單詳情
const showOrderDetails = (order) => {
  selectedOrder.value = order;
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
.filters {
  display: flex;
  gap: 10px;
}
.filters button {
  padding: 10px 20px;
  cursor: pointer;
}
.filters .active {
  background-color: #4caf50;
  color: white;
}
.order-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.order-tile {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
}
.order-tile:hover {
  background-color: #f0f0f0;
}
</style>
