<template>
    <div>
      <h1>管理菜單</h1>
      <div v-if="notification.visible" :class="['notification', notification.type]">
        {{ notification.message }}
      </div>
  
      <div v-if="menu.length > 0" id="id-container">
        <div v-for="category in menu" :key="category.id" class="category-block">
          <h2 class="category-title">{{ category.name }}</h2>
          <div v-for="item in category.Products" :key="item.id" class="item-card">
            <label>品項名稱:</label>
            <input v-model="item.name" class="item-name-input" />
  
            <label>價格:</label>
            <input v-model="item.price" class="item-name-input" />
  
            <label>產品敘述:</label>
            <textarea v-model="item.description" class="editable-input"></textarea>
  
            <label>供應中:</label>
            <select v-model="item.available" class="select-input">
              <option :value="true">是</option>
              <option :value="false">否</option>
            </select>
  
            <label>客製化選項:</label>
            <div class="options-container">
              <div v-for="option in item.Option_Types" :key="option.id" class="option-box">
                <span @click="removeOption(item, option)" class="remove-icon">×</span>
                {{ option.name }}
              </div>
              <div class="add-option" @click="toggleShowOption">+ 新增客製化選項</div>
  
              <div v-if="showOptionList" class="option-list">
                <div
                  v-for="option in allOptions"
                  :key="option.id"
                  @click="addOption(option, item.id)"
                  class="option-item"
                >
                  {{ option.name }}
                </div>
              </div>
            </div>
  
            <div class="item-actions">
              <button @click="saveChanges(item)">確認更改</button>
              <button @click="cancelChanges(item)">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, inject, defineEmits } from 'vue';
  
  const emit = defineEmits(['showAlert']);
  const user = inject('user');
  const URL = 'http://localhost:8000/api/menu-management/';
  const notification = reactive({
    message: '',
    type: '',
    visible: false,
  });
  const menu = ref([]);
  const allOptions = ref([]);
  const showOptionList = ref(false);
  
  const fetchMenu = async () => {
    try {
      const response = await fetch(`${URL}show-menu`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch menu');
      menu.value = await response.json();
    } catch (error) {
      console.error('Error fetching menu: ', error);
    }
  };
  
  const fetchOption = async () => {
    try {
      const response = await fetch(`${URL}get-all-options`, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch options');
      allOptions.value = await response.json();
    } catch (error) {
      console.error('Error fetching options: ', error);
    }
  };
  
  const toggleShowOption = () => {
    showOptionList.value = !showOptionList.value;
    if (showOptionList.value) fetchOption();
  };
  
  const saveChanges = async (item) => {
    try {
      const response = await fetch(`${URL}update-item/${item.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('更新失敗');
      const updatedItem = await response.json();
      const category = menu.value.find((c) => c.Products.some((p) => p.id === item.id));
      if (category) {
        const productIndex = category.Products.findIndex((p) => p.id === item.id);
        if (productIndex !== -1) category.Products[productIndex] = updatedItem;
      }
    //   showNotification('菜單變更成功', 'success');
      emit('showAlert', 'success', '菜單變更成功');
    } catch (error) {
      console.error('Error updating item: ', error);
    //   showNotification('更新失敗，請稍後再試', 'error');
      emit('showAlert', 'error', '更新失敗，請稍後再試');
    }
  };
  
  const cancelChanges = () => {
    fetchMenu();
    // showNotification('變更已取消', 'error');
    emit('showAlert', 'error', '變更已取消');
  };
  
  const removeOption = (item, option) => {
    item.Option_Types = item.Option_Types.filter((o) => o.id !== option.id);
  };
  
  const addOption = (option, productId) => {
    const category = menu.value.find((c) => c.Products.some((p) => p.id === productId));
    if (!category) return;
    const product = category.Products.find((p) => p.id === productId);
    if (!product) return;
    if (product.Option_Types.some((t) => t.id === option.id)) return;
    product.Option_Types.push({ id: option.id, name: option.name });
  };
  
//   const showNotification = (message, type) => {
//     notification.message = message;
//     notification.type = type;
//     notification.visible = true;
//     setTimeout(() => (notification.visible = false), 5000);
//   };
  
  onMounted(() => {
    fetchMenu();
    fetchOption();
  });
  </script>


<style scoped>
h1 {
    text-align: center;
}

h3 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
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
.notification.success {
    background-color: #4caf50;
}
.notification.error {
    background-color: #f44336;
}

.category-block {
    width: 90%; /* 佔父容器的90% */
    max-width: 350px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    border: 2px solid #000;
    padding: 10px;
    border-radius: 10px;
}

.category-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
}

.item-card {
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-name-input {
    width: 90%; /* 佔父容器的90% */
    max-width: 315px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    padding: 8px;
    font-size: 14px;
    height: auto;
}

.editable-input {
    width: 90%; /* 佔父容器的90% */
    max-width: 315px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    padding: 8px;
    font-size: 14px;
    height: 150px;
}

.select-input {
    width: 90%;
    max-width: 315px;
    padding: 8px;
    margin: 10px auto;
    font-size: 14px;
    display: block;
}

.options-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.option-box {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    background-color: #e8e8e8;
    border-radius: 5px;
}

.remove-icon {
    margin-right: 5px;
    color: #d9534f;
    cursor: pointer;
}

.add-option {
    cursor: pointer;
    color: #5cb85c;
    font-weight: bold;
    margin-top: 10px;
}

.item-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
}

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

.label {
    display: block;
    margin-bottom: 4px;
}

.option-list {
  margin-top: 5px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
}

.option-item {
  padding: 5px;
  cursor: pointer;
}

.option-item:hover {
  background-color: #eee;
}
</style>