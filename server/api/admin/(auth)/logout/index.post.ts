import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { admin_id } = body;

    if (!admin_id) {
      setResponseStatus(event, 400);
      return { error: "Admin ID is required" };
    }

    const adminLogout = await prisma.admins.update({
      where: { admin_id },
      data: { last_login: new Date() },
    });

    if (!adminLogout) {
      setResponseStatus(event, 404);
      return { error: "Admin not found" };
    }

    return {
      statusCode: 200,
      message: "Logout successful",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
