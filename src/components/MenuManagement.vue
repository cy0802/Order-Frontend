<template>
  <v-container>
    <h2 class="text-center my-4">管理菜單</h2>
    <v-row>
      <v-select 
        v-model="selectedCategory" 
        label="顯示類別"
        :items="categoryNames.map(c => c.title)"
      >
      </v-select>

        <v-list>
        <v-list-item
          v-for="(choice, index) in addChoice"
          :key="index"
          @click="handleAddChoiceClick(choice.action)"
        >
          <v-list-item>
            <!-- <v-icon>{{ item.icon }}</v-icon> -->
            {{ choice.title }}
          </v-list-item>
        </v-list-item>
      </v-list>

      <AddProductModal
      v-model="showAddProduct"
      @close="showAddProduct = false"
      @done="useAlert"/>

      <AddCategoryModal
      v-model="showAddCategory"
      @close="showAddCategory = false"
      @done="useAlert"/>

      <AddOptionTypeModal
      v-model="showAddOptionType"
      @close="showAddOptionType = false"
      @done="useAlert"/>
    </v-row>
    
    <v-card  
      v-for="category in menu" 
      :key="category.id"
      class="ma-4"
    >
      <div v-if="selectedCategory === category.name">
        <!-- <v-card-title class="text-center my-2">{{ category.name }}</v-card-title> -->
        <v-card-text>
          <v-row>
            <v-col v-for="item in category.Products" :key="item.id" cols="12">
              <v-card 
                variant="outlined"
                class="py-4 px-2"
              >
                <v-card-title>
                  <v-row>
                    <v-col>
                      <v-text-field v-model="item.name" label="品項名稱"></v-text-field>
                      <v-text-field v-model="item.price" label="價格"></v-text-field>
                      <v-textarea v-model="item.description" label="產品敘述"></v-textarea>
                      <v-select 
                        v-model="item.available" 
                        label="供應中"
                        :items="[{'title': '是', 'value': true}, {'title': '否', 'value': false}]"
                      >
                      </v-select>
                      <v-container>
                        <p class="font-weight-regular text-body-1">客製化選項：</p>
                        <v-row>
                          <v-col v-for="option in productOptionStatus[item.id]" :key="option.id" cols="4">
                            <v-checkbox 
                              :label="option.name"
                              v-model="option.status"
                              @click="toggleOption(option.id, option.name, item.id)"
                            >
                            </v-checkbox>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-col>
                  </v-row>
                </v-card-title>
                <v-card-actions class="ml-2">
                  <v-btn variant="tonal" color="success" @click="saveChanges(item)">確認更改</v-btn>
                  <v-btn variant="tonal" color="error" @click="cancelChanges()">取消</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
  import { computed, ref, onMounted, inject, defineEmits, provide } from 'vue';
  import AddProductModal from './AddProductModal.vue';
  import AddCategoryModal from './AddCategoryModal.vue';
  import AddOptionTypeModal from './AddOptionTypeModal.vue';

  const emit = defineEmits(['showAlert']);
  const user = inject('user');
  const URL = `http://${window.location.hostname}/api/menu-management/`;

  const menu = ref([]);
  const allOptions = ref([]);
  const optionItems = ref([]);

  const productOptionStatus = ref([]); // {product_id, option_id, status}
  const selectedCategory = ref(null); // 目前選中的類別

  const showAddCategory = ref(false);
  const showAddProduct = ref(false);
  const showAddOptionType = ref(false);
  
  const fetchMenu = async () => {
    try {
      const response = await fetch(`${URL}show-menu`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        emit('showAlert', 'error', 'Failed to fetch menu');
      }
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
      optionItems.value = allOptions.value.map((option) => ({ title: option.name, value: option.id }));
    } catch (error) {
      console.error('Error fetching options: ', error);
    }
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
      if (!response.ok){ 
        emit('showAlert', 'error', '更新失敗，請稍後再試');
      }
      const updatedItem = await response.json();
      const category = menu.value.find((c) => c.Products.some((p) => p.id === item.id));
      if (category) {
        const productIndex = category.Products.findIndex((p) => p.id === item.id);
        if (productIndex !== -1) category.Products[productIndex] = updatedItem;
      }
      emit('showAlert', 'success', '菜單變更成功');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error updating item: ', error);
      emit('showAlert', 'error', '更新失敗，請稍後再試');
    }
  };
  
  const cancelChanges = () => {
    emit('showAlert', 'error', '變更已取消');
  };

  const toggleOption = (optionId, optionName, productId) => { // {id, name}, product_id
    // initial status is false
    const status = productOptionStatus.value[productId].find((opt) => opt.id === optionId).status;
    menu.value.forEach((category) => {
      category.Products.forEach((product) => {
        if (product.id === productId && !status) {
          product.Option_Types.push({ id: optionId, name: optionName });
        } else if (product.id === productId && status) {
          product.Option_Types = product.Option_Types.filter((opt) => opt.id !== optionId);
        }
      });
    });
    console.log("toggle option menu: ", menu.value);
  };

  const fetchData = async () => {
    await Promise.all([fetchMenu(), fetchOption()]);
    calculateProductOptionStatus();
  }

  const calculateProductOptionStatus = () => {
    productOptionStatus.value = {}; // Initialize as an empty object
    
    // Iterate through the menu and calculate the option statuses for each product
    menu.value.forEach((category) => {
      category.Products.forEach((product) => {
        productOptionStatus.value[product.id] = allOptions.value.map((option) => {
          const status = product.Option_Types?.some((opt) => opt.id === option.id) || false;
          return { id: option.id, name: option.name, status }; // Add { option_id, status } for each option
        });
      });
    });
  };

  // 計算 category.name 列表
  const categoryNames = computed(() => {
    return menu.value.map(category => ({title: category.name, id: category.id}));
  });

  const addChoice = computed( () => [
    {title: "品項", action: "product"},
    {title: "類別", action: "category"},
    {title: "客製化選項", action: "option"},
  ]);

  const handleAddChoiceClick = (choice) => {
    if (choice === "product") {
      showAddProduct.value = true;
    }
    else if (choice === "category") {
      showAddCategory.value = true;
    }
    else {
      showAddOptionType.value = true;
    }
  };

  const useAlert = (type, msg) => {
    emit('showAlert', type, msg);
    fetchData();
  };

  provide('categoryNames', categoryNames);
  // provide('showAddProduct', showAddProduct);
  provide('URL', URL);
  provide('user', user);
  provide('optionItems', optionItems);
  
  onMounted(() => {
    fetchData();
  });
  
</script>


<style scoped>
</style>