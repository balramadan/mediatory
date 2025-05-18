import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const adminStore = getCookie(event, "admin");
  if (!adminStore) {
    return {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  try {
    const body = await readBody(event);
    const { multiple } = getQuery(event);
    const { id } = body;

    if (!id) {
      return createError({
        statusCode: 400,
        message: "Category ID is required",
      });
    }

    if (multiple === true) {
      if (!Array.isArray(id)) {
        return createError({
          statusCode: 400,
          message: "Invalid request",
        });
      }

      // Konversi ID string ke number untuk Prisma
      const numericIds = id.map((id) => parseInt(id));

      // Delete multiple categories
      await prisma.categories.deleteMany({
        where: {
          category_id: {
            in: numericIds,
          },
        },
      });

      return {
        statusCode: 200,
        message: "Categories deleted successfully",
      };
    } else {
      // Delete the category
      await prisma.categories.delete({
        where: {
          category_id: id,
        },
      });

      return {
        statusCode: 200,
        message: "Category deleted successfully",
      };
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
