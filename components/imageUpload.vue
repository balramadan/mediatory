<template>
  <div class="image-upload">
    <!-- Preview gambar yang sudah ada -->
    <div v-if="imageUrl && !uploading" class="mb-4">
      <div class="relative inline-block">
        <NuxtImg
          v-if="showPreview"
          :src="imageUrl"
          :alt="altText"
          class="max-w-xs max-h-48 rounded-lg border relative"
        />
        <Button
          v-if="imageUrl && currentKey"
          icon="i-material-symbols:auto-delete"
          :class="
            showPreview
              ? 'absolute -top-12.5rem right-2'
              : 'absolute -top-8.5rem right-2'
          "
          severity="danger"
          size="small"
          rounded
          @click="removeImage"
        />
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="mb-4">
      <ProgressBar :value="uploadProgress" class="mb-2" />
      <p class="text-sm text-gray-600">Uploading... {{ uploadProgress }}%</p>
    </div>

    <!-- File Upload Component -->
    <FileUpload
      ref="fileUpload"
      mode="basic"
      :accept="acceptedTypes"
      :maxFileSize="maxFileSize"
      :customUpload="true"
      @uploader="onUpload"
      @select="onFileSelect"
      @clear="onClear"
      :disabled="uploading"
      chooseLabel="Pilih Gambar"
      class="p-button-outlined"
    >
      <template #empty>
        <div class="flex flex-col items-center justify-center py-4">
          <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
          <p class="text-gray-600">
            Drag and drop gambar di sini atau klik untuk memilih
          </p>
          <small class="text-gray-400">
            Format: JPG, PNG, WebP, GIF (Max: {{ formatFileSize(maxFileSize) }})
          </small>
        </div>
      </template>
    </FileUpload>

    <!-- Debug Info (hapus setelah testing) -->
    <!-- <div v-if="isDevelopment" class="mt-2 p-2 bg-gray-100 text-xs">
      <p>Debug Info:</p>
      <p>Uploading: {{ uploading }}</p>
      <p>Progress: {{ uploadProgress }}%</p>
      <p>Image URL: {{ imageUrl }}</p>
      <p>Current Key: {{ currentKey }}</p>
      <p>Is Temporary: {{ isTemporaryFile }}</p>
      <p>Error: {{ errorMessage }}</p>
    </div> -->

    <!-- Error Message -->
    <Message
      v-if="errorMessage"
      severity="error"
      :closable="false"
      class="mt-2"
    >
      {{ errorMessage }}
    </Message>
  </div>
</template>

<script setup lang="ts">
import type { Props, Emits } from "~/types/image";

const props = withDefaults(defineProps<Props>(), {
  folder: "general",
  altText: "Uploaded image",
  acceptedTypes: "image/*",
  maxFileSize: 1000000, // 1MB
  showPreview: true,
});

const emit = defineEmits<Emits>();

const { uploading, uploadProgress, uploadImage, deleteImage } = useFileUpload();
const toast = useToast();

const fileUpload = ref();
const imageUrl = ref(props.modelValue || "");
const currentKey = ref<string>();
const errorMessage = ref("");
const isTemporaryFile = ref(false); // Track if this is a temporary upload

// Check if in development mode
const isDevelopment = computed(() => {
  return process.dev;
});

// Handle file selection
const onFileSelect = (event: any) => {
  console.log("File selected:", event);
  errorMessage.value = "";
  const file = event.files[0];

  if (file) {
    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (validateFile(file)) {
      // Auto upload setelah file dipilih
      onUpload(event);
    }
  }
};

// Handle clear
const onClear = () => {
  console.log("File cleared");
  errorMessage.value = "";
};

// Validate file before upload
const validateFile = (file: File) => {
  console.log("Validating file:", file.name);

  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value =
      "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.";
    console.error("Invalid file type:", file.type);
    return false;
  }

  // Check file size
  if (file.size > props.maxFileSize) {
    errorMessage.value = `Ukuran file terlalu besar. Maksimal ${formatFileSize(
      props.maxFileSize
    )}.`;
    console.error("File too large:", file.size, "Max:", props.maxFileSize);
    return false;
  }

  console.log("File validation passed");
  return true;
};

// Handle custom upload
const onUpload = async (event: any) => {
  console.log("Upload triggered:", event);
  const file = event.files[0];

  if (!file) {
    console.error("No file to upload");
    return;
  }

  if (!validateFile(file)) {
    console.error("File validation failed");
    return;
  }

  try {
    console.log("Starting upload...");

    // Remove old image if exists
    if (currentKey.value) {
      console.log("Removing old image:", currentKey.value);
      await deleteImage(currentKey.value);
    }

    const result = (await uploadImage(file, props.folder)) as {
      url: string;
      key: string;
    };
    console.log("Upload result:", result);

    imageUrl.value = result.url;
    currentKey.value = result.key;
    isTemporaryFile.value = true; // Mark as temporary

    emit("update:modelValue", result.url);
    emit("upload-success", result);
    emit("temp-file-uploaded", result.key); // Notify parent about temp file

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Gambar berhasil diupload",
      life: 3000,
    });

    // Clear the file input
    if (fileUpload.value?.clear) {
      fileUpload.value.clear();
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    errorMessage.value = error.message || "Gagal mengupload gambar";
    emit("upload-error", error.message);

    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: error.message || "Gagal mengupload gambar",
      life: 3000,
    });
  }
};

// Remove image
const removeImage = async () => {
  if (currentKey.value) {
    try {
      await deleteImage(currentKey.value);
      imageUrl.value = "";
      currentKey.value = undefined;
      errorMessage.value = "";
      isTemporaryFile.value = false;

      emit("update:modelValue", null);
      emit("file-removed");

      toast.add({
        severity: "info",
        summary: "Dihapus",
        detail: "Gambar berhasil dihapus",
        life: 3000,
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal menghapus gambar",
        life: 3000,
      });
    }
  }
};

// Method to confirm file (call this when form is submitted successfully)
const confirmFile = () => {
  isTemporaryFile.value = false;
  console.log("File confirmed, no longer temporary");
};

// Method to cleanup temporary file
const cleanupTempFile = async () => {
  if (isTemporaryFile.value && currentKey.value) {
    try {
      await deleteImage(currentKey.value);
      console.log("Temporary file cleaned up:", currentKey.value);
      emit("temp-file-cleaned");

      // Reset component state
      imageUrl.value = "";
      currentKey.value = undefined;
      isTemporaryFile.value = false;
      errorMessage.value = "";
    } catch (error) {
      console.error("Failed to cleanup temp file:", error);
    }
  }
};

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    imageUrl.value = newValue || "";
    if (!newValue) {
      currentKey.value = undefined;
      isTemporaryFile.value = false;
    }
  }
);

// Expose methods for parent component
defineExpose({
  confirmFile,
  cleanupTempFile,
});

// Auto cleanup on component unmount if file is still temporary
onBeforeUnmount(() => {
  if (isTemporaryFile.value && currentKey.value) {
    // Use nextTick to ensure cleanup happens after component is unmounted
    nextTick(() => {
      cleanupTempFile();
    });
  }
});
</script>

<style scoped>
.image-upload :deep(.p-fileupload-basic) {
  width: 100%;
}

.image-upload :deep(.p-fileupload-basic .p-button) {
  width: 100%;
}
</style>
