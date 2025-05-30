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
      const { q, byUser, status, category } = getQuery(event);

      // Kondisi dasar untuk query
      const whereCondition: any = {};

      // Filter pencarian (search query)
      if (q) {
        whereCondition.OR = [
          // Pencarian berdasarkan nama user
          {
            user: {
              full_name: {
                contains: String(q),
                mode: "insensitive",
              },
            },
          },
          // Pencarian berdasarkan nama equipment di dalam transaksi
          {
            equipments: {
              some: {
                equipment: {
                  name: {
                    contains: String(q),
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ];
      }

      // Filter berdasarkan user ID
      if (byUser) {
        whereCondition.user_id = String(byUser);
      }

      // Filter berdasarkan status transaksi
      if (status) {
        whereCondition.status = String(status);
      }

      // Filter berdasarkan kategori equipment
      if (category) {
        whereCondition.equipments = {
          some: {
            equipment: {
              category_id: parseInt(String(category)),
            },
          },
        };
      }

      const transactions = await prisma.transactions.findMany({
        where: whereCondition,
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
