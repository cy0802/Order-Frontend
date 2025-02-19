<template>
  <v-container>
    <h2 class="text-center my-4">權限管理</h2>

    <!-- 動作按鈕區塊 -->
    <v-row class="mb-4">
      <v-btn
        v-for="(choice, index) in actionChoices"
        :key="index"
        :class="{ 'not-working-btn': !choosenUser.user?.id }"
        class="mx-2"
        @click="handleActionClick(choice.action)"
      >
        {{ choice.title }}
      </v-btn>
    </v-row>

    <!-- 更改權限彈窗 -->
    <SwitchPermissionModal
      v-model="showSwitchPermission" 
      @close="showSwitchPermission = false" 
      @done="useAlert" />

    <!-- 停權確認彈窗 -->
    <v-dialog max-width="300" v-model="showTerminateUser">
      <v-card class="pa-4">
        <v-col>
          <p class="text-center">{{ choosenUser.user?.isTerminated ? '確定要恢復此帳號嗎？' :
                                    '確定要停用此帳號嗎？' }}</p>
        </v-col>
        <v-card-actions>
          <v-btn variant="tonal" color="success" class="mx-2" @click="terminateUser">是</v-btn>
          <v-btn variant="tonal" color="error" class="mx-2" @click="showTerminateUser = false">否</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- get user data 視窗 -->
    <GetUserData
      v-model="showGetUserData"
      @close="showGetUserData=false" />

    <!-- 搜尋欄 -->
    <v-card class="pa-4 mt-4">
      <v-row>
        <v-col cols="5">
          <v-text-field v-model="targetUser.name" label="使用者名稱" dense outlined></v-text-field>
        </v-col>
        <v-col cols="5">
          <v-text-field v-model="targetUser.email" label="使用者 Email" dense outlined></v-text-field>
        </v-col>
        <v-col cols="2" class="d-flex align-center">
          <v-btn color="primary" @click="searchUser">搜尋</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- 使用者清單 -->
    <v-card class="mt-4 pa-4">
      <v-container>
        <v-row>
          <v-col cols="2"><p>使用者名稱</p></v-col>
          <v-col cols="4"><p>email</p></v-col>
          <v-col cols="2"><p>權限</p></v-col>
        </v-row>
        <v-divider class="my-2"></v-divider>
        <v-row
          v-for="(candidate, index) in candidateUsers"
          :key="index"
          class="user-row align-center"
          :class="{ 'selected-user': choosenUser.user?.id === candidate.id }"
        >
          <v-col cols="2"><p>{{ candidate.name }}</p></v-col>
          <v-col cols="4"><p>{{ candidate.email }}</p></v-col>
          <v-col cols="2"><p>{{ candidate.permission === 'clerk' ? '店員' :
                                candidate.permission === 'customer' ? '顧客' :
                                candidate.permission === 'admin' ? '管理員' : '' }}</p></v-col>
          <v-col cols="2">
            <v-btn color="success" @click="handleChooseUser(candidate, index)">選擇</v-btn>
          </v-col>
          <v-col v-if="candidate?.isTerminated" cols="2"><p color="red">已停權</p></v-col>
          <v-divider class="my-2"></v-divider>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script setup>
  import {ref, defineEmits, inject, provide} from 'vue';
  import SwitchPermissionModal from './SwitchPermissionModal.vue';
  import GetUserData from './GetUserData.vue';

  const URL = 'http://localhost:8000/api/permission-management/';
  const emit = defineEmits(['showAlert']);
  const user = inject('user');
  const showSwitchPermission = ref(false);
  const showTerminateUser = ref(false);
  const showGetUserData = ref(false);

  const actionChoices = ref([
    {title: '變更使用者身分', action: 'switchPermission'},
    {title: '停權 / 復權', action: 'terminateUser'},
    {title: '查看使用者資料', action: 'getUserData'},
  ]);

  const targetUser = ref({
    name: '',
    email: '',
  });

  const choosenUser = ref({user: null, index: -1});  // index 是cadidateUsers 的 index，方便更新前端用的：P

  const candidateUsers = ref([]);

  provide('URL', URL);
  provide('user', user);
  provide('choosenUser', choosenUser);
  provide('candidateUsers', candidateUsers);

  // for get user data
  const userHistory = ref([]);
  const userCoupon = ref([]);

  provide('userHistory', userHistory);
  provide('userCoupon', userCoupon);

  const fetchUserData = async() => {
    try {
      const response = await fetch(`${URL}admin-get-user-history`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: choosenUser.value.user.id,
        }),
      });

      if(!response.ok) {
        emit('showAlert', 'error', '查詢歷史訂單失敗');
      }

      userHistory.value = await response.json();

      const response2 = await fetch(`${URL}admin-get-user-coupon`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: choosenUser.value.user.id,
        }),
      });

      if(!response2.ok) {
        emit('showAlert', 'error', '查詢折價券失敗');
      }

      userCoupon.value = await response2.json();

    } catch (error) {
      console.error("fail to det user data: ", error);
    }
  }
  ////

  const searchUser = async() => {
    choosenUser.value = { user: null, index: -1 };
    try {
      const response = await fetch(`${URL}search-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: targetUser.value.name,
          email: targetUser.value.email
        }),
      });

      if(!response.ok) {
        emit('showAlert', 'error', 'Failed to search user');
      }

      candidateUsers.value = await response.json();
    } catch(error) {
      console.error('Error saerching user: ', error);
    }
  }

  const handleActionClick = (action) => {
    if(action === 'switchPermission') {
      showSwitchPermission.value = true;
    }
    else if (action === 'terminateUser') {
      showTerminateUser.value = true;
    }
    else if(action === 'getUserData') {
      showGetUserData.value = true;
      fetchUserData();
    }
  }

  const handleChooseUser = (canidate, index) => {
    choosenUser.value.user = canidate;
    choosenUser.value.index = index;
  }

  const terminateUser = async () => {
    if (choosenUser.value.user.id === user.value.userId) {
      console.error('current user try to terminate itself', user.userId);
      emit('showAlert', 'error', '您無法對自己的帳號進行操作');
      return ;
    }
    try {
      const response = await fetch(`${URL}terminate-user`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({id: choosenUser.value.user.id, 
          isTerminated: !choosenUser.value.user.isTerminated,
        }),
      });
      if(response.ok) {
        emit('showAlert', 'success', '操作成功');
      }
      showTerminateUser.value = false;
      candidateUsers.value[choosenUser.value.index].isTerminated = !choosenUser.value.user.isTerminated;
    }
    catch (error) {
      console.error("fail to terminate user");
      emit('showAlert', 'error', '操作失敗，請稍後再試')
    }
  }

  const useAlert = (type, msg) => {
    emit('showAlert', type, msg);
  }

</script>

<style scoped>
.selected-user {
  /* border: 2px solid green; */
  background-color: #e6ffe6;
}

.not-working-btn {
  color: lightgray !important;
  pointer-events: none; /* 禁止滑鼠點擊 */
  cursor: default; /* 滑鼠移上去時不提示可點擊 */
}

.user-row {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
</style>