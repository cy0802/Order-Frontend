<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title>王品集團</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <ProductTabs />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import ProductTabs from './components/ProductTabs.vue';
export default {
  name: 'App',
  components: {
    ProductTabs
  }
}
</script>

<style>
</style>
