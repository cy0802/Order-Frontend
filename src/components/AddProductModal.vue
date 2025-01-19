<template>
  <v-dialog max-width="600">
    <v-card>
      <v-card-title class="h6">新增品項</v-card-title>
      <v-select 
        v-model="newProduct.category"
        label="類別"
        :items="categoryNames"
        item-value="id"
        item-title="title"
      ></v-select>
      <v-col>
        <v-text-field v-model="newProduct.name" label="品項名稱"></v-text-field>
        <v-text-field v-model="newProduct.price" label="價格"></v-text-field>
        <v-textarea v-model="newProduct.description" label="產品敘述"></v-textarea>
        <v-select 
          v-model="newProduct.available" 
          label="供應中"
          :items="[{'title': '是', 'value': true}, {'title': '否', 'value': false}]"
        >
        </v-select>
        <v-container>
          <p class="font-weight-regular text-body-1">客製化選項：</p>
          <v-row>
            <v-col v-for="option in optionItems" :key="option.value" cols="4">
              <v-checkbox 
                :label="option.title"
                v-model="optionStatus[option.value]"
                @click="toggleOption(option.value)"
              >
              </v-checkbox>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-btn variant="tonal" color="success" @click="addNewProduct()">新增</v-btn>
      <v-btn variant="tonal" color="error" @click="close()">關閉</v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import {ref, inject, defineEmits} from "vue";
  
  // const showAddProduct = inject('showAddProduct');
  const categoryNames = inject('categoryNames');  // {title: category.name, id: category.id}
  const URL = inject('URL');
  const user = inject('user');
  const optionItems = inject('optionItems');  // { title: option.name, value: option.id }
  const emit = defineEmits(['close', 'done']);

  // const newProduct = ref(['category', 'price', 'name', 'description', 'available']);
  const newProduct = ref({  /////////////
    category: '', price: '', name: '', description: '', available: false, options: [],
  });
  const optionStatus = ref([]);

  const initialOptionStatus = () => {
    optionItems.value.forEach(key => {
      optionStatus[key] = false;
    });
  };

  const toggleOption = async (optionId) => {
    optionStatus[optionId] = optionStatus[optionId] ? true : false;
  };

  const computeFinalOption = () => {  ///////////
    newProduct.value.options = optionItems.value
      .filter(option => optionStatus.value[option.value])
      .map(option => option.value);
  };

  const close = () => {
    newProduct.value = ref({  /////////////
      category: '', price: '', name: '', description: '', available: false, options: [],
    });
    initialOptionStatus();
    emit('close');
  };

  const addNewProduct = async () => {
    computeFinalOption();
    console.log('add new product request body: ', newProduct.value);
    try {
      const response = await fetch(`${URL}add-new-product`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct.value),
      });
      if (!response.ok){ 
        emit('done', 'error', '新增失敗，請稍後再試');
      } else {
        emit('done', 'success', '新增成功');
      }
    } catch (error) {
      console.error('Error updating item: ', error);
      emit('done', 'error', '更新失敗，請稍後再試');
    }
    close();
  };
</script>