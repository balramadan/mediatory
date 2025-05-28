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
      const transactions = await prisma.transactions.findMany({
        include: {
          admin: true,
          user: true,
          equipments: {
            include: {
              equipment: {
                include: {
                  category: true,
                },
              },
            },
          },
          equipment_returns: true,
          return_admin: true,
          notifications: true,
        },
      });

      if (!transactions) {
        return {
          statusCode: 404,
          message: "No transactions found",
          data: [],
        };
      }

      return {
        statusCode: 200,
        message: "Transactions retrieved successfully",
        data: transactions,
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
