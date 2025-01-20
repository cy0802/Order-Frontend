<template>
  <v-dialog max-width="600">
    <v-card>
      <v-card-title class="h6">新增類別</v-card-title>
      <v-col>
        <v-text-field v-model="newCategory" label="名稱"></v-text-field>
      </v-col>
      <v-btn variant="tonal" color="success" @click="addNewCategory()">新增</v-btn>
      <v-btn variant="tonal" color="error" @click="close()">關閉</v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import {ref, inject, defineEmits} from "vue";

  const URL = inject('URL');
  const user = inject('user');
  const emit = defineEmits('close', 'done');
  const newCategory = ref('');

  const close = () => {
    newCategory.value = '';
    emit('close');
  };

  const addNewCategory = async () => {
    try {
      const response = await fetch(`${URL}add-new-category`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({category: newCategory.value}),
      });
      if (!response.ok){ 
        emit('done', 'error', '新增失敗，請稍後再試');
      } else {
        emit('done', 'success', '新增成功');
      }
    } catch (error) {
      console.error('Error updating item: ', error);
      emit('done', 'error', '新增失敗，請稍後再試');
    }
    close();
  };
</script>