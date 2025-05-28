import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const adminCookie = getCookie(event, "admin");
  const adminData = adminCookie ? JSON.parse(adminCookie) : null;

  const isAdmin = adminData && adminData.isLoggedIn;
  if (!isAdmin) {
    return {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  try {
    const notifications = await prisma.notifications.findMany({
      include: {
        transaction: {
          include: {
            equipments: true,
          },
        },
      },
    });

    if (!notifications) {
      return {
        statusCode: 404,
        message: "No notifications found",
        data: [],
      };
    }

    return {
      statusCode: 200,
      message: "Notifications retrieved successfully",
      data: notifications,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
