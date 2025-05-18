import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { user_id, project, purpose, borrow_date, equipments, return_date } =
      body;

    if (
      !user_id ||
      !project ||
      !purpose ||
      !borrow_date ||
      !equipments ||
      !return_date
    ) {
      return createError({
        statusCode: 400,
        message: "Missing required fields",
      });
    }

    const borrow = await prisma.transactions.create({
      data: {
        user_id,
        project,
        purpose,
        borrow_date,
        return_date,
        user: {
          connect: { user_id: user_id },
        },
        equipments: {
          create: equipments.map((equipment: any) => ({
            equipment_id: equipment.equipment_id,
            quantity: equipment.quantity,
            status: "borrowed",
          })),
        },
      },
    });

    if (!borrow) {
      return createError({
        statusCode: 400,
        message: "Failed to create borrow transaction",
      });
    }

    // Update the equipment's available quantity
    for (const equipment of equipments) {
      await prisma.equipment.update({
        where: { equipment_id: equipment.equipment_id },
        data: {
          available_quantity: {
            decrement: equipment.quantity,
          },
        },
      });
    }

    // Optionally, you can return the created borrow transaction
    return {
      statusCode: 200,
      message: "Borrow transaction created successfully",
      borrow,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
