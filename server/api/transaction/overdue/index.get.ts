import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    console.log("[Cron] Checking for overdue transactions...");

    // Ambil semua transaksi dengan status 'approved' dan tanggal pengembalian sudah lewat
    const overdueTransactions = await prisma.transactions.findMany({
      where: {
        status: "approved",
        return_status: "not_returned",
        return_date: {
          lt: new Date(), // Tanggal pengembalian kurang dari hari ini
        },
      },
      include: {
        user: true,
      },
    });

    if (overdueTransactions.length === 0) {
      console.log('[Cron] No overdue transactions found');
      return {
        statusCode: 200,
        message: "No overdue transactions found",
        updatedCount: 0,
      };
    }

    console.log(`[Cron] Found ${overdueTransactions.length} overdue transactions`);

    // Update status transaksi menjadi 'overdue'
    const updatePromises = overdueTransactions.map(transaction => 
      prisma.transactions.update({
        where: {
          transaction_id: transaction.transaction_id,
        },
        data: {
          status: 'overdue',
        },
      })
    );

    await Promise.all(updatePromises);

    // Buat notifikasi untuk setiap transaksi yang terlambat
    const notificationPromises = overdueTransactions.map(transaction =>
      prisma.notifications.create({
        data: {
          title: "Peminjaman Terlambat",
          message: `Pengembalian untuk transaksi #${transaction.transaction_id} oleh ${transaction.user.full_name} sudah melewati batas waktu`,
          type: "transaction",
          transaction: {
            connect: {
              transaction_id: transaction.transaction_id,
            },
          },
        },
      })
    );

    await Promise.all(notificationPromises);

    console.log('[Cron] Updated overdue transactions successfully');

    return {
      statusCode: 200,
      message: "Overdue transactions updated successfully",
      updatedCount: overdueTransactions.length,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
