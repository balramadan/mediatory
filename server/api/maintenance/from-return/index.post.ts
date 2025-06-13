import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { transaction_id, penalty_items } = body;

    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update penalty information for each item
      for (const item of penalty_items) {
        await tx.returnDetail.updateMany({
          where: {
            transaction_id: transaction_id,
            equipment_id: item.equipment_id,
          },
          data: {
            replacement_status: item.replacement_status,
            penalty_amount: item.penalty_amount,
            penalty_notes: item.penalty_notes,
          },
        });
      }

      // Create notification for penalty
      const totalPenalty = penalty_items.reduce((sum: number, item: any) => sum + (item.penalty_amount || 0), 0);
      
      if (totalPenalty > 0) {
        await tx.notifications.create({
          data: {
            title: "Denda Penggantian Ditetapkan",
            message: `Denda sebesar Rp ${totalPenalty.toLocaleString('id-ID')} ditetapkan untuk transaksi #${transaction_id}`,
            type: "transaction",
            transaction_id: transaction_id,
          },
        });
      }

      return await tx.transactions.findUnique({
        where: { transaction_id },
        include: {
          equipment_returns: {
            include: { equipment: true }
          },
          user: true,
          admin: true,
          return_admin: true,
        }
      });
    });

    return {
      statusCode: 200,
      message: "Penalty settings updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error updating penalty:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});