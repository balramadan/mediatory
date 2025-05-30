import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: any,
  text = ""
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  borrowRequest: (userName: string, transactionId: number, items: any) => ({
    subject: `Pengajuan Peminjaman Baru - #${transactionId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Pengajuan Peminjaman Baru</h2>
        <p>Halo Admin,</p>
        <p>Ada pengajuan peminjaman baru yang perlu diverifikasi:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Peminjam:</strong> ${userName}</p>
          <p><strong>ID Transaksi:</strong> #${transactionId}</p>
          <p><strong>Item yang dipinjam:</strong></p>
          <ul>
            ${items
              .map((item: any) => `<li>${item.name} (Qty: ${item.quantity})</li>`)
              .join("")}
          </ul>
        </div>
        <p>Silakan login ke sistem untuk memverifikasi pengajuan ini.</p>
        <p>Terima kasih.</p>
      </div>
    `,
  }),

  borrowApproved: (userName: string, transactionId: number, items: any) => ({
    subject: `Pengajuan Peminjaman Disetujui - #${transactionId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Pengajuan Peminjaman Disetujui</h2>
        <p>Halo ${userName},</p>
        <p>Pengajuan peminjaman Anda telah disetujui:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>ID Transaksi:</strong> #${transactionId}</p>
          <p><strong>Item yang dipinjam:</strong></p>
          <ul>
            ${items
              .map((item: any) => `<li>${item.name} (Qty: ${item.quantity})</li>`)
              .join("")}
          </ul>
        </div>
        <p>Anda dapat mengambil item yang dipinjam sesuai jadwal yang telah ditentukan.</p>
        <p>Terima kasih.</p>
      </div>
    `,
  }),

  borrowRejected: (userName: string, transactionId: number, reason: string) => ({
    subject: `Pengajuan Peminjaman Ditolak - #${transactionId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Pengajuan Peminjaman Ditolak</h2>
        <p>Halo ${userName},</p>
        <p>Maaf, pengajuan peminjaman Anda telah ditolak:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>ID Transaksi:</strong> #${transactionId}</p>
          <p><strong>Alasan:</strong> ${reason}</p>
        </div>
        <p>Anda dapat mengajukan peminjaman baru atau menghubungi admin untuk informasi lebih lanjut.</p>
        <p>Terima kasih.</p>
      </div>
    `,
  }),

  returnReminder: (userName: string, transactionId: number, dueDate: any, items: any) => ({
    subject: `Pengingat Pengembalian - #${transactionId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ffc107;">Pengingat Pengembalian</h2>
        <p>Halo ${userName},</p>
        <p>Ini adalah pengingat bahwa Anda memiliki item yang perlu dikembalikan:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>ID Transaksi:</strong> #${transactionId}</p>
          <p><strong>Tanggal Jatuh Tempo:</strong> ${dueDate}</p>
          <p><strong>Item yang perlu dikembalikan:</strong></p>
          <ul>
            ${items
              .map((item: any) => `<li>${item.name} (Qty: ${item.quantity})</li>`)
              .join("")}
          </ul>
        </div>
        <p>Mohon segera kembalikan item tersebut untuk menghindari denda keterlambatan.</p>
        <p>Terima kasih.</p>
      </div>
    `,
  }),
};
