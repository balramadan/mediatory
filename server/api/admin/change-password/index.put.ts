import prisma from "~/lib/prisma";
import { compare, hash } from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const id = getQuery(event) as string;
    const body = await readBody(event);
    const { current_password, new_password } = body;

    if (!id) {
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

    // Admin hanya bisa change password sendiri
    if (adminData.admin.id !== id) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: You can only change your own password",
      });
    }

    // Validasi input
    if (!current_password || !new_password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password and new password are required",
      });
    }

    if (new_password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must be at least 6 characters long",
      });
    }

    // Cari admin dan verifikasi password lama
    const admin = await prisma.admins.findUnique({
      where: {
        admin_id: id,
      },
    });

    if (!admin) {
      throw createError({
        statusCode: 404,
        statusMessage: "Admin not found",
      });
    }

    // Verifikasi password lama
    const isCurrentPasswordValid = await compare(current_password, admin.password);
    if (!isCurrentPasswordValid) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password is incorrect",
      });
    }

    // Hash password baru
    const hashedNewPassword = await hash(new_password, 10);

    // Update password
    await prisma.admins.update({
      where: {
        admin_id: id,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return {
      statusCode: 200,
      message: "Password changed successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});