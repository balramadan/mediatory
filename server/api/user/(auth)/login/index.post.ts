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

    const loginUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!loginUser) {
      return createError({
        statusCode: 401,
        message: "Invalid email",
      });
    }

    // Cek password
    const isPasswordValid = await compare(password, loginUser.password);

    if (!isPasswordValid) {
      return createError({
        statusCode: 401,
        message: "Invalid password",
      });
    }

    // Update status active
    await prisma.users.update({
      where: { user_id: loginUser.user_id },
      data: { status: "active" },
    });

    // Hapus data sensitif dari response
    const { password: _, ...userData } = loginUser;

    return {
      statusCode: 200,
      message: "Login successful",
      data: userData,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
