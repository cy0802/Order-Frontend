<template>
  <v-btn
    color="secondary"
    class="floating-btn"
    @click="activate"
  >
    <v-icon left>mdi-cart</v-icon>
    查看購物車
  </v-btn>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="mt-2 ml-2">您的商品</v-card-title>
      <v-card-text>
        <p v-if="selectedItems.length === 0" class="ml-2">您的購物車中沒有商品</p>
        <v-list>
          <v-list-item
            v-for="item in selectedItems"
            :key="item.id"
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle class="mb-2">${{ item.price }} / 數量: {{ item.quantity }}</v-list-item-subtitle>
            <v-divider></v-divider>
          </v-list-item>
        </v-list>
        <p v-if="selectedItems.length > 0" class="ml-2">共 $ {{ totalPrice }}</p>
        <!-- TODO: Memorize maximum table id -->
        <v-combobox
          label="您的桌號"
          :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
          v-model="tableId"
          variant="outlined"
          class="mt-4 ml-2"
        ></v-combobox>
      </v-card-text>
      <v-card-actions class="mb-3 mr-3">
        <v-btn 
          color="error" 
          variant="tonal"
          @click="dialog = false"
        >
          關閉
        </v-btn>
        <v-btn 
          color="success"
          variant="tonal"
          @click="order"
        >
          送出訂單
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, inject } from 'vue';
import { OrderRequest, OrderItem } from '@/types/Order.js';
import { addOrder } from '@/services/orderApi.js';

const props = defineProps(['products']);
const user = inject('user');
const emit = defineEmits(['orderSuccess', 'orderError']);

const dialog = ref(false);
const selectedItems = ref([]);
const totalPrice = ref(0);
const tableId = ref(null);

const activate = () => {
  dialog.value = true;
  totalPrice.value = 0;
  selectedItems.value = props.products.reduce((acc, category) => {
    category.products.forEach(product => {
      if (product.quantity > 0) {
        acc.push(product);
        totalPrice.value += product.price * product.quantity;
      }
    });
    return acc;
  }, []);
}
const order = async () => {
  dialog.value = false;
  const orderRequest = new OrderRequest(
    user.value.userId,
    -1, // handler id
    tableId.value,
    selectedItems.value.map(item => 
      new OrderItem(
        item.id,
        item.quantity
      )
    )
  );

  try {
    const err = await addOrder(orderRequest, user.value.accessToken);
    if (!err) {
      emit('orderSuccess', '訂單已成功送出');
    } else {
      emit('orderError', err);
    }
  } catch (error) {
    emit('orderError', '您的訂單未能成功送出，請再試一次');
    console.error(error);
  }
}
</script>

<style scoped>
/* credit to ChatGPT */
.floating-btn {
  position: fixed;
  bottom: 16px; 
  left: 50%; 
  transform: translateX(-50%); 
  width: 91vw;
  height: 40px;
  z-index: 100; 
  border-radius: 5px;
}
</style>