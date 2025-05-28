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
      const { transaction_id, status, verified_notes, adminId } = body;

      // Validasi input
      if (!transaction_id || !status) {
        return {
          statusCode: 400,
          message: "Bad Request: Missing required fields",
        };
      }

      // Jika status adalah "approved" atau "rejected", lakukan pembaruan
      if (status === "approved") {
        const updateTransaction = await prisma.transactions.update({
          where: {
            transaction_id,
          },
          data: {
            status,
            verified_notes,
            verified_at: new Date(),
            admin: {
              connect: {
                admin_id: adminId,
              },
            },
          },
        });

        if (!updateTransaction) {
          return {
            statusCode: 404,
            message: "Transaction not found",
          };
        }

        return {
          statusCode: 200,
          message: "Transaction updated successfully",
        };
      } else if (status === "rejected") {
        const updateTransaction = await prisma.transactions.update({
          where: {
            transaction_id,
          },
          data: {
            status,
            verified_notes,
            verified_at: new Date(),
            admin: {
              connect: {
                admin_id: adminId,
              },
            },
          },
        });

        if (!updateTransaction) {
          return {
            statusCode: 404,
            message: "Transaction not found",
          };
        }

        // Update stok equipment yang ditolak
        const transactionEquipments =
          await prisma.transactionEquipment.findMany({
            where: {
              transaction_id: parseInt(transaction_id),
            },
            include: {
              equipment: true,
            },
          });

        // Kembalikan stok equipment yang telah dikurangi
        for (const item of transactionEquipments) {
          await prisma.equipment.update({
            where: {
              equipment_id: item.equipment_id,
            },
            data: {
              available_quantity: {
                increment: item.quantity, // Tambahkan kembali quantity yang sebelumnya dikurangi
              },
            },
          });
        }

        return {
          statusCode: 200,
          message: "Transaction rejected and equipment quantities restored",
        };
      } else if (status === "canceled") {
        const updateTransaction = await prisma.transactions.update({
          where: {
            transaction_id,
          },
          data: {
            status,
          },
        });

        if (!updateTransaction) {
          return {
            statusCode: 404,
            message: "Transaction not found",
          };
        }

        // Update stok equipment yang ditolak
        const transactionEquipments =
          await prisma.transactionEquipment.findMany({
            where: {
              transaction_id: parseInt(transaction_id),
            },
            include: {
              equipment: true,
            },
          });

        // Kembalikan stok equipment yang telah dikurangi
        for (const item of transactionEquipments) {
          await prisma.equipment.update({
            where: {
              equipment_id: item.equipment_id,
            },
            data: {
              available_quantity: {
                increment: item.quantity, // Tambahkan kembali quantity yang sebelumnya dikurangi
              },
            },
          });
        }

        return {
          statusCode: 200,
          message: "Transaction canceled and equipment quantities restored",
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
