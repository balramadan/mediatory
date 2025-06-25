import prisma from "~/lib/prisma";
import { compare } from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password } = body;

    if (!email || !password) {
      return createError({
        statusCode: 400,
        message: "Missing required fields",
      });
    }

    const loginAdmin = await prisma.admins.findUnique({
      where: {
        email,
      },
    });

    if (!loginAdmin) {
      return createError({
        statusCode: 401,
        message: "Invalid email",
      });
    }

    // Cek password
    const isPasswordValid = await compare(password, loginAdmin.password);

    if (!isPasswordValid) {
      return createError({
        statusCode: 401,
        message: "Invalid password",
      });
    }

    // Hapus data sensitif dari response
    const { password: _, ...adminData } = loginAdmin;

    return {
      statusCode: 200,
      message: "Login successful",
      data: adminData,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
