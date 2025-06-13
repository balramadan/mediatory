import prisma from "~/lib/prisma";
import { UploadService } from "~/utils/uploadService";

export default defineEventHandler(async (event) => {
  try {
    const adminId = getRouterParam(event, "id");
    const body = await readBody(event);
    const { full_name, email, imgUrl } = body;

    if (!adminId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Admin ID is required",
      });
    }

    // Verifikasi admin yang sedang login
    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    // Admin hanya bisa update profil sendiri kecuali superadmin
    if (adminData.admin.id !== adminId && adminData.admin.role !== "superadmin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: You can only update your own profile",
      });
    }

    // Validasi input
    if (!full_name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Full name and email are required",
      });
    }

    // Helper function untuk extract image key dari URL
    const extractImageKeyFromUrl = (imgUrl: string): string | null => {
      if (!imgUrl) return null;
      try {
        const url = new URL(imgUrl);
        const pathParts = url.pathname.split('/');
        const publicIndex = pathParts.indexOf('public');
        if (publicIndex > 0 && publicIndex < pathParts.length - 1) {
          return pathParts.slice(publicIndex + 2).join('/');
        }
        return null;
      } catch (error) {
        console.error('Error extracting image key from URL:', error);
        return null;
      }
    };

    // Helper function untuk delete image lama
    const deleteImageIfExists = async (imgUrl: string | null) => {
      if (imgUrl) {
        const imageKey = extractImageKeyFromUrl(imgUrl);
        if (imageKey) {
          try {
            await UploadService.deleteFile(imageKey);
            console.log('Old user profile image deleted from storage:', imageKey);
          } catch (error) {
            console.error('Failed to delete old user profile image from storage:', error);
            // Don't throw error, continue with update
          }
        }
      }
    };

    // Get current admin data untuk cleanup foto lama
    const currentAdmin = await prisma.admins.findUnique({
      where: { admin_id: adminId },
      select: { imgUrl: true },
    });

    if (!currentAdmin) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Delete foto lama jika ada dan berbeda dengan yang baru
    if (imgUrl !== undefined && imgUrl !== currentAdmin.imgUrl) {
      await deleteImageIfExists(currentAdmin.imgUrl);
    }

    // Update admin profile including image URL
    const updatedAdmin = await prisma.admins.update({
      where: {
        admin_id: adminId,
      },
      data: {
        full_name,
        email,
        ...(imgUrl !== undefined && { imgUrl }), // Only update imgUrl if provided
      },
      select: {
        admin_id: true,
        full_name: true,
        email: true,
        role: true,
        last_login: true,
        imgUrl: true,
        createdAt: true,
      },
    });

    return {
      statusCode: 200,
      message: "Profile updated successfully",
      data: updatedAdmin,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});