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
      const currentYear = new Date().getFullYear();
      
      // Query untuk mendapatkan data peminjaman per bulan
      const monthlyTransactions = await prisma.transactions.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: new Date(`${currentYear}-01-01`),
            lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
        _count: {
          transaction_id: true,
        },
      });

      // Inisialisasi array untuk 12 bulan
      const monthlyData = new Array(12).fill(0);

      // Agregasi data per bulan
      monthlyTransactions.forEach((transaction) => {
        const month = new Date(transaction.createdAt).getMonth();
        monthlyData[month] += transaction._count.transaction_id;
      });

      // Raw query alternatif untuk hasil yang lebih akurat
      const rawMonthlyData = await prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM "createdAt") as month,
          COUNT(*) as count
        FROM transactions 
        WHERE EXTRACT(YEAR FROM "createdAt") = ${currentYear}
        GROUP BY EXTRACT(MONTH FROM "createdAt")
        ORDER BY month
      `;

      // Reset dan isi ulang data berdasarkan raw query
      monthlyData.fill(0);
      
      if (Array.isArray(rawMonthlyData)) {
        rawMonthlyData.forEach((row: any) => {
          const monthIndex = parseInt(row.month) - 1; // Convert 1-12 to 0-11
          monthlyData[monthIndex] = parseInt(row.count);
        });
      }

      return {
        statusCode: 200,
        message: "Monthly transaction statistics retrieved successfully",
        data: {
          year: currentYear,
          monthly: monthlyData,
          total: monthlyData.reduce((sum, count) => sum + count, 0),
        },
      };
    } else {
      return {
        statusCode: 401,
        message: "Unauthorized: Login required",
      };
    }
  } catch (error) {
    console.error("Error fetching monthly transaction stats:", error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});