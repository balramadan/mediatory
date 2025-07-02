import { UploadService } from '~/utils/uploadService'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No file uploaded'
      })
    }

    const file = formData[0]
    const folder = getQuery(event).folder as string || 'general'
    
    if (!file.data || !file.filename) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file data'
      })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type || '')) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file type. Only images are allowed.'
      })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        message: 'File size too large. Maximum 5MB allowed.'
      })
    }

    const key = UploadService.generateFileKey(folder, file.filename)
    const imageUrl = await UploadService.uploadFile(
      file.data,
      key,
      file.type || 'image/jpeg'
    )

    return {
      statusCode: 200,
      message: 'File uploaded successfully',
      data: {
        url: imageUrl,
        key: key
      }
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to upload file'
    })
  }
})