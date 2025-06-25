import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "id");
    const body = await readBody(event);

    // Jika body dikirim dalam bentuk Form Array (array of { name, value })
    let full_name = "";
    let email = "";
    let phone_number = "";

    if (Array.isArray(body)) {
      for (const item of body) {
      if (item.name === "full_name") full_name = item.value;
      if (item.name === "email") email = item.value;
      if (item.name === "phone_number") phone_number = item.value;
      }
    } else {
      // fallback jika bukan array
      ({ full_name, email, phone_number } = body);
    }

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
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

    // Validasi input
    if (!full_name || !email) {
      throw createError({
        statusCode: 400,
        message: "Full name and email are required",
      });
    }

    // Cek email duplikat (kecuali user yang sedang diupdate)
    const emailExists = await prisma.users.findFirst({
      where: {
        email,
        user_id: { not: userId },
      },
    });
    if (emailExists) {
      throw createError({
        statusCode: 409,
        message: "Email already exists",
      });
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { user_id: userId },
      data: {
        full_name,
        email,
        phone: phone_number ?? null,
      },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        status: true,
        imgUrl: true,
        createdAt: true,
      },
    });

    return {
      statusCode: 200,
      message: "User updated successfully",
      data: updatedUser,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw createError({
        statusCode: 409,
        message: "Email already exists",
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.statusMessage || "Internal server error",
    });
  }
});
