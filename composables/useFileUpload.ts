export const useFileUpload = () => {
  const uploading = ref(false)
  const uploadProgress = ref(0)

  const uploadImage = async (file: File, folder: string = 'general') => {
    uploading.value = true
    uploadProgress.value = 0

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Gunakan XMLHttpRequest untuk progress tracking yang lebih baik
      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            uploadProgress.value = Math.round((e.loaded / e.total) * 100)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response.data)
            } catch (error) {
              reject(new Error('Invalid response format'))
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              reject(new Error(errorResponse.statusMessage || 'Upload failed'))
            } catch {
              reject(new Error(`Upload failed with status: ${xhr.status}`))
            }
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'))
        })

        xhr.open('POST', `/api/upload/image?folder=${folder}`)
        xhr.send(formData)
      })

    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload image')
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  const deleteImage = async (key: string) => {
    try {
      await $fetch('/api/upload/image', {
        method: 'DELETE',
        body: { key }
      })
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to delete image')
    }
  }

  return {
    uploading: readonly(uploading),
    uploadProgress: readonly(uploadProgress),
    uploadImage,
    deleteImage
  }
}