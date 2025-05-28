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
      const body = await readBody(event);
      const { transaction_id, return_status, adminId, return_notes } = body;

      if (!transaction_id || !return_status) {
        throw createError({
          statusCode: 400,
          message: "Bad Request",
        });
      }

      if (return_status === "pending_check") {
        const updateTransaction = await prisma.transactions.update({
          where: {
            transaction_id,
          },
          data: {
            return_status,
            notifications: {
              create: {
                title: "Pengajuan Pengembalian Alat",
                message:
                  "Terdapat user yang melakukan pengajuan pengembalian alat",
              },
            },
          },
        });

        if (!updateTransaction) {
          throw createError({
            statusCode: 404,
            message: "Transaction not found",
          });
        }

        return {
          status: 200,
          message: "Transaction updated successfully",
        };
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
