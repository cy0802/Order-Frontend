<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
  >
    <v-card>
      <v-card-title class="mx-2 mt-3">{{ props.product.name }}</v-card-title>
      <v-card-subtitle class="mx-2">${{ props.product.price }}</v-card-subtitle>
      <v-card-text>{{ props.product.description }}</v-card-text>
      <v-card-text
        v-for="optionType in props.product.options"
        :key="optionType.id"
      >
        <v-radio-group
          :label="optionType.name"
          :rules="[v => !!v || '選擇一個選項']"
          inline
          v-model="selectedOptions[optionType.id]"
        >
          <v-radio
            v-for="option in optionType.options"
            :key="option.id"
            :label="option.name + ' (+$' + option.price + ')'"
            :value="option.id"
          ></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="error"
          @click="dialog = false"
          variant="tonal"
          class="mb-2"
        >關閉</v-btn>
        <v-btn
          color="success"
          @click="addToCart()"
          variant="tonal"
          class="mr-2 mb-2"
        >加入購物車</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineModel, defineProps, ref } from 'vue';
const props = defineProps(['product']);
const orderItems = defineModel('orderItems', {
  type: Array,
});
const dialog = defineModel('dialog', {
  type: Boolean,
});
const selectedOptions = ref({});
console.log(props.product);

const addToCart = () => {
  orderItems.value.push({
    productId: props.product.id,
    quantity: 1,
    optionIds: Object.values(selectedOptions.value),
  })
  dialog.value = false;
  selectedOptions.value = {};
  console.log(orderItems.value);
}
</script>