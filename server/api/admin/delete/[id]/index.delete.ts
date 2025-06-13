import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const adminId = getRouterParam(event, "id");

    if (!adminId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Admin ID is required",
      });
    }

    // Verifikasi admin yang sedang login
    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    // Hanya superadmin yang bisa delete admin
    if (adminData.admin.role !== "superadmin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Only superadmin can delete admins",
      });
    }

    // Cek apakah admin yang akan dihapus ada
    const adminToDelete = await prisma.admins.findUnique({
      where: { admin_id: adminId },
    });

    if (!adminToDelete) {
      throw createError({
        statusCode: 404,
        statusMessage: "Admin not found",
      });
    }

    // Proteksi: tidak bisa menghapus superadmin
    if (adminToDelete.role === "superadmin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Cannot delete superadmin",
      });
    }

    // Proteksi: tidak bisa menghapus diri sendiri
    if (adminToDelete.admin_id === adminData.admin.id) {
      throw createError({
        statusCode: 403,
        statusMessage: "Cannot delete your own account",
      });
    }

    // Cek apakah admin memiliki data terkait yang harus dipertahankan
    const relatedData = await prisma.admins.findUnique({
      where: { admin_id: adminId },
      include: {
        verified_transactions: {
          take: 1,
        },
        return_verifications: {
          take: 1,
        },
        recorded_maintenance: {
          take: 1,
        },
      },
    });

    // Jika ada data terkait, tidak bisa dihapus langsung
    if (
      (relatedData?.verified_transactions.length ?? 0) > 0 ||
      (relatedData?.return_verifications.length ?? 0) > 0 ||
      (relatedData?.recorded_maintenance?.length ?? 0) > 0
    ) {
      throw createError({
        statusCode: 409,
        statusMessage:
          "Cannot delete admin with existing transaction or maintenance records. Consider deactivating instead.",
      });
    }

    // Hapus admin
    const deletedAdmin = await prisma.admins.delete({
      where: {
        admin_id: adminId,
      },
      select: {
        admin_id: true,
        full_name: true,
        email: true,
        role: true,
      },
    });

    return {
      statusCode: 200,
      message: "Admin deleted successfully",
      data: deletedAdmin,
    };
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
