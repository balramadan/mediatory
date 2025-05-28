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
      const id = getRouterParam(event, "id");

      if (!id) {
        return {
          statusCode: 400,
          message: "Bad Request",
        };
      }

      const transaction = await prisma.transactions.findUnique({
        where: {
          transaction_id: parseInt(id),
        },
        include: {
          equipments: true,
          user: true,
          notifications: true,
          equipment_returns: true,
          admin: true,
        },
      });

      if (!transaction) {
        return {
          statusCode: 404,
          message: "Transaction not found",
        };
      }

      return {
        statusCode: 200,
        message: "Transaction retrieved successfully",
        data: transaction,
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
