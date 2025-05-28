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

    // Ambil query parameters untuk filtering
    const query = getQuery(event);
    const status = query.status as string;
    
    // Buat where clause berdasarkan filter
    const where: any = {};
    if (status && ['ongoing', 'completed', 'cancelled'].includes(status)) {
      where.status = status;
    }

    // Fetch data maintenance
    const maintenanceData = await prisma.equipmentMaintenance.findMany({
      where,
      include: {
        equipment: true,
        admin: true,
      },
      orderBy: {
        start_date: 'desc',
      },
    });

    return {
      statusCode: 200,
      message: "Maintenance data retrieved successfully",
      data: maintenanceData,
    };
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});