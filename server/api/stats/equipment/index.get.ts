import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Dapatkan cookie admin dan user
    const adminCookie = getCookie(event, "admin");
    const userCookie = getCookie(event, "user");

    // Parse cookie jika ada
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const userData = userCookie ? JSON.parse(userCookie) : null;

    // Cek apakah user atau admin yang terautentikasi
    const isAdmin = adminData && adminData.isLoggedIn;
    const isUser = userData && userData.isLoggedIn;

    if (isAdmin || isUser) {
      // Total equipment
      const totalEquipment = await prisma.equipment.aggregate({
        _sum: {
          quantity: true,
        },
      });

      // Equipment aktif (sedang dipinjam)
      const activeEquipment = await prisma.transactionDetail.aggregate({
        where: {
          transaction: {
            status: "approved",
            return_status: "not_returned",
          },
        },
        _sum: {
          quantity: true,
        },
      });

      // Equipment terlambat (status overdue) - gunakan aggregation yang lebih efisien
      const overdueEquipment = await prisma.transactionDetail.aggregate({
        where: {
          transaction: {
            status: "overdue",
          },
        },
        _sum: {
          quantity: true,
        },
      });

      // Equipment dalam pemeliharaan
      const maintenanceDetail = await prisma.maintenance.aggregate({
        where: {
          status: "ongoing",
        },
        _sum: {
          quantity: true,
        },
      });

      const totalQty = totalEquipment._sum.quantity || 0;
      const activeQty = activeEquipment._sum.quantity || 0;
      const overdueQty = overdueEquipment._sum.quantity || 0;
      const maintenanceQty = maintenanceDetail._sum.quantity || 0;
      const availableQty = totalQty - (activeQty + overdueQty + maintenanceQty);

      return {
        statusCode: 200,
        message: "Equipment statistics retrieved successfully",
        data: {
          _sum: {
            quantity: totalQty,
          },
          active: activeQty,
          overdue: overdueQty,
          maintenance: maintenanceQty,
        },
      };
    } else {
      return {
        statusCode: 401,
        message: "Unauthorized: Login required",
      };
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
