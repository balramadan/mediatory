import { UploadService } from '~/utils/uploadService'

export default defineEventHandler(async (event) => {
  try {
    const { key } = await readBody(event)
    
    if (!key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File key is required'
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
      statusMessage: error.statusMessage || 'Failed to delete file'
    })
  }
})