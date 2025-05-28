import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { q, byUser, status, category } = getQuery(event);

  try {
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

    // Ambil data peminjaman dengan relasi user dan equipment
    const transactions = await prisma.transactions.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        equipments: {
          include: {
            equipment: {
              include: {
                category: true,
              },
            },
          },
        },
        admin: {
          select: {
            admin_id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      statusCode: 200,
      message: "success",
      data: transactions,
    };
  } catch (error) {
    console.error("Error fetching borrow list:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
