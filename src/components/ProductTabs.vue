<template>
  <div>
    <v-card>
      <v-tabs
        v-model="tab"
        color="primary"
      >
        <v-tab 
          v-for="category in products" 
          :key="category.id"
          :value="category.id"
        >{{ category.name }}</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item 
          v-for="category in products"
          :key="category.id"
          :value="category.id"
        >
          <ProductList 
            :products="category.products"
            @addProduct="addProduct"
            @removeProduct="removeProduct"
          />
        </v-window-item>
      </v-window>
    </v-card>
    <CartDialog
      :products="products"
      @orderSuccess="orderSuccess"
      @orderError="orderError"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, defineEmits } from 'vue';
import ProductList from './ProductList.vue';
import CartDialog from './CartDialog.vue';
import { getProducts } from '@/services/productApi.js';

const products = ref([]);
const tab = ref(0);
const emit = defineEmits(['showAlert']);

const fetchProducts = async () => {
  const { err, productCategories } = await getProducts();
  if (err) {
    // Handle error
    emit('showAlert', 'error', err);
    return;
  }
  products.value = productCategories;
}

onMounted(() => {
  fetchProducts();
});

const addProduct = (product_id) => {
  const product = products.value.find(category => category.products.find(product => product.id === product_id));
  const productIndex = product.products.findIndex(product => product.id === product_id);
  product.products[productIndex].quantity++;
}

const removeProduct = (product_id) => {
  const product = products.value.find(category => category.products.find(product => product.id === product_id));
  const productIndex = product.products.findIndex(product => product.id === product_id);
  if (product.products[productIndex].quantity > 0) {
    product.products[productIndex].quantity--;
  }
}

const orderSuccess = (msg) => {
  emit('showAlert', 'success', msg);
}

const orderError = (msg) => {
  emit('showAlert', 'error', msg);
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
  height: 50px;
  z-index: 100; 
  border-radius: 5px;
}
</style>