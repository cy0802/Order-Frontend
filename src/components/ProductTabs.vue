<template>
  <div>
    <v-card>
      <v-tabs
        v-model="tab"
        color="primary"
      >
        <v-tab 
          v-for="category in products" 
          :key="category.category_id"
          :value="category.category_id"
        >{{ category.category }}</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item 
          v-for="category in products"
          :key="category.category_id"
          :value="category.category_id"
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
      :userId="userId"
      :userToken="userToken"
      @orderSuccess="orderSuccess"
      @orderError="orderError"
    />
  </div>
</template>

<script>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import ProductList from './ProductList.vue';
import CartDialog from './CartDialog.vue';

export default {
  name: 'ProductTabs',
  components: {
    ProductList,
    CartDialog
  },
  props: {
    userId: {
      type: Number,
      default: null
    },
    userToken: {
      type: String,
      default: null
    }
  },
  setup() {
    const products = ref([]);
    const tab = ref(null);
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products');
        response.data.forEach(category => {
          category.products.forEach(product => {
            product.quantity = 0;
          });
        })
        products.value = response.data;
        if (products.value.length > 0) {
          tab.value = products.value[0].category_id;
        }
      } catch (error) {
        console.error(error);
      }
    };

    onMounted(() => {
      fetchProducts();
    });

    return { products, tab };
  },
  methods: {
    addProduct(product_id) {
      const product = this.products.find(category => category.products.find(product => product.id === product_id));
      const productIndex = product.products.findIndex(product => product.id === product_id);
      product.products[productIndex].quantity++;
    },
    removeProduct(product_id){
      const product = this.products.find(category => category.products.find(product => product.id === product_id));
      const productIndex = product.products.findIndex(product => product.id === product_id);
      if (product.products[productIndex].quantity > 0) {
        product.products[productIndex].quantity--;
      }
    },
    orderSuccess(msg) {
      this.$emit('showAlert', 'success', msg);
    },
    orderError(msg) {
      this.$emit('showAlert', 'error', msg);
    }
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
  height: 50px;
  z-index: 100; 
  border-radius: 5px;
}
</style>