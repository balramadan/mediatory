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

    // Ambil data dari request body
    const body = await readBody(event);
    const { 
      equipment_id, 
      quantity, 
      maintenance_type, 
      description, 
      expected_end_date, 
      technician_name 
    } = body;

    // Validasi input
    if (!equipment_id || !quantity || !maintenance_type) {
      return {
        statusCode: 400,
        message: "Missing required fields",
      };
    }

    // Cek apakah equipment ada
    const equipment = await prisma.equipment.findUnique({
      where: { equipment_id },
    });

    if (!equipment) {
      return {
        statusCode: 404, 
        message: "Equipment not found"
      };
    }

    // Cek apakah jumlah yang diminta valid
    if (quantity <= 0 || quantity > equipment.available_quantity) {
      return {
        statusCode: 400,
        message: `Invalid quantity. Available: ${equipment.available_quantity}`,
      };
    }

    // Mulai transaction database
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat record maintenance
      const maintenance = await tx.equipmentMaintenance.create({
        data: {
          equipment_id,
          quantity,
          maintenance_type,
          description,
          expected_end_date: expected_end_date ? new Date(expected_end_date) : null,
          technician_name,
          recorded_by: adminData.admin.id,
          status: StatusMaintenance.ongoing,
        },
      });

      // 2. Update available quantity pada equipment
      await tx.equipment.update({
        where: { equipment_id },
        data: {
          available_quantity: {
            decrement: quantity
          },
          status: equipment.available_quantity - quantity <= 0 ? 'maintenance' : 'available',
        },
      });

      // 3. Buat notifikasi
      await tx.notifications.create({
        data: {
          title: "Peralatan Dalam Pemeliharaan",
          message: `${quantity} unit ${equipment.name} telah dimasukkan ke dalam pemeliharaan`,
          type: "maintenance",
        },
      });

      return maintenance;
    });

    return {
      statusCode: 200,
      message: "Maintenance record created successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});