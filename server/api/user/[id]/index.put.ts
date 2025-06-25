import prisma from "~/lib/prisma";
import { UploadService } from "~/utils/uploadService";

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "id");
    const body = await readBody(event);
    const { full_name, email, phone, imgUrl } = body;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    // Verifikasi user yang sedang login
    const userCookie = getCookie(event, "user");
    const userData = userCookie ? JSON.parse(userCookie) : null;
    const isUser = userData && userData.isLoggedIn;

    if (!isUser) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    // User hanya bisa update profil sendiri
    if (userData.user.id !== userId) {
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

    // Get current user data untuk cleanup foto lama
    const currentUser = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { imgUrl: true },
    });

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Delete foto lama jika ada dan berbeda dengan yang baru
    if (imgUrl !== undefined && imgUrl !== currentUser.imgUrl) {
      await deleteImageIfExists(currentUser.imgUrl);
    }

    // Update user profile
    const updatedUser = await prisma.users.update({
      where: {
        user_id: userId,
      },
      data: {
        full_name,
        email,
        phone: phone || null,
        ...(imgUrl !== undefined && { imgUrl }), // Only update imgUrl if provided
      },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        status: true,
        imgUrl: true,
        createdAt: true,
      },
    });

    return {
      statusCode: 200,
      message: "Profile updated successfully",
      data: updatedUser,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal server error",
    });
  }
});