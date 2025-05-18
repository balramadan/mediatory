import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const equipment = await prisma.equipment.findMany({
      include: {
        category: true,
        maintenance: true,
        equipment_returns: true,
        transactions: true,
      },
    });

    if (!equipment) {
      return createError({
        statusCode: 404,
        message: "No equipment found",
      });
    }

    return {
      statusCode: 200,
      message: "Equipment fetched successfully",
      data: equipment,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
