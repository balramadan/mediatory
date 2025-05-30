import prisma from "~/lib/prisma";
import { sendEmail, emailTemplates } from "~/utils/email";

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
          borrow_date,
          return_date,
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

    // Kirim notifikasi email setelah transaksi berhasil
    try {
      // Get user details
      const user = await prisma.users.findUnique({
        where: { user_id },
        select: {
          full_name: true,
          email: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get equipment details for email
      const equipmentDetails = await Promise.all(
        equipments.map(async (equipment: any) => {
          const equip = await prisma.equipment.findUnique({
            where: { equipment_id: equipment.equipment_id },
            select: { name: true },
          });
          return {
            name: equip?.name || "Unknown Equipment",
            quantity: equipment.quantity,
          };
        })
      );

      // Get all admin emails
      const admins = await prisma.admins.findMany({
        select: { email: true },
      });

      // Send email notification to all admins
      const emailPromises = admins.map(async (admin) => {
        const template = emailTemplates.borrowRequest(
          user.full_name,
          result.transaction_id,
          equipmentDetails
        );

        return sendEmail(admin.email, template.subject, template.html);
      });

      // Wait for all emails to be sent
      const emailResults = await Promise.allSettled(emailPromises);
      
      // Log email results
      emailResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          console.log(`Email sent successfully to admin ${index + 1}`);
        } else {
          console.error(`Failed to send email to admin ${index + 1}:`, 
            result.status === "rejected" ? result.reason : result.value.error
          );
        }
      });

    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Don't fail the transaction if email fails
      // Just log the error and continue
    }

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