import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const adminId = getRouterParam(event, "id");
    
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

    // Admin hanya bisa akses profil sendiri kecuali superadmin
    if (adminData.admin.id !== adminId && adminData.admin.role !== "superadmin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: You can only access your own profile",
      });
    }

    const admin = await prisma.admins.findUnique({
      where: {
        admin_id: adminId,
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

    if (!admin) {
      throw createError({
        statusCode: 404,
        statusMessage: "Admin not found",
      });
    }

    return {
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: admin,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});