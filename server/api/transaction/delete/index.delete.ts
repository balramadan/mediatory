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
    const { multiple } = getQuery(event);
    const { id, ids } = body;

    // Helper function to check if transaction can be deleted
    const canDeleteTransaction = (status: string) => {
      const deletableStatuses = ['cancelled', 'rejected', 'completed'];
      return deletableStatuses.includes(status);
    };

    // Helper function to restore equipment quantities if needed
    const restoreEquipmentQuantities = async (transactionId: number, tx: any) => {
      // Get transaction details
      const transactionDetails = await tx.transactionDetail.findMany({
        where: { transaction_id: transactionId },
      });

      // Get transaction status
      const transaction = await tx.transactions.findUnique({
        where: { transaction_id: transactionId },
        select: { status: true, return_status: true },
      });

      // If transaction was approved but not returned completely, restore quantities
      if (transaction?.status === 'approved' && transaction?.return_status !== 'returned_complete') {
        for (const detail of transactionDetails) {
          await tx.equipment.update({
            where: { equipment_id: detail.equipment_id },
            data: {
              available_quantity: {
                increment: detail.quantity,
              },
            },
          });
        }
      }
    };

    if (multiple === "true" || multiple === true) {
      // Handle multiple deletion
      const transactionIds = ids || id;

      if (!Array.isArray(transactionIds)) {
        return createError({
          statusCode: 400,
          message: "Invalid request: ids must be an array",
        });
      }

      const uniqueIds = Array.from(new Set(transactionIds));

      // Get transactions to delete
      const transactionsToDelete = await prisma.transactions.findMany({
        where: {
          transaction_id: { in: uniqueIds },
        },
        select: {
          transaction_id: true,
          status: true,
          return_status: true,
          user: {
            select: { full_name: true },
          },
        },
      });

      if (transactionsToDelete.length === 0) {
        return createError({
          statusCode: 404,
          message: "No transactions found",
        });
      }

      // Check if all transactions can be deleted
      const undeletableTransactions = transactionsToDelete.filter(
        (transaction) => !canDeleteTransaction(transaction.status)
      );

      if (undeletableTransactions.length > 0) {
        return createError({
          statusCode: 400,
          message: `Cannot delete ${undeletableTransactions.length} transaction(s) with active status. Only cancelled, rejected, or completed transactions can be deleted.`,
        });
      }

      // Delete transactions and related data in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Restore equipment quantities if needed
        for (const transaction of transactionsToDelete) {
          await restoreEquipmentQuantities(transaction.transaction_id, tx);
        }

        // Delete related data in correct order
        await tx.notifications.deleteMany({
          where: { transaction_id: { in: uniqueIds } },
        });

        await tx.returnDetail.deleteMany({
          where: { transaction_id: { in: uniqueIds } },
        });

        await tx.transactionDetail.deleteMany({
          where: { transaction_id: { in: uniqueIds } },
        });

        await tx.transactions.deleteMany({
          where: { transaction_id: { in: uniqueIds } },
        });

        return transactionsToDelete.length;
      });

      return {
        statusCode: 200,
        message: `${result} transaction(s) deleted successfully`,
        deletedCount: result,
      };

    } else {
      // Handle single deletion
      if (!id) {
        return createError({
          statusCode: 400,
          message: "Transaction ID is required",
        });
      }

      // Get transaction to delete
      const transactionToDelete = await prisma.transactions.findUnique({
        where: { transaction_id: id },
        select: {
          transaction_id: true,
          status: true,
          return_status: true,
          user: {
            select: { full_name: true },
          },
        },
      });

      if (!transactionToDelete) {
        return createError({
          statusCode: 404,
          message: "Transaction not found",
        });
      }

      // Check if transaction can be deleted
      if (!canDeleteTransaction(transactionToDelete.status)) {
        return createError({
          statusCode: 400,
          message: `Cannot delete transaction with status "${transactionToDelete.status}". Only cancelled, rejected, or completed transactions can be deleted.`,
        });
      }

      // Delete transaction and related data in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Restore equipment quantities if needed
        await restoreEquipmentQuantities(id, tx);

        // Delete related data in correct order
        await tx.notifications.deleteMany({
          where: { transaction_id: id },
        });

        await tx.returnDetail.deleteMany({
          where: { transaction_id: id },
        });

        await tx.transactionDetail.deleteMany({
          where: { transaction_id: id },
        });

        await tx.transactions.delete({
          where: { transaction_id: id },
        });

        return transactionToDelete;
      });

      return {
        statusCode: 200,
        message: "Transaction deleted successfully",
        deletedTransaction: {
          id: result.transaction_id,
          user: result.user.full_name,
        },
      };
    }
  } catch (error: any) {
    console.error("Transaction deletion error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal Server Error",
    });
  }
});