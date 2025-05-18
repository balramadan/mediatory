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
        message: "Equipment ID is required",
      });
    }

    if (multiple === true) {
      if (!Array.isArray(id)) {
        return createError({
          statusCode: 400,
          message: "Invalid request",
        });
      }

      const uniqueIds = Array.from(new Set(id));

      await prisma.equipment.deleteMany({
        where: {
          equipment_id: {
            in: uniqueIds,
          },
        },
      });

      return {
        statusCode: 200,
        message: "Equipments deleted successfully",
      };
    } else {
      await prisma.equipment.delete({
        where: {
          equipment_id: id,
        },
      });

      return {
        statusCode: 200,
        message: "Equipment deleted successfully",
      };
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
