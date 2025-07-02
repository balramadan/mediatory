import { sendEmail } from "~/utils/email";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      user_email,
      user_name,
      transaction_id,
      penalty_amount,
      penalty_items,
    } = body;

    // Create penalty items list for email
    const itemsList = penalty_items
      .map(
        (item: any) =>
          `<li>${item.equipment.name}: Rp ${item.penalty_amount.toLocaleString(
            "id-ID"
          )}</li>`
      )
      .join("");

    // Create HTML email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Notifikasi Denda Penggantian</h2>
        <p>Kepada Yth. <strong>${user_name}</strong>,</p>
        <p>Kami informasikan bahwa terdapat denda penggantian untuk transaksi peminjaman alat:</p>
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 15px 0;">
          <p><strong>ID Transaksi:</strong> #${transaction_id}</p>
          <p><strong>Detail Denda:</strong></p>
          <ul style="margin: 10px 0;">
            ${itemsList}
          </ul>
          <div style="border-top: 1px solid #f5c6cb; margin-top: 15px; padding-top: 15px;">
            <p style="font-size: 18px; font-weight: bold; color: #721c24;">
              <strong>Total Denda: Rp ${penalty_amount.toLocaleString(
                "id-ID"
              )}</strong>
            </p>
          </div>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0;">
          <p><strong>Langkah Selanjutnya:</strong></p>
          <ul>
            <li>Hubungi admin untuk proses penyelesaian denda</li>
            <li>Siapkan pembayaran sesuai nominal yang tertera</li>
            <li>Konfirmasi pembayaran kepada admin</li>
          </ul>
        </div>

        <p>Mohon segera menghubungi admin untuk menyelesaikan pembayaran denda ini.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 14px;">
            Terima kasih atas perhatian dan kerjasamanya.<br>
            <strong>Tim Admin Mediawi</strong>
          </p>
        </div>
      </div>
    `;

    // Create plain text version
    const emailText = `
    Kepada Yth. ${user_name},

    Kami informasikan bahwa terdapat denda penggantian untuk transaksi peminjaman alat #${transaction_id}.

    Detail Denda:
    ${penalty_items
      .map(
        (item: any) =>
          `- ${item.equipment.name}: Rp ${item.penalty_amount.toLocaleString(
            "id-ID"
          )}`
      )
      .join("\n")}

    Total Denda: Rp ${penalty_amount.toLocaleString("id-ID")}

    Langkah Selanjutnya:
    - Hubungi admin untuk proses penyelesaian denda
    - Siapkan pembayaran sesuai nominal yang tertera
    - Konfirmasi pembayaran kepada admin

    Mohon segera menghubungi admin untuk menyelesaikan pembayaran denda ini.

    Terima kasih atas perhatian dan kerjasamanya.
    Tim Admin Mediawi
    `;

    // Send email using the utility function
    const emailResult = await sendEmail(
      user_email,
      `Notifikasi Denda Penggantian - Transaksi #${transaction_id}`,
      emailHtml,
      emailText
    );

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Failed to send email");
    }

    return {
      statusCode: 200,
      message: "Penalty notice sent successfully",
      messageId: emailResult.messageId,
    };
  } catch (error: any) {
    console.error("Error sending penalty notice:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to send penalty notice",
    });
  }
});
