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
          :text="category.category"
        ></v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item 
          v-for="category in products"
          :key="category.category_id"
          :value="category.category_id"
        >
          <ProductList 
            :products="category.products"
            @addToCart="addToCart"
          />
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import ProductList from './ProductList.vue';

export default {
  name: 'ProductTabs',
  components: {
    ProductList
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
    addToCart(product) {
      console.log('Add to cart:', product);
    }
  }
}
</script>
