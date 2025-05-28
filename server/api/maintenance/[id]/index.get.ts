import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Verifikasi admin
    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    // Ambil ID dari parameter
    const id = parseInt(getRouterParam(event, "id") || "0");
    
    if (!id) {
      return {
        statusCode: 400,
        message: "Invalid maintenance ID",
      };
    }

    // Fetch maintenance data
    const maintenance = await prisma.equipmentMaintenance.findUnique({
      where: { id },
      include: {
        equipment: true,
        admin: true,
      },
    });

    if (!maintenance) {
      return {
        statusCode: 404,
        message: "Maintenance record not found",
      };
    }

    return {
      statusCode: 200,
      message: "Maintenance record retrieved successfully",
      data: maintenance,
    };
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});