<template>
  <v-card class="pa-4" max-width="400">
    <!-- 標題 -->
    <v-card-title class="text-h5">訂單詳細資訊</v-card-title>
    <v-divider></v-divider>

    <!-- 訂單資訊 -->
    <v-card-text>
      <p><strong>桌號:</strong> {{ order.table_id }}</p>

      <!-- 商品資訊 -->
      <div v-for="product in order.Order_Products" :key="product.id" class="mb-4">
        <p>
          <strong>{{ product.Product.name }}</strong>
          <span> ${{ product.Product.price }}</span>
          <span> / 數量: {{ product.quantity }}</span>
        </p>
        <v-list v-if="product.Options.length" dense>
          <v-list-item v-for="option in product.Options" :key="option.name">
            <v-list-item-content>
              <small class="grey--text">
                {{ option.Option_Type.name }}: {{ option.name }} (+${{ option.price }})
              </small>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>

      <!-- 折扣資訊 -->
      <div v-if="order.Coupons.length" class="mb-4">
        <p><strong>折扣:</strong></p>
        <v-list dense>
          <v-list-item v-for="coupon in order.Coupons" :key="coupon.name">
            <v-list-item-content>
              <small>{{ coupon.name }}</small>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>

      <!-- 小計 -->
      <v-divider></v-divider>
      <p class="mt-3"><strong>小計:</strong> ${{ order.price }}</p>
    </v-card-text>

    <!-- 動作按鈕 -->
    <v-card-actions class="justify-space-between">
      <v-btn color="grey" variant="tonal" @click="$emit('close')">關閉</v-btn>
      <v-btn v-if="isUnpaid" variant="tonal" color="primary" @click="confirmCheckout">結帳</v-btn>
    </v-card-actions>
  </v-card>

  <!-- 確認視窗 -->
  <v-dialog v-model="showConfirmDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">確認結帳</v-card-title>
      <v-card-text>確定要結帳嗎？</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="grey" text @click="handleCancel">取消</v-btn>
        <v-btn color="primary" text @click="handleConfirm">確定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineEmits, defineProps } from "vue";

// 父組件傳入的 props
const props = defineProps({
  order: { type: Object, required: true },
  isUnpaid: { type: Boolean, required: true },
});

// 向父組件發送事件
const emit = defineEmits(["close", "checkout"]);

// 控制確認視窗的顯示
const showConfirmDialog = ref(false);

// 確認結帳的處理函數
const confirmCheckout = () => {
  showConfirmDialog.value = true; // 顯示確認視窗
};

const handleConfirm = () => {
  emit("checkout", props.order.id); // 發送 checkout 事件
  showConfirmDialog.value = false; // 關閉確認視窗
};

const handleCancel = () => {
  showConfirmDialog.value = false; // 關閉確認視窗
};
</script>
