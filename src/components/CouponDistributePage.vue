<template>
  <v-container>
    <h2 class="text-center my-4">折價券分發</h2>

    <v-select
      @click="getCouponTypes"
      width="300px"
      v-model="selectedCoupon"
      :items="couponType.coupon_types"
      item-title="name"
      item-value="id"
      label="選擇優惠券"
      variant="outlined"
    >
      <template v-slot:item="{ props, item }">
        <v-list-item v-bind="props">
          <v-tooltip
            activator="parent"
            location="end"
            max-height="300px"
            :open-delay="100"
          >
            <v-col>
              <p>名稱：{{ item.raw.name }}</p>
              <p>有效期限：{{ formatDate(item.raw.expire) }}</p>
              <p>
                優惠：{{ formatDiscount(item.raw.type, item.raw.discount,
                item.raw.percent_off) }}
              </p>
            </v-col>
          </v-tooltip>
        </v-list-item>
      </template>
    </v-select>
    <v-row>
      <v-btn @click="distributeCoupon" :class="{ 'not-working-btn': (selectedUsers.length === 0) || (!selectedCoupon) }">發送折價券</v-btn>
    </v-row>

    <v-card class="pa-4 mt-4">
      <v-row>
        <v-col cols="5">
          <v-text-field
            v-model="targetUser.name"
            label="使用者名稱"
            dense
            outlined
          ></v-text-field>
        </v-col>
        <v-col cols="5">
          <v-text-field
            v-model="targetUser.email"
            label="使用者 Email"
            dense
            outlined
          ></v-text-field>
        </v-col>
        <v-col cols="2" class="d-flex align-center">
          <v-btn color="primary" @click="searchCustomer">搜尋</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- 使用者清單 -->
    <v-card class="mt-4 pa-4">
      <v-container>
        <!-- 標題列 -->
        <v-row>
          <v-col cols="1">
            <v-checkbox
              v-model="allSelected"
              @change="toggleSelectAll"
              density="compact"
            ></v-checkbox>
          </v-col>
          <v-col cols="2"><p>使用者名稱</p></v-col>
          <v-col cols="4"><p>Email</p></v-col>
          <v-col cols="2"><p>權限</p></v-col>
        </v-row>
        <v-divider class="my-2"></v-divider>

        <!-- 使用者列表 -->
        <v-row
          v-for="(candidate, index) in candidateUsers"
          :key="index"
          class="user-row align-center"
          :class="{ 'selected-user': selectedUsers.includes(candidate.id) }"
        >
          <v-col cols="1">
            <v-checkbox
              v-model="selectedUsers"
              :value="candidate.id"
              density="compact"
            ></v-checkbox>
          </v-col>
          <v-col cols="2"><p>{{ candidate.name }}</p></v-col>
          <v-col cols="4"><p>{{ candidate.email }}</p></v-col>
          <v-col cols="2">
            <p>
              {{ candidate.permission === 'clerk' ? '店員' :
              candidate.permission === 'customer' ? '顧客' :
              candidate.permission === 'admin' ? '管理員' : '' }}
            </p>
          </v-col>
          <v-col cols="2">
            <v-btn>檢視優惠券</v-btn>
          </v-col>
        </v-row>
        <v-divider class="my-2"></v-divider>
      </v-container>
    </v-card>
  </v-container>
</template>

<script setup>
  import { ref, inject, defineEmits, computed } from 'vue'

  const URL = `${window.location.protocol}//${window.location.hostname}/api/coupons/`
  const emit = defineEmits(['showAlert'])
  const user = inject('user')

  const couponType = ref([])
  const selectedCoupon = ref('')
  const targetUser = ref({
    name: '',
    email: '',
  })

  const selectedUsers = ref([])
  const candidateUsers = ref([])

  const getCouponTypes = async () => {
    try {
      const response = await fetch(`${URL}get-coupon-types`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        emit('showAlert', 'error', '加載失敗，請稍後再試')
      }

      couponType.value = await response.json()
    } catch (error) {
      emit('showAlert', 'error', '加載失敗，請稍後再試')
      console.error(
        'failed to fetch coupon types (CouponDistributionPage): ',
        error
      )
    }
  }

  const searchCustomer = async () => {
    try {
      const response = await fetch(`${URL}search-customer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: targetUser.value.name,
          email: targetUser.value.email,
        }),
      })

      if (!response.ok) {
        emit('showAlert', 'error', '查詢失敗，請稍後再試')
      }

      candidateUsers.value = await response.json()
    } catch (error) {
      emit('showAlert', 'error', '查詢失敗，請稍後再試')
      console.error(
        'failed to search customer (CouponDistributionPage): ',
        error
      )
    }
  }

  const distributeCoupon = async () => {
    try {
      const response = await fetch(`${URL}distribute-coupon`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponId: selectedCoupon.value,
          userIds: selectedUsers.value,
        }),
      })

      if (!response.ok) {
        emit('showAlert', 'error', '查詢失敗，請稍後再試')
      }

      candidateUsers.value = await response.json()
    } catch (error) {
      emit('showAlert', 'error', '查詢失敗，請稍後再試')
      console.error(
        'failed to search customer (CouponDistributionPage): ',
        error
      )
    }
  }

  const formatDiscount = (type, discount, percent_off) => {
    if (type === 'discount') {
      return `折扣 ${discount ? discount : ''} 元`
    }
    if (type === 'percent_off') {
      return `單張訂單打 ${percent_off * 100} 折`
    }
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // 是否全選
  const allSelected = computed(
    () => selectedUsers.value.length === candidateUsers.value.length
  )

  // 切換全選與取消全選
  const toggleSelectAll = () => {
    if (allSelected.value) {
      selectedUsers.value = []
    } else {
      selectedUsers.value = candidateUsers.value.map(user => user.id)
    }
  }
</script>

<style scoped>
  .not-working-btn {
    color: lightgray !important;
    pointer-events: none; /* 禁止滑鼠點擊 */
    cursor: default; /* 滑鼠移上去時不提示可點擊 */
  }
</style>