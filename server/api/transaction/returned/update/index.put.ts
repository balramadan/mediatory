import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { transaction_id, return_details } = body;

    // Verifikasi admin
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
      // Update return details
      for (const detail of return_details) {
        await tx.returnDetail.updateMany({
          where: {
            transaction_id: transaction_id,
            equipment_id: detail.equipment_id,
          },
          data: {
            returned_quantity: detail.returned_quantity,
            condition: detail.condition,
            damage_notes: detail.damage_notes,
            replacement_status: detail.replacement_status,
            penalty_amount: detail.penalty_amount,
            penalty_notes: detail.penalty_notes,
          },
        });
      }

      // Update transaction return status if needed
      const hasProblems = return_details.some((detail: any) => 
        detail.condition !== 'good'
      );

      if (!hasProblems) {
        await tx.transactions.update({
          where: { transaction_id },
          data: { 
            return_status: 'returned_complete',
            status: 'completed'
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
      message: "Return details updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error updating return details:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});