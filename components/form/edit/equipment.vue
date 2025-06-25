<template>
  <Form class="flex flex-col gap-5 mt-1" @submit="editEquipment">
    <FloatLabel variant="on">
      <InputText
        id="equipment-name"
        v-model.lazy="equipmentName"
        type="text"
        class="w-full"
        required
      />
      <label for="equipment-name">Nama Alat</label>
    </FloatLabel>
    
    <FloatLabel variant="on">
      <InputNumber
        id="equipment-quantity"
        v-model.lazy="equipmentQuantity"
        input-id="integeronly"
        class="w-full"
        :min="1"
        required
      />
      <label for="equipment-quantity">Jumlah</label>
    </FloatLabel>
    
    <FloatLabel variant="on">
      <Select
        id="equipment-category"
        v-model="selectCategory"
        :options="categoryOptions"
        optionLabel="label"
        class="w-full"
        required
      />
      <label for="equipment-category">Kategori Alat</label>
    </FloatLabel>

    <!-- Image Upload Section -->
    <div class="field">
      <label class="block mb-2 text-sm font-medium">Gambar Peralatan</label>
      <ImageUpload 
        ref="imageUploadRef"
        v-model="equipmentImage" 
        folder="eq"
        alt-text="Gambar peralatan"
        @upload-success="onImageUploadSuccess"
        @upload-error="onImageUploadError"
        @file-removed="onImageRemoved"
        @temp-file-uploaded="onTempFileUploaded"
        @temp-file-cleaned="onTempFileCleaned"
      />
    </div>
    
    <Button
      type="submit"
      :loading="submitting"
      :disabled="!isFormValid"
      class="px-5 py-3 bg-fuchsia-600 text-white font-bold rounded cursor-pointer transition-all duration-300 ease-in-out"
      hover="bg-fuchsia-700"
      label="Ubah"
    />
  </Form>
</template>

<script lang="ts" setup>
const toast = useToast()
const equipmentStore = useEquipmentStore()
const catStore = useCategoryStore()

const props = defineProps({
  equipmentId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["edit-complete"])

// Form data
const equipmentName = ref("")
const equipmentQuantity = ref<number>()
const selectCategory = ref()
const equipmentImage = ref<string | null>(null)
const imageKey = ref<string>()
const submitting = ref(false)
const categoryOptions = ref<{ label: string; value: string }[]>([])
const imageUploadRef = ref()
const originalImageUrl = ref<string>() // Track original image
const tempFileKeys = ref<string[]>([])

// Form validation
const isFormValid = computed(() => {
  return equipmentName.value && 
         equipmentQuantity.value && 
         equipmentQuantity.value > 0 && 
         selectCategory.value
})

onMounted(async () => {
  await catStore.getCategory()
  categoryOptions.value = catStore.category.map((cat) => ({
    label: cat.name,
    value: cat.category_id,
  }))

  // Load existing equipment data
  const equipment = equipmentStore.equipment.find(
    (eq) => eq.equipment_id === props.equipmentId
  )

  if (equipment) {
    equipmentName.value = equipment.name
    equipmentQuantity.value = equipment.quantity
    selectCategory.value = {
      label: equipment.category.category_name,
      value: equipment.category.category_id,
    }
    equipmentImage.value = equipment.imgUrl || null
    originalImageUrl.value = equipment.imgUrl || undefined // Store original
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Alat tidak ditemukan",
      life: 3000,
    })
  }
})

const onTempFileUploaded = (key: string) => {
  tempFileKeys.value.push(key);
  console.log("Temporary file tracked:", key);
};

const onTempFileCleaned = () => {
  console.log("Temporary file cleaned");
};

// Handle image upload success
const onImageUploadSuccess = (data: { url: string; key: string }) => {
  imageKey.value = data.key
}

// Handle image upload error
const onImageUploadError = (error: string) => {
  console.error('Image upload error:', error)
}

// Handle image removal
const onImageRemoved = () => {
  imageKey.value = undefined
}

const editEquipment = async () => {
  if (!isFormValid.value) {
    toast.add({
      severity: "warn",
      summary: "Perhatian",
      detail: "Harap lengkapi semua field yang wajib diisi",
      life: 3000,
    })
    return
  }

  submitting.value = true

  try {
    const res = await $fetch("/api/equipment/edit", {
      method: "PUT",
      body: {
        id: props.equipmentId,
        name: equipmentName.value,
        quantity: equipmentQuantity.value,
        category_id: selectCategory.value?.value,
        imgUrl: equipmentImage.value,
      },
      credentials: "include",
    })

    if (res.statusCode === 200) {
      // Confirm the uploaded file if changed
      if (imageUploadRef.value && equipmentImage.value !== originalImageUrl.value) {
        imageUploadRef.value.confirmFile();
      }

      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Alat berhasil diedit",
        life: 3000,
      })
      emit("edit-complete")
    } else {
      throw new Error(res.message || 'Gagal mengedit peralatan')
    }

  } catch (error: any) {
    console.error('Edit equipment error:', error)
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.data?.message || "Terjadi kesalahan saat mengedit peralatan",
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

// Cleanup when component unmounts
const cleanup = async () => {
  if (imageUploadRef.value) {
    await imageUploadRef.value.cleanupTempFile();
  }
};

// Expose cleanup method for parent
defineExpose({
  cleanup
});

onBeforeUnmount(async () => {
  await cleanup();
});
</script>

<style></style>