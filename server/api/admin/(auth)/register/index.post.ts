import prisma from "~/lib/prisma";
import { Prisma } from "~/generated/prisma";
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
        statusMessage: "Unauthorized",
      });
    }
        
    const body = await readBody(event);
    const { full_name, email, password } = body;

    if (!full_name || !email || !password) {
      return createError({
        statusCode: 400,
        statusMessage: "Missing required fields",
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
        statusMessage: "Failed to create admin",
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw createError({
          statusCode: 409,
          statusMessage: "Email already exists",
        });
      }
    }

    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
