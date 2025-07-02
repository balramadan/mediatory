import prisma from "~/lib/prisma";
import { hash } from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const adminId = getRouterParam(event, "id");
    const body = await readBody(event);
    const { full_name, email, role, password } = body;

    if (!adminId) {
      throw createError({
        statusCode: 400,
        message: "Admin ID is required",
      });
    }

    // Verifikasi admin yang sedang login
    const adminCookie = getCookie(event, "admin");
    const adminData = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = adminData && adminData.isLoggedIn;

    if (!isAdmin) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    // Hanya superadmin yang bisa update admin lain
    if (adminData.admin.role !== "superadmin") {
      throw createError({
        statusCode: 403,
        message: "Forbidden: Only superadmin can update other admins",
      });
    }

    // Validasi input
    if (!full_name || !email) {
      throw createError({
        statusCode: 400,
        message: "Full name and email are required",
      });
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: "Invalid email format",
      });
    }

    // Validasi role
    if (role && !["superadmin", "inventory"].includes(role)) {
      throw createError({
        statusCode: 400,
        message: "Invalid role. Must be 'superadmin' or 'inventory'",
      });
    }

    // Cek apakah admin yang akan diupdate ada
    const existingAdmin = await prisma.admins.findUnique({
      where: { admin_id: adminId },
    });

    if (!existingAdmin) {
      throw createError({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    // Proteksi: tidak bisa mengubah superadmin menjadi role lain
    if (existingAdmin.role === "superadmin" && role && role !== "superadmin") {
      throw createError({
        statusCode: 403,
        message: "Cannot downgrade superadmin role",
      });
    }

    // Cek email duplikat (kecuali untuk admin yang sedang diupdate)
    const emailExists = await prisma.admins.findFirst({
      where: {
        email,
        admin_id: {
          not: adminId,
        },
      },
    });

    if (emailExists) {
      throw createError({
        statusCode: 409,
        message: "Email already exists",
      });
    }

    // Prepare data untuk update
    const updateData: any = {
      full_name,
      email,
    };

    // Update role jika diberikan
    if (role) {
      updateData.role = role;
    }

    // Hash password baru jika diberikan
    if (password && password.trim()) {
      if (password.length < 6) {
        throw createError({
          statusCode: 400,
          message: "Password must be at least 6 characters long",
        });
      }
      updateData.password = await hash(password, 10);
    }

    // Update admin
    const updatedAdmin = await prisma.admins.update({
      where: {
        admin_id: adminId,
      },
      data: updateData,
      select: {
        admin_id: true,
        full_name: true,
        email: true,
        role: true,
        last_login: true,
        imgUrl: true,
        createdAt: true,
      },
    });

    return {
      statusCode: 200,
      message: "Admin updated successfully",
      data: updatedAdmin,
    };
  } catch (error) {
    console.error("Error updating admin:", error);
    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});