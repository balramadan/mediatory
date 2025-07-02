import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "id");
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: "User ID is required",
      });
    }

    // Verifikasi user yang sedang login
    const userCookie = getCookie(event, "user");
    const userData = userCookie ? JSON.parse(userCookie) : null;
    const isUser = userData && userData.isLoggedIn;

    if (!isUser) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    // User hanya bisa akses profil sendiri
    if (userData.user.id !== userId) {
      throw createError({
        statusCode: 403,
        message: "Forbidden: You can only access your own profile",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: userId,
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

    if (!user) {
      throw createError({
        statusCode: 404,
        message: "User not found",
      });
    }

    return {
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: user,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal server error",
    });
  }
});