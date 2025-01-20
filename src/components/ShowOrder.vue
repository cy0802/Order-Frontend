<template>
    <div>
        <v-card-title class="text-center my-4">訂單列表</v-card-title>
        <div v-if="notification.visible" :class="['notification', notification.type]">
            {{ notification.message }}
        </div>
        <v-container>
            <!-- 控制區域 -->
            <v-row class="align-center" justify="center">
            <v-checkbox
                v-model="selectedStates.pending"
                label="Pending"
                @change="fetchOrders"
                :value="true"
                hide-details
                class="mr-4"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedStates.preparing"
                label="Preparing"
                @change="fetchOrders"
                :value="true"
                hide-details
                class="mr-4"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedStates.waiting"
                label="Waiting for Delivery"
                @change="fetchOrders"
                :value="true"
                hide-details
                class="mr-4"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedStates.completed"
                label="Completed"
                @change="fetchOrders"
                :value="true"
                hide-details
            ></v-checkbox>
            </v-row>

            <v-row class="mt-4" justify="center">
            <v-btn
                @click="toggleDisplayMode"
                variant="outlined"
                color="primary"
            >
                {{ displayMode }}
            </v-btn>
            </v-row>
        </v-container>
        
        <div id="orders-container">
            <!-- Grouped Mode -->
            <div v-if="displayMode === 'grouped'">
                <v-container id="orders-container">
                <!-- Grouped Mode -->
                <v-row v-if="displayMode === 'grouped'" justify="center">
                <v-col
                    v-for="(orders, tableId) in groupedOrders"
                    :key="tableId"
                    cols="12"
                    md="6"
                >
                    <v-card
                    outlined
                    class="table-block"
                    elevation="4"
                    >
                    <v-card-title class="headline">
                        桌號: {{ tableId }}
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <div
                        v-for="(order, index) in orders"
                        :key="order.order_id"
                        class="order-item"
                        >
                        <p class="my-4"><strong>品項:</strong> {{ order.Product.name }}</p>
                        <div v-for="option in order.Options" :key="option.name">
                            <p class="my-4">
                            <strong>{{ option.Option_Type.name }}:</strong> {{ option.name }}
                            </p>
                        </div>
                        <p class="my-4"><strong>數量:</strong> {{ order.quantity }}</p>
                        <v-select
                            :id="'state-combobox-' + order.id"
                            v-model="order.serve_state"
                            @blur="updateOrderState(order.id)"
                            :items="['pending', 'preparing', 'waiting for delivery', 'completed']"
                            label="State"
                            outlined
                            class="mt-4 ml-2"
                        ></v-select>
                        <v-btn
                            @click="confirmDelete(order.id)"
                            color="error"
                            variant="outlined"
                            class="mt-2"
                        >
                            刪除
                        </v-btn>
                        <p class="my-4"><strong>目前負責人:</strong> {{ order.Order.handler ? order.Order.handler.name : "無" }}</p>
                        <!-- 分界線 -->
                        <v-divider
                            v-if="index < orders.length - 1"
                            class="my-4"
                        ></v-divider>
                        </div>
                    </v-card-text>
                    </v-card>
                </v-col>
                </v-row>
            </v-container>
            </div>
            <!-- Sorted Mode -->
            <div v-else>
                <v-container>
                    <v-row justify="center">
                    <v-col
                        v-for="order in sortedOrders"
                        :key="order.id"
                        cols="12"
                    >
                        <v-card
                        outlined
                        elevation="2"
                        class="time-block mb-4"
                        >
                        <v-card-text>
                            <p class="my-4"><strong>點餐時間:</strong> {{ formatDate(order.createdAt) }}
                             / 桌號: {{ order.Order.table_id }}</p>
                            <p class="my-4"><strong>品項:</strong> {{ order.Product.name }}</p>
                            <p class="my-4"><strong>數量:</strong> {{ order.quantity }}</p>
                            <div
                            v-for="option in order.Options"
                            :key="option.name"
                            class="time-child"
                            >
                            <p class="my-4">
                                <strong>{{ option.Option_Type.name }}:</strong> {{ option.name }}
                            </p>
                            </div>
                            <v-select
                            :id="'state-combobox-' + order.id"
                            v-model="order.serve_state"
                            @blur="updateOrderState(order.id)"
                            :items="['pending', 'preparing', 'waiting for delivery', 'completed']"
                            label="State"
                            outlined
                            class="mt-4 ml-2"
                            ></v-select>
                            <v-btn
                            @click="confirmDelete(order.id)"
                            color="error"
                            variant="outlined"
                            class="mt-2"
                            >
                            刪除
                            </v-btn>
                            <p class="my-4"><strong>目前負責人:</strong> {{ order.Order.handler ? order.Order.handler.name : "無" }}</p>
                        </v-card-text>
                        </v-card>
                    </v-col>
                    </v-row>
                </v-container>
            </div>
        </div>
        <v-dialog v-model="showDeleteDialog" max-width="300">
            <v-card>
            <v-card-text>
                <p>確定要取消嗎？</p>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn color="error" @click="cancelDelete" variant="tonal">
                否
                </v-btn>
                <v-btn color="success" @click="deleteOrder" variant="tonal">
                是
                </v-btn>
            </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, defineEmits } from "vue";

const emit = defineEmits(['showAlert']);

const URL = "http://localhost:8000";
const user = inject('user');

const displayMode = ref("grouped");
const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedStates = ref({
    pending: true,
    preparing: true,
    waiting: true,
    completed: true,
});
const notification = ref({
    message: "",
    type: "",
    visible: false,
});
const showDeleteDialog = ref(false);
const orderIdToDelete = ref(null);

const groupedOrders = computed(() => {
    return orders.value.reduce((groups, order) => {
        if (!groups[order.Order.table_id]) {
            groups[order.Order.table_id] = [];
        }
        groups[order.Order.table_id].push(order);
        return groups;
    }, {});
});

const sortedOrders = computed(() => {
    return [...orders.value].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
});

const toggleDisplayMode = () => {
    displayMode.value = displayMode.value === "grouped" ? "sorted" : "grouped";
    fetchOrders();
};

const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await fetch(URL + "/api/admin/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedStates.value),
        });
        if (!response.ok) throw new Error("Failed to fetch orders");
        orders.value = await response.json();
    } catch (err) {
        console.error(err);
        error.value = "Failed to fetch orders";
    } finally {
        loading.value = false;
    }
};

const updateOrderState = async (orderId) => {
    const order = orders.value.find((order) => order.id === orderId);
    try {
        const response = await fetch(URL + `/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${user.value.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ state: order.serve_state }),
        });
        if (!response.ok) throw new Error("Failed to update order state");
        // showNotification(`Order ${orderId} state updated to ${order.serve_state}`, "success");
        emit('showAlert', 'success', `Order ${orderId} state updated to ${order.serve_state}`);
        fetchOrders();
    } catch (err) {
        console.error(err);
        // showNotification("Failed to update order state", "error");
        emit('showAlert', 'error', "Failed to update order state", "error");
    }
};

// const showNotification = (message, type) => {
//     notification.value = { message, type, visible: true };
//     setTimeout(() => {
//         notification.value.visible = false;
//     }, 5000);
// };

const confirmDelete = (orderId) => {
    showDeleteDialog.value = true;
    orderIdToDelete.value = orderId;
};

const deleteOrder = async () => {
    try {
        const response = await fetch(URL + `/api/admin/orders/${orderIdToDelete.value}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${user.value.accessToken}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) throw new Error("Failed to delete order");
        // showNotification(`Order ${orderIdToDelete.value} has been deleted.`, "success");
        emit('showAlert', 'success', `Order ${orderIdToDelete.value} has been deleted.`);
        orders.value = orders.value.filter((order) => order.id !== orderIdToDelete.value);
        fetchOrders();
    } catch (err) {
        console.error(err);
        // showNotification("Failed to delete order", "error");
        emit('showAlert', 'error', "Failed to delete order", "error");
    } finally {
        showDeleteDialog.value = false;
        orderIdToDelete.value = null;
    }
};

const cancelDelete = () => {
    showDeleteDialog.value = false;
    orderIdToDelete.value = null;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

onMounted(fetchOrders);
</script>


<style scoped>



</style>
