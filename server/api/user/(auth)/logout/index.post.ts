import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { user_id } = body;

    if (!user_id) {
      return createError({
        statusCode: 400,
        message: "User ID is required",
      });
    }

    const userLogout = await prisma.users.update({
      where: { user_id },
      data: { status: "inactive" },
    });

    if (!userLogout) {
      setResponseStatus(event, 404);
      return { error: "User not found" };
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
