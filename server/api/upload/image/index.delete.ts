import { UploadService } from '~/utils/uploadService'

export default defineEventHandler(async (event) => {
  try {
    const { key } = await readBody(event)
    
    if (!key) {
      throw createError({
        statusCode: 400,
        message: 'File key is required'
      })
    }

    await UploadService.deleteFile(key)

    return {
      statusCode: 200,
      message: 'File deleted successfully'
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete file'
    })
  }
})