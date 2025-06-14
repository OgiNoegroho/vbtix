import { env } from "~/env";

interface TicketEmailData {
  to: string;
  order: {
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
  };
  event: {
    title: string;
    startDate: Date;
    venue?: string;
    address?: string;
    city?: string;
    province?: string;
  };
  tickets: Array<{
    id: string;
    qrCode: string;
    ticketType: string;
    holderName: string;
  }>;
  buyerInfo?: {
    fullName: string;
    email: string;
    whatsapp: string;
  };
}

/**
 * Send ticket email to buyer
 */
export async function sendTicketEmail(data: TicketEmailData) {
  try {
    // For now, we'll use a simple email service
    // In production, you should use a proper email service like Resend, SendGrid, etc.
    
    if (!env.RESEND_API_KEY) {
      console.log("📧 Email service not configured. Ticket email would be sent to:", data.to);
      console.log("📧 Order:", data.order.invoiceNumber);
      console.log("📧 Event:", data.event.title);
      console.log("📧 Tickets:", data.tickets.length);
      return;
    }

    // If Resend is configured, use it
    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);

    const emailHtml = generateTicketEmailHtml(data);
    const emailText = generateTicketEmailText(data);

    const result = await resend.emails.send({
      from: env.EMAIL_FROM || "no-reply@vbticket.com",
      to: data.to,
      subject: `Tiket Anda untuk ${data.event.title} - ${data.order.invoiceNumber}`,
      html: emailHtml,
      text: emailText,
    });

    console.log("📧 Ticket email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("📧 Failed to send ticket email:", error);
    throw error;
  }
}

/**
 * Generate HTML email content for tickets
 */
function generateTicketEmailHtml(data: TicketEmailData): string {
  const eventDate = new Date(data.event.startDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const eventLocation = [
    data.event.venue,
    data.event.address,
    data.event.city,
    data.event.province,
  ]
    .filter(Boolean)
    .join(", ");

  const ticketRows = data.tickets
    .map(
      (ticket) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${ticket.ticketType}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${ticket.holderName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${ticket.qrCode}</td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiket Anda - ${data.event.title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🎫 Tiket Anda Siap!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Pembayaran telah dikonfirmasi</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Detail Pesanan</h2>
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p><strong>Nomor Invoice:</strong> ${data.order.invoiceNumber}</p>
      <p><strong>Total Pembayaran:</strong> ${new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: data.order.currency,
      }).format(data.order.amount)}</p>
    </div>

    <h2 style="color: #1f2937;">Detail Event</h2>
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #4f46e5;">${data.event.title}</h3>
      <p><strong>📅 Tanggal & Waktu:</strong> ${eventDate}</p>
      ${eventLocation ? `<p><strong>📍 Lokasi:</strong> ${eventLocation}</p>` : ""}
    </div>

    <h2 style="color: #1f2937;">Tiket Anda</h2>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 12px; text-align: left; font-weight: 600;">Jenis Tiket</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Nama Pemegang</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Kode QR</th>
          </tr>
        </thead>
        <tbody>
          ${ticketRows}
        </tbody>
      </table>
    </div>

    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #92400e;">⚠️ Penting!</h3>
      <ul style="margin: 0; padding-left: 20px; color: #92400e;">
        <li>Simpan email ini sebagai bukti tiket Anda</li>
        <li>Tunjukkan kode QR saat masuk ke venue</li>
        <li>Bawa identitas yang sesuai dengan nama pemegang tiket</li>
        <li>Datang 30 menit sebelum acara dimulai</li>
      </ul>
    </div>

    ${
      data.buyerInfo
        ? `
    <h2 style="color: #1f2937;">Informasi Pembeli</h2>
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
      <p><strong>Nama:</strong> ${data.buyerInfo.fullName}</p>
      <p><strong>Email:</strong> ${data.buyerInfo.email}</p>
      <p><strong>WhatsApp:</strong> ${data.buyerInfo.whatsapp}</p>
    </div>
    `
        : ""
    }

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        Terima kasih telah menggunakan VBTicket!<br>
        Jika ada pertanyaan, silakan hubungi customer service kami.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text email content for tickets
 */
function generateTicketEmailText(data: TicketEmailData): string {
  const eventDate = new Date(data.event.startDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const eventLocation = [
    data.event.venue,
    data.event.address,
    data.event.city,
    data.event.province,
  ]
    .filter(Boolean)
    .join(", ");

  const ticketList = data.tickets
    .map(
      (ticket, index) =>
        `${index + 1}. ${ticket.ticketType} - ${ticket.holderName} (QR: ${ticket.qrCode})`,
    )
    .join("\n");

  return `
🎫 TIKET ANDA SIAP!

Pembayaran Anda telah dikonfirmasi dan tiket sudah siap digunakan.

DETAIL PESANAN
==============
Nomor Invoice: ${data.order.invoiceNumber}
Total Pembayaran: ${new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: data.order.currency,
  }).format(data.order.amount)}

DETAIL EVENT
============
Event: ${data.event.title}
Tanggal & Waktu: ${eventDate}
${eventLocation ? `Lokasi: ${eventLocation}` : ""}

TIKET ANDA
==========
${ticketList}

PENTING!
========
- Simpan email ini sebagai bukti tiket Anda
- Tunjukkan kode QR saat masuk ke venue
- Bawa identitas yang sesuai dengan nama pemegang tiket
- Datang 30 menit sebelum acara dimulai

${
  data.buyerInfo
    ? `
INFORMASI PEMBELI
=================
Nama: ${data.buyerInfo.fullName}
Email: ${data.buyerInfo.email}
WhatsApp: ${data.buyerInfo.whatsapp}
`
    : ""
}

Terima kasih telah menggunakan VBTicket!
Jika ada pertanyaan, silakan hubungi customer service kami.
  `;
}
