import prisma from "~/lib/prisma";
import { Prisma } from "~/generated/prisma";
import { hash } from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password, full_name, phone } = body;

    if (!full_name || !email || !password || !phone) {
      return createError({
        statusCode: 400,
        message: "Missing required fields",
      });
    }

    // Untuk hash password
    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        phone,
        createdAt: new Date(),
      },
    });

    if (!newUser) {
      return createError({
        statusCode: 500,
        message: "Failed to create user",
      });
    }

    // Hapus data sensitif dari response
    const { password: _, ...userData } = newUser;

    return {
      statusCode: 200,
      message: "User created successfully",
      data: userData,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw createError({
          statusCode: 409,
          message: "Email already exists",
        });
      }
    }

    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
