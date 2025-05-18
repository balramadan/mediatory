import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const categories = await prisma.categories.findMany({
      include: {
        equipment: true,
      },
    });

    if (!categories) {
      return createError({
        statusCode: 404,
        message: "No categories found",
      });
    }

    return {
      statusCode: 200,
      message: "Categories fetched successfully",
      data: categories,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
