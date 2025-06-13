import prisma from "~/lib/prisma";
import { hash } from "bcrypt";
import { Prisma } from "~/generated/prisma";

export default defineEventHandler(async (event) => {
  try {
    const adminId = getRouterParam(event, "id");
    const body = await readBody(event);
    const { full_name, email, role, password } = body;

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

    // Hanya superadmin yang bisa update admin lain
    if (adminData.admin.role !== "superadmin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Only superadmin can update other admins",
      });
    }

    // Validasi input
    if (!full_name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Full name and email are required",
      });
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid email format",
      });
    }

    // Validasi role
    if (role && !["superadmin", "inventory"].includes(role)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid role. Must be 'superadmin' or 'inventory'",
      });
    }

    // Cek apakah admin yang akan diupdate ada
    const existingAdmin = await prisma.admins.findUnique({
      where: { admin_id: adminId },
    });

    if (!existingAdmin) {
      throw createError({
        statusCode: 404,
        statusMessage: "Admin not found",
      });
    }

    // Proteksi: tidak bisa mengubah superadmin menjadi role lain
    if (existingAdmin.role === "superadmin" && role && role !== "superadmin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Cannot downgrade superadmin role",
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
        statusMessage: "Email already exists",
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
          statusMessage: "Password must be at least 6 characters long",
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
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw createError({
          statusCode: 409,
          statusMessage: "Email already exists",
        });
      }
    }

    console.error("Error updating admin:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});