import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const users = await prisma.users.findMany({});

    // Hapus data sensitif dari response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return {
      statusCode: 200,
      data: sanitizedUsers,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
