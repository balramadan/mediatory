import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const adminCookie = getCookie(event, "admin");
  const adminData = adminCookie ? JSON.parse(adminCookie) : null;

  const isAdmin = adminData && adminData.isLoggedIn;
  if (!isAdmin) {
    return {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  try {
    const body = await readBody(event);
    const { name, description } = body;

    if (!name || !description) {
      return {
        statusCode: 400,
        message: "Name and description are required",
      };
    }

    const addCategory = await prisma.categories.create({
      data: {
        category_name: name,
        description,
      },
    });

    if (!addCategory) {
      return {
        statusCode: 500,
        message: "Failed to create category",
      };
    }

    return {
      statusCode: 200,
      message: "Category created successfully",
      data: addCategory,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});
