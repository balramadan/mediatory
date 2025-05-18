import prisma from "~/lib/prisma";
import { ulid } from "ulid";

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
    const { name, quantity, category_id } = body;

    if (!name || !quantity || !category_id) {
      return {
        statusCode: 400,
        message: "Name, quantity, and category ID are required",
      };
    }

    if (quantity <= 0) {
      return {
        statusCode: 400,
        message: "Quantity must be greater than 0",
      };
    }

    const addEquipment = await prisma.equipment.create({
      data: {
        equipment_id: ulid(),
        name,
        quantity,
        available_quantity: quantity,
        category_id: parseInt(category_id), // Convert to number
      },
    });

    if (!addEquipment) {
      return {
        statusCode: 500,
        message: "Failed to create equipment",
      };
    }

    return {
      statusCode: 200,
      message: "Equipment created successfully",
      data: addEquipment,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
