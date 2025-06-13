import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, BUCKET_NAME } from './s3Client'

export class UploadService {
  
  // Upload file ke S3
  static async uploadFile(
    file: Buffer | Uint8Array | string,
    key: string,
    contentType: string = 'image/jpeg'
  ) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
      })

      await s3Client.send(command)
      
      // Return public URL
      return `${process.env.SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/${key}`
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Failed to upload file')
    }
  }

  // Delete file dari S3
  static async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })

      await s3Client.send(command)
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }

  // Generate presigned URL untuk upload dari client
  static async generatePresignedUploadUrl(key: string, expiresIn: number = 3600) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn })
      return presignedUrl
    } catch (error) {
      console.error('Error generating presigned URL:', error)
      throw new Error('Failed to generate presigned URL')
    }
  }

  // Generate key untuk file
  static generateFileKey(folder: string, filename: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = filename.split('.').pop()
    return `${folder}/${timestamp}-${randomString}.${extension}`
  }
}