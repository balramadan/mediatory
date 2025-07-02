import prisma from "~/lib/prisma";
import { hash } from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    // Verifikasi admin yang sedang login
    const adminCookie = getCookie(event, "admin");
    const admin = adminCookie ? JSON.parse(adminCookie) : null;
    const isAdmin = admin && admin.isLoggedIn;

    if (!isAdmin) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }
        
    const body = await readBody(event);
    const { full_name, email, password } = body;

    if (!full_name || !email || !password) {
      return createError({
        statusCode: 400,
        message: "Missing required fields",
      });
    }

    // Untuk hash password
    const hashedPassword = await hash(password, 10);

    const newAdmin = await prisma.admins.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      },
    });

    if (!newAdmin) {
      return createError({
        statusCode: 500,
        message: "Failed to create admin",
      });
    }

    // Hapus data sensitif dari response
    const { password: _, ...adminData } = newAdmin;

    return {
      statusCode: 200,
      message: "Admin created successfully",
      data: adminData,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
