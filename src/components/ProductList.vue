<template>
  <v-list lines="3">
    <v-list-item
      v-for="product in props.products"
      :key="product.id"
      class="my-3"
    >
      <v-list-item-title class="mb-1">{{ product.name }}</v-list-item-title>
      <v-list-item-subtitle class="mb-1">{{ product.description }}</v-list-item-subtitle>
      <v-list-item-subtitle class="mb-1">${{ product.price }}</v-list-item-subtitle>
      <v-list-item-action>
        <v-btn 
          icon 
          size="25" 
          color="secondary" 
          @click="removeProduct(product.id)"
        >
          <v-icon icon="mdi-minus" size="small" color="white"></v-icon>
        </v-btn>
        <v-btn
          variant="outlined"
          class="mx-2"
          style="pointer-events: none;"
          color="#666666"
        >
          {{ product.quantity }}
        </v-btn>
        <v-btn 
          icon 
          size="25" 
          color="secondary" 
          @click="addProduct(product.id)"
        >
          <v-icon icon="mdi-plus" size="small" color="white"></v-icon>
        </v-btn>
      </v-list-item-action>
      <v-divider class="mt-4"></v-divider>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps(['products']);
const emit = defineEmits(['addProduct', 'removeProduct']);

const addProduct = (product_id) => emit('addProduct', product_id);
const removeProduct = (product_id) => emit('removeProduct', product_id);
</script>
