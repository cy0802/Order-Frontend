<template>
  <v-container>
    <h2 class="text-center my-4">權限管理</h2>

  </v-container>
</template>

<script setup>
  const actionChoices = ref([
    {title: '變更使用者身分', action: 'switch-permission'},
    {title: '刪除使用者', action: 'remove-user'},
    {title: '查詢使用者資料', action: 'search-user'},
  ]);
</script>