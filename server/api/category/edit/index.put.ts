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
    const body = await readBody(event);
    const { category_id, category_name, description } = body;

    if (!category_id) {
      return createError({
        statusCode: 400,
        message: "Category ID is required",
      });
    }

    const edit = await prisma.categories.update({
      where: {
        category_id: category_id,
      },
      data: {
        category_name,
        description,
      },
    });

    if (!edit) {
      return createError({
        statusCode: 500,
        message: "Failed to update category",
      });
    }

    return {
      statusCode: 200,
      message: "Category updated successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "An unexpected error occurred",
    });
  }
});
