<template>
  <v-list lines="3">
    <v-list-item
      v-for="product in props.products"
      :key="product.id"
      class="my-3"
      @click="emit('addProduct', product)"
    >
      <v-img
        :src="'https://order-system-picture-storage.s3.us-east-1.amazonaws.com/' + product.image"
        max-height="150"
        class="mb-3"
        position="left center"
      ></v-img>
      <v-list-item-title class="mb-1">{{ product.name }}</v-list-item-title>
      <v-list-item-subtitle class="mb-1">{{ product.description }}</v-list-item-subtitle>
      <v-list-item-subtitle class="mb-1">${{ product.price }}</v-list-item-subtitle>
      <v-divider class="mt-4"></v-divider>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps(['products']);
const emit = defineEmits(['addProduct']);
</script>
