<template>
    <div>
        <h1>訂單列表</h1>
        <div v-if="notification.visible" :class="['notification', notification.type]">
            {{ notification.message }}
        </div>
        <div id="controls">
            <div>
                <label>
                    <input type="checkbox" v-model="selectedStates.pending" @change="fetchOrders" checked>
                    Pending
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.preparing" @change="fetchOrders" checked>
                    Preparing
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.waiting" @change="fetchOrders" checked>
                    Waiting for Delivery
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.completed" @change="fetchOrders" checked>
                    Completed
                </label>
            </div>
            <button @click="toggleDisplayMode">{{ displayMode }}</button>
        </div>
        <div id="orders-container">
            <!-- Grouped Mode -->
            <div v-if="displayMode === 'grouped'">
                <div v-for="(orders, tableId) in groupedOrders" :key="tableId" class="table-block">
                    <h3>桌號: {{ tableId }}</h3>
                    <div v-for="order in orders" :key="order.order_id" class="order-item">
                        <p>品項: {{ order.Product.name }}</p>
                        <div v-for="option in order.Options" :key="option.name">
                            <p>{{ option.Option_Type.name }}: {{ option.name }}</p>
                        </div>
                        <label :for="'state-select-' + order.id">State:</label>
                        <select :id="'state-select-' + order.id" v-model="order.serve_state" @change="updateOrderState(order.id)">
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="waiting for delivery">Waiting for Delivery</option>
                            <option value="completed">Completed</option>
                        </select>
                        <button @click="confirmDelete(order.id)">Delete</button>
                        <p>目前負責人: {{ order.handler_id || "無" }}</p>
                    </div>
                </div>
            </div>
            <!-- Sorted Mode -->
            <div v-else>
                <div v-for="order in sortedOrders" :key="order.id" class="time-block">
                    <p>點餐時間: {{ order.createdAt }}</p>
                    <p>Item: {{ order.Product.name }}</p>
                    <div v-for="option in order.Options" :key="option.name" class="time-child">
                        <p>{{ option.Option_Type.name }}: {{ option.name }}</p>
                    </div>
                    <label :for="'state-select-' + order.id">State:</label>
                    <select :id="'state-select-' + order.id" v-model="order.serve_state" @change="updateOrderState(order.id)">
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="waiting for delivery">Waiting for Delivery</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button @click="confirmDelete(order.id)">Delete</button>
                    <p>目前負責人: {{ order.handler_id || "無" }}</p>
                </div>
            </div>
        </div>
        <div v-if="showDeleteDialog" class="delete-dialog">
            <p>確定要取消嗎？</p>
            <button @click="deleteOrder">是</button>
            <button @click="cancelDelete">否</button>
        </div>
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

onMounted(fetchOrders);
</script>


<style scoped>

.table-block {
    width: 90%; /* 佔父容器的90% */
    max-width: 350px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    border: 2px solid #000;
    padding: 10px;
    border-radius: 10px;
}
.order-item, .time-block {
    width: 90%; /* 佔父容器的90% */
    max-width: 300px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    background-color: #ffffff; /* 卡片背景色 */
    border-radius: 10px;       /* 圓角 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.662); /* 陰影效果 */
    padding: 15px;             /* 內邊距 */
    margin-bottom: 15px;       /* 每個卡片之間的間距 */
    transition: transform 0.2s ease-in-out; /* 動態效果 */
}

.order-item:hover, .time-block:hover {
    transform: translateY(-5px); /* 滑過時微微上移 */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.998); /* 增強陰影 */
}

/* 標題樣式 */
h3 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
}

/* 選項和訂單資訊的樣式 */
.order-item p, .time-block p {
    margin: 5px 0;
    color: #555;
}

/* 按鈕樣式 */
button {
    background-color: #4e4e4e; /* 按鈕背景色 */
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #3a3a3a; /* 滑過時顏色變深 */
}

/* 狀態選擇的樣式 */
select {
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-top: 5px;
    width: 100%;
}

select:hover {
    background-color: #b6b6b6;
}

/* 卡片內的按鈕調整 */
.order-item button, .time-block button {
    margin-top: 10px;
    display: inline-block;
    width: 100%; /* 按鈕寬度調整，使其充滿卡片的寬度 */
}

.notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 16px;
    color: #fff;
    z-index: 1000;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

.delete-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: white;
    border: 2px solid #000;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    z-index: 1000; /* 讓對話框出現在其他元素上方 */
}

.notification.success {
    background-color: #4caf50;
}

.notification.error {
    background-color: #f44336;
}

</style>
