<template>
  <Form class="flex flex-col gap-5 mt-1" @submit="addEquipment">
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
      label="Tambah"
    />
  </Form>
</template>

<script lang="ts" setup>
const toast = useToast()
const emit = defineEmits(["equipment-added"])

const catStore = useCategoryStore()
const categoryOptions = ref<{ label: string; value: string }[]>([])

// Form data
const equipmentName = ref("")
const equipmentQuantity = ref<number>(0)
const selectCategory = ref()
const equipmentImage = ref<string | null>(null)
const imageKey = ref<string>()
const submitting = ref(false)
const tempFileKeys = ref<string[]>([]) // Track temporary files
const imageUploadRef = ref()

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
})

// Handle temporary file upload
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

const addEquipment = async () => {
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
    // Prepare form data for multipart upload
    const formData = new FormData()
    formData.append('name', equipmentName.value)
    formData.append('quantity', equipmentQuantity.value.toString())
    formData.append('category_id', selectCategory.value.value.toString())

    // Add image if uploaded
    if (equipmentImage.value && imageKey.value) {
      formData.append('imgUrl', equipmentImage.value)
      formData.append('imgKey', imageKey.value)
    }

    const res = await $fetch("/api/equipment/add", {
      method: "POST",
      body: formData,
      credentials: "include",
    })

    if (res.statusCode === 200) {
      // Confirm the uploaded file (mark as not temporary)
      if (imageUploadRef.value) {
        imageUploadRef.value.confirmFile();
      }

      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Peralatan berhasil ditambahkan",
        life: 3000,
      })

      // Reset form
      resetForm();
      emit("equipment-added")
    } else {
      throw new Error(res.message || 'Gagal menambahkan peralatan')
    }

  } catch (error: any) {
    console.error('Add equipment error:', error)
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: error.message || "Terjadi kesalahan saat menambahkan peralatan",
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  equipmentName.value = ""
  equipmentQuantity.value = 0
  selectCategory.value = null
  equipmentImage.value = null
  imageKey.value = undefined
  tempFileKeys.value = []
}

// Cleanup when component is about to be unmounted (dialog closed)
const cleanup = async () => {
  if (imageUploadRef.value) {
    await imageUploadRef.value.cleanupTempFile();
  }
};

// Expose cleanup method for parent
defineExpose({
  cleanup,
  resetForm
});

onBeforeUnmount(async () => {
  await cleanup();
});
</script>

<style></style>