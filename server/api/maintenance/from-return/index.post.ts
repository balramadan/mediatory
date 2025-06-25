import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { maintenance_requests, borrower_info } = body;

    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const results = await Promise.all(
      maintenance_requests.map(async (request: any) => {
        return await prisma.maintenance.create({
          data: {
            equipment_id: request.equipment_id,
            quantity: request.quantity,
            maintenance_type: request.maintenance_type,
            description: request.description,
            technician_name: request.technician_name,
            expected_end_date: request.expected_end_date ? new Date(request.expected_end_date) : null,
            notes: request.notes,
            admin_id: adminData.admin.admin_id,
          },
          include: {
            equipment: true,
            admin: true,
          },
        });
      })
    );

    // Create notification
    await prisma.notifications.create({
      data: {
        title: "Maintenance Baru dari Return",
        message: `Maintenance dijadwalkan untuk ${results.length} item karena kerusakan dari peminjaman oleh ${borrower_info.full_name}`,
        type: "maintenance",
      },
    });

    return {
      statusCode: 200,
      message: "Maintenance schedules created successfully",
      data: results,
    };
  } catch (error) {
    console.error("Error creating maintenance from return:", error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});