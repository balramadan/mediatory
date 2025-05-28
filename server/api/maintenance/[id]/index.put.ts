import prisma from "~/lib/prisma";
import { StatusMaintenance } from "~/generated/prisma/client";

export default defineEventHandler(async (event) => {
  try {
    // Verifikasi admin
    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    // Ambil ID dari parameter
    const id = parseInt(getRouterParam(event, "id") || "0");
    
    if (!id) {
      return {
        statusCode: 400,
        message: "Invalid maintenance ID",
      };
    }

    // Ambil data dari request body
    const body = await readBody(event);
    const { 
      status, 
      notes,
      actual_end_date,
      technician_name 
    } = body;
    
    // Validasi input
    if (!status) {
      return {
        statusCode: 400,
        message: "Status is required",
      };
    }

    // Fetch maintenance record
    const maintenance = await prisma.equipmentMaintenance.findUnique({
      where: { id },
      include: {
        equipment: true,
      },
    });

    if (!maintenance) {
      return {
        statusCode: 404,
        message: "Maintenance record not found",
      };
    }

    // Mulai transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update maintenance record
      const updatedMaintenance = await tx.equipmentMaintenance.update({
        where: { id },
        data: {
          status,
          notes: notes || maintenance.notes,
          actual_end_date: status === "completed" ? new Date() : actual_end_date,
          technician_name: technician_name || maintenance.technician_name,
        },
      });

      // Jika status completed, kembalikan equipment ke available
      if (status === "completed" || status === "cancelled") {
        // Kembalikan jumlah available_quantity
        await tx.equipment.update({
          where: { 
            equipment_id: maintenance.equipment_id 
          },
          data: {
            available_quantity: {
              increment: maintenance.quantity,
            },
            status: 'available',
          },
        });

        // Buat notifikasi
        await tx.notifications.create({
          data: {
            title: status === "completed" ? "Pemeliharaan Selesai" : "Pemeliharaan Dibatalkan",
            message: `${maintenance.quantity} unit ${maintenance.equipment.name} telah ${status === "completed" ? "selesai dipelihara" : "dibatalkan pemeliharaannya"}`,
            type: "maintenance",
          },
        });
      }

      return updatedMaintenance;
    });

    return {
      statusCode: 200,
      message: "Maintenance record updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error updating maintenance:", error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});