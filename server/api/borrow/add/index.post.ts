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
    const result = await prisma.$transaction(async (prismaClient) => {
      // Buat transaksi peminjaman
      const borrow = await prismaClient.transactions.create({
        data: {
          project,
          purpose,
          borrow_date, // Pastikan format tanggal benar
          return_date, // Pastikan format tanggal benar
          user: {
            connect: { user_id },
          },
          equipments: {
            create: equipments.map((equipment: any) => ({
              equipment_id: equipment.equipment_id,
              quantity: equipment.quantity,
            })),
          },
        },
      });

      // Kurangi jumlah peralatan yang tersedia
      for (const equipment of equipments) {
        await prismaClient.equipment.update({
          where: { equipment_id: equipment.equipment_id },
          data: {
            available_quantity: {
              decrement: equipment.quantity,
            },
          },
        });
      }

      // Buat notifikasi untuk transaksi peminjaman
      await prismaClient.notifications.create({
        data: {
          title: "Pengajuan Peminjaman",
          message: `Peminjaman dengan nomor transaksi #${borrow.transaction_id} telah diajukan`,
          type: "transaction",
          transaction: {
            connect: {
              transaction_id: borrow.transaction_id,
            },
          },
        },
      });

      return borrow;
    });

    // Kirim respons sukses
    return {
      statusCode: 200,
      message: "Borrow transaction created successfully",
      borrow: result,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
});
