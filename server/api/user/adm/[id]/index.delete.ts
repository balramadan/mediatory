import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "id");

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: "User ID is required",
      });
    }

    // Verifikasi admin yang sedang login
    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    // Cek apakah user ada
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: "User not found",
      });
    }

    // Hapus semua transaksi dan relasi terkait user
    // 1. Hapus ReturnDetail yang terkait dengan transaksi user
    const userTransactions = await prisma.transactions.findMany({
      where: { user_id: userId },
      select: { transaction_id: true },
    });
    const transactionIds = userTransactions.map(t => t.transaction_id);

    if (transactionIds.length > 0) {
      // Hapus ReturnDetail
      await prisma.returnDetail.deleteMany({
      where: { transaction_id: { in: transactionIds } },
      });
      // Hapus TransactionDetail
      await prisma.transactionDetail.deleteMany({
      where: { transaction_id: { in: transactionIds } },
      });
      // Hapus notifications terkait transaksi
      await prisma.notifications.deleteMany({
      where: { transaction_id: { in: transactionIds } },
      });
      // Hapus transaksi
      await prisma.transactions.deleteMany({
      where: { transaction_id: { in: transactionIds } },
      });
    }

    // Hapus user
    await prisma.users.delete({
      where: { user_id: userId },
    });

    return {
      statusCode: 200,
      message: "User deleted successfully",
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal server error",
    });
  }
});
