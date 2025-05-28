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
    const { id, name, quantity, status, category } = body;

    if (!id) {
      return createError({
        statusCode: 400,
        message: "Equipment ID is required",
      });
    }

    const searchEquipment = await prisma.equipment.findUnique({
      where: {
        equipment_id: id,
      },
    });

    if (searchEquipment && quantity < searchEquipment?.available_quantity) {
      return createError({
        statusCode: 400,
        message: "Quantity cannot be less than available quantity",
      });
    }

    const editEquipment = await prisma.equipment.update({
      where: {
        equipment_id: id,
      },
      data: {
        name,
        quantity,
        status,
        category_id: category,
      },
    });

    if (!editEquipment) {
      return createError({
        statusCode: 404,
        message: "Equipment not found",
      });
    }

    return {
      statusCode: 200,
      message: "Equipment updated successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
