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
    const { id, name, quantity, status, category_id, imgUrl } = body;

    if (!id) {
      return createError({
        statusCode: 400,
        message: "Equipment ID is required",
      });
    }

    const searchEquipment = await prisma.equipment.findUnique({
      where: {
        equipment_id: id,
      },
    });

    if (!searchEquipment) {
      return createError({
        statusCode: 404,
        message: "Equipment not found",
      });
    }

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
            console.log('Old image deleted from storage:', imageKey);
          } catch (error) {
            console.error('Failed to delete old image from storage:', error);
            // Don't throw error here, continue with equipment update
          }
        }
      }
    };

    // Hitung jumlah alat yang sedang dipinjam (belum dikembalikan)
    const borrowedEquipment = await prisma.transactionDetail.aggregate({
      where: {
        equipment_id: id,
        transaction: {
          status: "approved",
          return_status: "not_returned"
        }
      },
      _sum: {
        quantity: true
      }
    });

    // Hitung jumlah alat yang sedang dalam maintenance
    const maintenanceDetail = await prisma.maintenanceDetail.aggregate({
      where: {
        equipment_id: id,
        status: "ongoing"
      },
      _sum: {
        quantity: true
      }
    });

    const borrowedQuantity = borrowedEquipment._sum.quantity || 0;
    const maintenanceQuantity = maintenanceDetail._sum.quantity || 0;
    const usedQuantity = borrowedQuantity + maintenanceQuantity;

    // Validasi jika quantity baru kurang dari yang sedang digunakan
    if (quantity && quantity < usedQuantity) {
      return createError({
        statusCode: 400,
        message: `Quantity cannot be less than currently used equipment. Currently used: ${usedQuantity} (${borrowedQuantity} borrowed + ${maintenanceQuantity} in maintenance)`,
      });
    }

    // Check if image URL is being changed and delete old image
    if (imgUrl !== undefined && imgUrl !== searchEquipment.imgUrl) {
      // Delete old image if it exists
      if (searchEquipment.imgUrl) {
        await deleteImageIfExists(searchEquipment.imgUrl);
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (category_id !== undefined) updateData.category_id = parseInt(category_id);
    if (imgUrl !== undefined) updateData.imgUrl = imgUrl;

    // Jika quantity diubah, hitung ulang available_quantity
    if (quantity !== undefined) {
      updateData.quantity = quantity;
      // available_quantity = total quantity - yang sedang dipinjam - yang sedang maintenance
      updateData.available_quantity = quantity - usedQuantity;
    }

    const editEquipment = await prisma.equipment.update({
      where: {
        equipment_id: id,
      },
      data: updateData,
      include: {
        category: true
      }
    });

    return {
      statusCode: 200,
      message: "Equipment updated successfully",
      data: editEquipment,
    };
  } catch (error: any) {
    console.error('Equipment edit error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal Server Error",
    });
  }
});