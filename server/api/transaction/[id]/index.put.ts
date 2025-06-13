import prisma from "~/lib/prisma";
import { sendEmail, emailTemplates } from '~/utils/email';

export default defineEventHandler(async (event) => {
  try {
    // Dapatkan cookie admin dan user
    const adminCookie = getCookie(event, "admin");
    const userCookie = getCookie(event, "user");

    // Parse cookie jika ada
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const userData = userCookie ? JSON.parse(userCookie) : null;

    // Cek apakah user atau admin yang terautentikasi
    const isAdmin = adminData && adminData.isLoggedIn;
    const isUser = userData && userData.isLoggedIn;

    if (isAdmin || isUser) {
      const id = parseInt(getRouterParam(event, "id") || "0");
      const body = await readBody(event);
      const { status, verified_notes, adminId } = body;

      // Validasi input
      if (!status) {
        return {
          statusCode: 400,
          message: "Bad Request: Missing required fields",
        };
      }

      // Jika status adalah "approved" atau "rejected", lakukan pembaruan
      if (status === "approved") {
        const updateTransaction = await prisma.transactions.update({
          where: {
            transaction_id: id,
          },
          data: {
            status,
            verified_notes,
            verified_at: new Date(),
            admin: {
              connect: {
                admin_id: adminId,
              },
            },
          },
          include: {
            user: true,
            equipments: {
              include: {
                equipment: true
              }
            }
          }
        });

        if (!updateTransaction) {
          return {
            statusCode: 404,
            message: "Transaction not found",
          };
        }

        // Send approval email to user
        try {
          const itemDetails = updateTransaction.equipments.map(eq => ({
            name: eq.equipment.name,
            quantity: eq.quantity
          }));

          const template = emailTemplates.borrowApproved(
            updateTransaction.user.full_name,
            updateTransaction.transaction_id,
            itemDetails
          );

          await sendEmail(updateTransaction.user.email, template.subject, template.html);
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't fail the transaction if email fails
        }

        return {
          statusCode: 200,
          message: "Transaction approved successfully and email sent to user",
        };
      } else if (status === "rejected") {
        const updateTransaction = await prisma.transactions.update({
          where: {
            transaction_id: id,
          },
          data: {
            status,
            verified_notes,
            verified_at: new Date(),
            admin: {
              connect: {
                admin_id: adminId,
              },
            },
          },
          include: {
            user: true,
            equipments: {
              include: {
                equipment: true
              }
            }
          }
        });

        if (!updateTransaction) {
          return {
            statusCode: 404,
            message: "Transaction not found",
          };
        }

        // Update stok equipment yang ditolak
        const transactionDetails =
          await prisma.transactionDetail.findMany({
            where: {
              transaction_id: id,
            },
            include: {
              equipment: true,
            },
          });

        // Kembalikan stok equipment yang telah dikurangi
        for (const item of transactionDetails) {
          await prisma.equipment.update({
            where: {
              equipment_id: item.equipment_id,
            },
            data: {
              available_quantity: {
                increment: item.quantity, // Tambahkan kembali quantity yang sebelumnya dikurangi
              },
            },
          });
        }

        // Send rejection email to user
        try {
          const template = emailTemplates.borrowRejected(
            updateTransaction.user.full_name,
            updateTransaction.transaction_id,
            verified_notes || 'Tidak ada alasan yang diberikan'
          );

          await sendEmail(updateTransaction.user.email, template.subject, template.html);
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
          // Don't fail the transaction if email fails
        }

        return {
          statusCode: 200,
          message: "Transaction rejected, equipment quantities restored, and email sent to user",
        };
      } else if (status === "canceled") {
        const updateTransaction = await prisma.transactions.update({
          where: {
            transaction_id: id,
          },
          data: {
            status,
          },
        });

        if (!updateTransaction) {
          return {
            statusCode: 404,
            message: "Transaction not found",
          };
        }

        // Update stok equipment yang ditolak
        const transactionDetails =
          await prisma.transactionDetail.findMany({
            where: {
              transaction_id: id,
            },
            include: {
              equipment: true,
            },
          });

        // Kembalikan stok equipment yang telah dikurangi
        for (const item of transactionDetails) {
          await prisma.equipment.update({
            where: {
              equipment_id: item.equipment_id,
            },
            data: {
              available_quantity: {
                increment: item.quantity, // Tambahkan kembali quantity yang sebelumnya dikurangi
              },
            },
          });
        }

        return {
          statusCode: 200,
          message: "Transaction canceled and equipment quantities restored",
        };
      }
    }
  } catch (error) {
    console.error('Error in transaction update:', error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});