import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { user_id, project, purpose, borrow_date, equipments, return_date } =
      body;

    // Validasi input
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

    // Cek ketersediaan peralatan sebelum membuat transaksi
    for (const equipment of equipments) {
      const equip = await prisma.equipment.findUnique({
        where: { equipment_id: equipment.equipment_id },
      });

      if (!equip || equip.available_quantity < equipment.quantity) {
        return createError({
          statusCode: 400,
          message: `Insufficient available quantity for equipment: ${
            equip?.name || equipment.equipment_id
          }`,
        });
      }
    }

    // Buat transaksi peminjaman
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
          })),
        },
        notifications: {
          create: {
            title: "Permintaan Peminjaman Alat",
            message: `Permintaan peminjaman alat oleh user dengan ID ${user_id} telah diajukan.`,
          },
        },
      },
    });

    // Cek apakah transaksi berhasil dibuat
    if (!borrow) {
      return createError({
        statusCode: 400,
        message: "Failed to create borrow transaction",
      });
    }

    // Kurangi jumlah peralatan yang tersedia
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

    // Kirim
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
