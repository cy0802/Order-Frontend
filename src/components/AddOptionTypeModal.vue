<template>
  <v-dialog max-width="800">
    <v-card>
      <v-card-title class="h6">新增客製化選項</v-card-title>
      <v-col>
        <v-text-field v-model="newOptionType" label="類型名稱"></v-text-field>
      </v-col>
      <v-col>
        <div>
          <div
            v-for="(option, index) in options"
            :key="index"
            style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;"
          >
            <v-text-field
              v-model="option.name"
              label="選項名稱"
              placeholder="輸入選項名稱"
            ></v-text-field>
            <!-- <v-text-field              @input="validateOptions()"

              v-model="option.type"
              label="選項類型"
              placeholder="輸入類型"
            ></v-text-field> -->
            <v-text-field
              v-model="option.price"
              label="價格"
              placeholder="輸入價格"
              type="number"
            ></v-text-field>
            <v-btn
              icon
              color="error"
              @click="removeOption(index)"
              v-if="options.length > 1"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-btn
            outlined
            color="primary"
            @click="addOption"
            style="margin-top: 8px;"
          >
            <v-icon left>mdi-plus</v-icon> 新增選項
          </v-btn>
        </div>
      </v-col>
      <v-card-actions>
        <v-btn variant="tonal" color="success" @click="addNewOptionType()">新增</v-btn>
        <v-btn variant="tonal" color="error" @click="close()">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, inject, defineEmits } from "vue";

const URL = inject("URL");
const user = inject("user");
const emit = defineEmits(["close", "done"]);

const newOptionType = ref("");
const options = ref([{ name: "", price: "" }]);

const close = () => {
  newOptionType.value = "";
  options.value = [{ name: "", price: "" }];
  emit("close");
};

const addOption = () => {
  options.value.push({ name: "", price: "" });
};

const removeOption = (index) => {
  options.value.splice(index, 1); // 刪除指定索引的選項
};

// const validateOptions = () => {
//   // 當空白選項超過兩個時，自動刪除多餘的空選項
//   const emptyCount = options.value.filter(
//     (option) => option.name.trim() === ""
//   ).length;
//   if (emptyCount > 2) {
//     options.value = options.value.filter(
//       (option, index) =>
//         !(option.name.trim() === "") || index < 2
//     );
//   }
// };

const addNewOptionType = async () => {
  // 過濾掉完全空白的選項
  const validOptions = options.value.filter(
    (option) => option.name.trim() !== ""
  );

  if (newOptionType.value.trim() === "" || validOptions.length === 0) {
    emit("done", "error", "類型名稱或選項不能為空");
    return;
  }

  try {
    const response = await fetch(`${URL}add-new-option-type`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user.value.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        optionType: newOptionType.value.trim(),
        options: validOptions.map((option) => ({
          name: option.name.trim(),
          // type: option.type.trim(),
          price: parseFloat(option.price) || 0, // 預設價格為 0
        })),
      }),
    });
    if (!response.ok) {
      emit("done", "error", "新增失敗，請稍後再試");
    } else {
      emit("done", "success", "新增成功");
    }
  } catch (error) {
    console.error("Error adding option type: ", error);
    emit("done", "error", "新增失敗，請稍後再試");
  }
  close();
};
</script>
