import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const admins = await prisma.admins.findMany();

    // Hapus data sensitif dari response
    const sanitizedAdmins = admins.map(({ password, ...admin }) => admin);

    return {
      statusCode: 200,
      data: sanitizedAdmins,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
