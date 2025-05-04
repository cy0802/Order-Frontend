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
        :error="!!validationErrors.category"
        :error-messages="validationErrors.category"
      ></v-select>
      <v-col>
        <v-text-field
          v-model="newProduct.name"
          label="品項名稱"
          :error="!!validationErrors.name"
          :error-messages="validationErrors.name"
        ></v-text-field>
        <v-text-field
          v-model="newProduct.price"
          label="價格"
          :error="!!validationErrors.price"
          :error-messages="validationErrors.price"
          type="number"
        ></v-text-field>
        <v-textarea
          v-model="newProduct.description"
          label="產品敘述"
        ></v-textarea>
        <v-select
          v-model="newProduct.available"
          label="供應中"
          :items="[{'title': '是', 'value': true}, {'title': '否', 'value': false}]"
        ></v-select>
        <v-file-input
          v-model="productPicture"
          label="上傳圖片"
          accept=".jpg, .png"
        ></v-file-input>
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
      <v-btn variant="tonal" color="success" @click="validateAndAddProduct()">新增</v-btn>
      <v-btn variant="tonal" color="error" @click="close()">關閉</v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, inject, defineEmits } from "vue";

const categoryNames = inject("categoryNames"); // {title: category.name, id: category.id}
const URL = inject("URL");
const user = inject("user");
const optionItems = inject("optionItems"); // { title: option.name, value: option.id }
const emit = defineEmits(["close", "done"]);

const newProduct = ref({
  category: "",
  price: "",
  name: "",
  description: "",
  available: false,
  options: [],
  image_name: "",
});

const productPicture = ref(null);
const validationErrors = ref({
  category: null,
  name: null,
  price: null,
  picture: null,
});

const optionStatus = ref([]);

const initialOptionStatus = () => {
  optionItems.value.forEach((key) => {
    optionStatus[key] = false;
  });
};

const toggleOption = async (optionId) => {
  optionStatus[optionId] = optionStatus[optionId] ? true : false;
};

const computeFinalOption = () => {
  newProduct.value.options = optionItems.value
    .filter((option) => optionStatus.value[option.value])
    .map((option) => option.value);
};

const close = () => {
  newProduct.value = {
    category: "",
    price: "",
    name: "",
    description: "",
    available: false,
    options: [],
    image_name: "",
  };
  productPicture.value = null;
  validationErrors.value = {
    category: null,
    name: null,
    price: null,
    picture: null,
  };
  initialOptionStatus();
  emit("close");
};

const validateInputs = () => {
  let isValid = true;

  // 檢查 category 是否填寫
  if (!newProduct.value.category) {
    validationErrors.value.category = "不得為空";
    isValid = false;
  } else {
    validationErrors.value.category = null;
  }

  // 檢查 name 是否填寫
  if (!newProduct.value.name) {
    validationErrors.value.name = "不得為空";
    isValid = false;
  // 檢查上傳的圖片副檔名是否為 jpg 或 png (如果有上傳圖片)
  if (productPicture.value && !(/\.(jpg|png)$/i.test(productPicture.value.name))) {
    validationErrors.value.picture = "圖片必須為 JPG 或 PNG 格式";
    isValid = false;
  } else {
    validationErrors.value.picture = null;
  }
    isValid = false;
  } else {
    validationErrors.value.picture = null;
  }
  // 檢查 price 是否為合法數字
  if (!newProduct.value.price || isNaN(newProduct.value.price)) {
    validationErrors.value.price = "請輸入有效的價格";
    isValid = false;
  } else {
    validationErrors.value.price = null;
  }
  return isValid;
}

const validateAndAddProduct = async () => {
  if (validateInputs()) {
    if (productPicture.value) {
      newProduct.value.image_name = productPicture.value.name;
    } else {
      newProduct.value.image_name = "";
    }
    computeFinalOption();
    console.log("add new product request body: ", newProduct.value);
    try {
      const response = await fetch(`${URL}add-new-product`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.value.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct.value),
      });
      if (!response.ok) {
        emit("done", "error", "新增失敗，請稍後再試");
      } else {
        // emit("done", "success", "新增成功");
        const data = await response.json();
        const imageUploadUrl = data.imageUploadUrl;
        if (imageUploadUrl) {
          console.log("image upload url: ", imageUploadUrl);
          const uploadResponse = await fetch(imageUploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': productPicture.value.type },
            body: productPicture.value,
          });
          if (!uploadResponse.ok) {
            emit("done", "error", "餐點新增成功，圖片上傳失敗，請稍後再試");
          } else {
            emit("done", "success", "餐點新增成功");
          }
        } else {
          emit("done", "success", "餐點新增成功");
        }
      }
    } catch (error) {
      console.error("Error updating item: ", error);
      emit("done", "error", "更新失敗，請稍後再試");
    }
    close();
  }
};
</script>
