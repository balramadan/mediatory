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
      const activeEquipment = await prisma.transactionEquipment.aggregate({
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

      // Equipment terlambat (melewati return_date dan belum dikembalikan)
      const overdueTransactions = await prisma.transactions.findMany({
        where: {
          status: "approved",
          return_status: "not_returned",
          return_date: {
            lt: new Date(),
          },
        },
        include: {
          equipments: true,
        },
      });

      const overdueEquipmentCount = overdueTransactions.reduce(
        (total, transaction) => {
          return (
            total +
            transaction.equipments.reduce((sum, eq) => sum + eq.quantity, 0)
          );
        },
        0
      );

      // Equipment dalam pemeliharaan
      const maintenanceEquipment = await prisma.equipmentMaintenance.aggregate({
        where: {
          status: "ongoing",
        },
        _sum: {
          quantity: true,
        },
      });

      return {
        statusCode: 200,
        message: "Equipment statistics retrieved successfully",
        data: {
          _sum: {
            quantity: totalEquipment._sum.quantity || 0,
          },
          active: activeEquipment._sum.quantity || 0,
          overdue: overdueEquipmentCount,
          maintenance: maintenanceEquipment._sum.quantity || 0,
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
