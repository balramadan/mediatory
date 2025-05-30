import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Ambil cookie user
    const userCookie = getCookie(event, "user");
    const userData = userCookie ? JSON.parse(userCookie) : null;
    const isUser = userData && userData.isLoggedIn;

    if (!isUser) {
      return {
        statusCode: 401,
        message: "Unauthorized: Login required",
      };
    }

    // Ambil query parameters untuk filter
    const query = getQuery(event);
    const { status, return_status, search, page = 1, limit = 10 } = query;

    // Build where condition
    const whereCondition: any = {
      user_id: userData.user.id,
    };

    if (status) {
      whereCondition.status = String(status);
    }

    if (return_status) {
      whereCondition.return_status = String(return_status);
    }

    if (search) {
      whereCondition.OR = [
        {
          project: {
            contains: String(search),
            mode: "insensitive",
          },
        },
        {
          purpose: {
            contains: String(search),
            mode: "insensitive",
          },
        },
        {
          equipments: {
            some: {
              equipment: {
                name: {
                  contains: String(search),
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ];
    }

    // Hitung total untuk pagination
    const total = await prisma.transactions.count({
      where: whereCondition,
    });

    // Ambil data transactions dengan pagination
    const transactions = await prisma.transactions.findMany({
      where: whereCondition,
      include: {
        equipments: {
          include: {
            equipment: {
              include: {
                category: true,
              },
            },
          },
        },
        equipment_returns: {
          include: {
            equipment: true,
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
        return_admin: {
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
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return {
      statusCode: 200,
      message: "Transaction history retrieved successfully",
      data: {
        transactions,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalRecords: total,
          limit: Number(limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});