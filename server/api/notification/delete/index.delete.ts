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
    const query = getQuery(event);
    const notificationId = query.id as string;
    const deleteRead = query.deleteRead as boolean;
    const deleteAll = query.deleteAll as boolean;

    if (notificationId) {
      const deleted = await prisma.notifications.delete({
        where: { notification_id: notificationId },
      });
      return {
        statusCode: 200,
        message: "Notification deleted successfully",
        data: deleted,
      };
    } else {
      if (deleteRead === true) {
        const deleted = await prisma.notifications.deleteMany({
          where: { is_read: true },
        });
        return {
          statusCode: 200,
          message: `${deleted.count} read notifications deleted successfully`,
        };
      }

      if (deleteAll === true) {
        await prisma.notifications.deleteMany();
        return {
          statusCode: 200,
          message: "All notifications deleted successfully",
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
