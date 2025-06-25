import prisma from "~/lib/prisma";
import { StatusReturn } from "~/generated/prisma/client";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { transaction_id, return_notes, equipment_returns } = body;

    if (
      !transaction_id ||
      !equipment_returns ||
      !Array.isArray(equipment_returns)
    ) {
      return createError({
        statusCode: 400,
        message: "Data pengembalian tidak lengkap",
      });
    }

    // Verifikasi apakah admin yang login
    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      return createError({
        statusCode: 401,
        message: "Anda tidak memiliki akses untuk memverifikasi pengembalian",
      });
    }

    // Verifikasi transaksi
    const transaction = await prisma.transactions.findUnique({
      where: {
        transaction_id: transaction_id,
      },
      include: {
        equipments: {
          include: {
            equipment: true,
          },
        },
      },
    });

    if (!transaction) {
      return createError({
        statusCode: 404,
        message: "Transaksi tidak ditemukan",
      });
    }

    // Tentukan status pengembalian berdasarkan kondisi barang
    let returnStatus: StatusReturn = "returned_complete";
    for (const item of equipment_returns) {
      if (item.condition === "damaged" || item.condition === "other") {
        returnStatus = "returned_damaged";
        break;
      } else if (
        item.condition === "incomplete" ||
        item.returned_quantity < item.quantity
      ) {
        returnStatus = "returned_incomplete";
        break;
      } else if (item.condition === "lost") {
        returnStatus = "returned_incomplete";
        break;
      } else if (
        item.condition === "good" &&
        item.returned_quantity < item.quantity
      ) {
        returnStatus = "pending_check"
        return createError({
          statusCode: 400,
          message: "Jumlah barang yang dikembalikan kurang dari seharusnya, verifikasi tidak dapat dilanjutkan.",
        });
      }
    }

    // Mulai transaction database
    const result = await prisma.$transaction(async (tx) => {
      // Update status transaksi
      const updatedTransaction = await tx.transactions.update({
        where: {
          transaction_id: transaction_id,
        },
        data: {
          return_status: returnStatus,
          return_notes: return_notes,
          return_admin_id: adminData.id,
          return_verified_at: new Date(),
          status:
            returnStatus === "returned_complete" ? "completed" : "approved",
        },
      });

      const returnRecords = [];

      // Cek apakah sudah ada returnRecord sebelumnya untuk transaksi ini
      const existingReturnRecords = await tx.returnDetail.findMany({
        where: {
          transaction_id: transaction_id,
        },
      });

      // Map untuk mempermudah pencarian existing record berdasarkan equipment_id
      const existingRecordsMap = existingReturnRecords.reduce<any>((map, record) => {
        map[record.equipment_id] = record;
        return map;
      }, {})

      // Proses semua equipment returns
      for (const item of equipment_returns) {
        let returnRecord;

        // Cek apakah equipment ini sudah memiliki record pengembalian
        if (existingRecordsMap[item.equipment_id]) {
          // Update record yang sudah ada
          returnRecord = await tx.returnDetail.update({
            where: {
              id: existingRecordsMap[item.equipment_id].id,
            },
            data: {
              returned_quantity: item.returned_quantity,
              condition: item.condition,
              damage_notes: item.damage_notes || null,
            },
          });
        } else {
          // Buat record baru jika belum ada
          returnRecord = await tx.returnDetail.create({
            data: {
              transaction_id: transaction_id,
              equipment_id: item.equipment_id,
              returned_quantity: item.returned_quantity,
              condition: item.condition,
              damage_notes: item.damage_notes || null,
            },
          });
        }

        returnRecords.push(returnRecord);

        // Hanya update stok equipment jika status pengembalian adalah "returned_complete"
        if (returnStatus === "returned_complete") {
          // Jika sebelumnya statusnya bukan returned_complete dan sekarang sudah complete,
          // maka kita perlu update stok equipment
          const equipment = await tx.equipment.findUnique({
            where: {
              equipment_id: item.equipment_id,
            },
          });

          if (equipment) {
            // Jika ini adalah perubahan status dari damaged/incomplete ke complete
            // atau baru pertama kali ditambahkan, update stok equipment
            await tx.equipment.update({
              where: {
                equipment_id: item.equipment_id,
              },
              data: {
                available_quantity:
                  equipment.available_quantity + item.returned_quantity,
              },
            });
          }
        }
      }

      return {
        transaction: updatedTransaction,
        returns: returnRecords,
      };
    });

    return {
      statusCode: 200,
      message: "Pengembalian berhasil diverifikasi",
      data: result,
    };
  } catch (error) {
    console.error("Error verifying return:", error);
    return createError({
      statusCode: 500,
      message: `Terjadi kesalahan saat memverifikasi pengembalian: ${error}`,
    });
  }
});
