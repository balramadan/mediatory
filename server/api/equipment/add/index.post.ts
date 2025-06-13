import prisma from "~/lib/prisma"
import { ulid } from "ulid"

export default defineEventHandler(async (event) => {
  const adminCookie = getCookie(event, "admin")
  const adminData = adminCookie ? JSON.parse(adminCookie) : null

  const isAdmin = adminData && adminData.isLoggedIn
  if (!isAdmin) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    })
  }

  try {
    // Check if request is multipart/form-data
    const contentType = getHeader(event, 'content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form with possible image data
      const formData = await readMultipartFormData(event)
      
      if (!formData) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No form data received'
        })
      }

      let equipmentData: any = {}

      // Process form data
      for (const item of formData) {
        if (item.name && item.data) {
          equipmentData[item.name] = item.data.toString()
        }
      }

      // Validate required fields
      if (!equipmentData.name || !equipmentData.quantity || !equipmentData.category_id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Name, quantity, and category ID are required"
        })
      }

      if (parseInt(equipmentData.quantity) <= 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Quantity must be greater than 0"
        })
      }

      // Create equipment with uploaded image URL
      const addEquipment = await prisma.equipment.create({
        data: {
          equipment_id: ulid(),
          name: equipmentData.name,
          quantity: parseInt(equipmentData.quantity),
          available_quantity: parseInt(equipmentData.quantity),
          category_id: parseInt(equipmentData.category_id),
          imgUrl: equipmentData.imgUrl || null, // Use the uploaded image URL
        },
        include: {
          category: true
        }
      })

      return {
        statusCode: 200,
        message: "Equipment created successfully",
        data: addEquipment,
      }

    } else {
      // Handle regular JSON request (backward compatibility)
      const body = await readBody(event)
      const { name, quantity, category_id, imgUrl } = body

      if (!name || !quantity || !category_id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Name, quantity, and category ID are required"
        })
      }

      if (quantity <= 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Quantity must be greater than 0"
        })
      }

      const addEquipment = await prisma.equipment.create({
        data: {
          equipment_id: ulid(),
          name,
          quantity,
          available_quantity: quantity,
          category_id: parseInt(category_id),
          imgUrl: imgUrl || null,
        },
        include: {
          category: true
        }
      })

      return {
        statusCode: 200,
        message: "Equipment created successfully",
        data: addEquipment,
      }
    }

  } catch (error: any) {
    console.error('Equipment creation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal Server Error",
    })
  }
})