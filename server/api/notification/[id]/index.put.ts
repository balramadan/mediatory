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
    const id = getRouterParam(event, "id");
    const markAsReadParam = getQuery(event).markAsRead;
    const markAsRead = markAsReadParam === "true" || markAsReadParam === "1";

    if (!id) {
      return {
        statusCode: 400,
        message: "Bad Request",
      };
    }

    if (markAsRead) {
      const notification = await prisma.notifications.update({
        where: {
          notification_id: id,
        },
        data: {
          is_read: true,
        },
      });

      if (!notification) {
        return {
          statusCode: 404,
          message: "Notification not found",
        };
      }

      return {
        statusCode: 200,
        message: "Notification marked as read",
        data: notification,
      };
    } else {
      const notification = await prisma.notifications.findUnique({
        where: {
          notification_id: id,
        },
      });

      if (!notification) {
        return {
          statusCode: 404,
          message: "Notification not found",
        };
      }

      return {
        statusCode: 200,
        message: "Notification found",
        data: notification,
      };
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
