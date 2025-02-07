<template>
  <v-dialog max-width="600">
    <v-card>
      <v-card-title class="h6">更改權限</v-card-title>
      <v-col>
        <p>暱稱：{{ choosenUser.user.name }}</p>
        <p>email：{{ choosenUser.user.email }}</p>
        <p>目前權限：{{ permissionTitle }}</p>
        <v-select
          v-model="selectedPermission"
          label="選擇更改後的權限"
          :items="permissionChoices"
          item-title="title"
          item-value="value"
        ></v-select>
        <v-row>
          <v-btn @click="switchPermission">確認更改</v-btn>
          <v-btn @click="emit('close')">關閉</v-btn>
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref, defineEmits, inject, computed } from 'vue'
  const emit = defineEmits('close', 'done');
  const permissionChoices = ref([
    { title: '店員', value: 'clerk' },
    { title: '顧客', value: 'costumer' },
    { title: '管理員', value: 'admin' },
  ]);
  const selectedPermission = ref('');
  const choosenUser = inject('choosenUser');
  const user = inject('user');
  const URL = inject('URL');
  const candidateUsers = inject('candidateUsers');

  const permissionTitle = computed(() => 
    choosenUser.value.user.permission === 'clerk' ? '店員' :
    choosenUser.value.user.permission === 'costumer' ? '顧客' :
    choosenUser.value.user.permission === 'admin' ? '管理員' : '');

  const switchPermission = async () => {
    try {
      const response = await fetch(`${URL}switch-permission`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: choosenUser.value.user.id,
          permission: selectedPermission.value,
        }),
      });

      if(response.ok) {
        emit('done', 'success', '成功變更權限');
      }

      choosenUser.value.permission = selectedPermission.value;
      candidateUsers.value[choosenUser.value.index].permission = selectedPermission.value;
    } catch (error) {
        console.error('Error switching permission: ', error);
        emit('done', 'error', '變更權限失敗，請稍後再試');
    }
  }
</script>
