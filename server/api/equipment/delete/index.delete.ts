import prisma from "~/lib/prisma";
import { UploadService } from "~/utils/uploadService";

export default defineEventHandler(async (event) => {
  const adminCookie = getCookie(event, "admin");
  const adminData = adminCookie ? JSON.parse(adminCookie) : null;

  const isAdmin = adminData && adminData.isLoggedIn;
  if (!isAdmin) {
    return {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  try {
    const body = await readBody(event);
    const { multiple } = getQuery(event);
    const { id, ids } = body; // Support both id and ids

    // Helper function to extract image key from URL
    const extractImageKeyFromUrl = (imgUrl: string): string | null => {
      if (!imgUrl) return null;
      try {
        // Extract key from Supabase storage URL
        const url = new URL(imgUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.indexOf('public') + 1;
        if (bucketIndex > 0 && bucketIndex < pathParts.length) {
          // Join the remaining parts to get the full key
          return pathParts.slice(bucketIndex + 1).join('/');
        }
        return null;
      } catch (error) {
        console.error('Error extracting image key from URL:', error);
        return null;
      }
    };

    // Helper function to delete image from storage
    const deleteImageIfExists = async (imgUrl: string | null) => {
      if (imgUrl) {
        const imageKey = extractImageKeyFromUrl(imgUrl);
        if (imageKey) {
          try {
            await UploadService.deleteFile(imageKey);
            console.log('Image deleted from storage:', imageKey);
          } catch (error) {
            console.error('Failed to delete image from storage:', error);
            // Don't throw error here, continue with equipment deletion
          }
        }
      }
    };

    if (multiple === "true" || multiple === true) {
      // Handle multiple deletion
      const equipmentIds = ids || id; // Support both 'ids' and 'id' for array
      
      if (!Array.isArray(equipmentIds)) {
        return createError({
          statusCode: 400,
          message: "Invalid request: ids must be an array",
        });
      }

      const uniqueIds = Array.from(new Set(equipmentIds));

      // First, get all equipment with their images
      const equipmentToDelete = await prisma.equipment.findMany({
        where: {
          equipment_id: {
            in: uniqueIds,
          },
        },
        select: {
          equipment_id: true,
          imgUrl: true,
        },
      });

      // Delete images from storage
      const imageDeletePromises = equipmentToDelete.map(equipment => 
        deleteImageIfExists(equipment.imgUrl)
      );
      
      // Wait for all image deletions to complete (but don't fail if some fail)
      await Promise.allSettled(imageDeletePromises);

      // Delete equipment from database
      await prisma.equipment.deleteMany({
        where: {
          equipment_id: {
            in: uniqueIds,
          },
        },
      });

      return {
        statusCode: 200,
        message: `${equipmentToDelete.length} equipment(s) deleted successfully`,
        deletedCount: equipmentToDelete.length,
      };
    } else {
      // Handle single deletion
      if (!id) {
        return createError({
          statusCode: 400,
          message: "Equipment ID is required",
        });
      }

      // First, get the equipment with its image
      const equipmentToDelete = await prisma.equipment.findUnique({
        where: {
          equipment_id: id,
        },
        select: {
          equipment_id: true,
          imgUrl: true,
          name: true,
        },
      });

      if (!equipmentToDelete) {
        return createError({
          statusCode: 404,
          message: "Equipment not found",
        });
      }

      // Delete image from storage if exists
      await deleteImageIfExists(equipmentToDelete.imgUrl);

      // Delete equipment from database
      await prisma.equipment.delete({
        where: {
          equipment_id: id,
        },
      });

      return {
        statusCode: 200,
        message: "Equipment deleted successfully",
        deletedEquipment: {
          id: equipmentToDelete.equipment_id,
          name: equipmentToDelete.name,
        },
      };
    }
  } catch (error: any) {
    console.error('Equipment deletion error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal Server Error",
    });
  }
});