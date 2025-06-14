import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailConfig {
  from: string;
  replyTo?: string;
  companyName: string;
}

const defaultConfig: EmailConfig = {  from: process.env.EMAIL_FROM || "noreply@vbticket.com",
  replyTo: "support@vbticket.com",
  companyName: "VBTicket",
};

export class EmailService {
  private config: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Create HTML template for account verification
   */
  private createAccountVerificationHTML(
    userName: string,
    verificationUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Akun - ${this.config.companyName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
      <h1 style="color: #3b82f6; font-size: 28px; margin: 0; font-weight: bold;">${this.config.companyName}</h1>
      <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0;">Platform Tiket Event Terpercaya</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 30px 0;">
      <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; text-align: center;">🎉 Selamat Datang di ${this.config.companyName}!</h2>

      <p style="font-size: 16px; margin-bottom: 20px;">Halo <strong>${userName}</strong>,</p>

      <p style="font-size: 16px; margin-bottom: 20px;">
        Terima kasih telah mendaftar di ${this.config.companyName}! Untuk melengkapi proses pendaftaran dan mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini.
      </p>

      <!-- Verification Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
          ✅ Verifikasi Email Saya
        </a>
      </div>

      <p style="font-size: 14px; color: #666666; text-align: center; margin-bottom: 20px;">
        Atau salin dan tempel link berikut di browser Anda:
      </p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef; word-break: break-all; font-size: 14px; color: #495057;">
        ${verificationUrl}
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-top: 20px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>⚠️ Penting:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi ini, abaikan email ini.
        </p>
      </div>

      <h3 style="color: #1f2937; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">Setelah verifikasi, Anda dapat:</h3>

      <ul style="font-size: 14px; color: #4b5563; padding-left: 20px;">
        <li style="margin-bottom: 8px;">🎫 Membeli tiket event favorit Anda</li>
        <li style="margin-bottom: 8px;">📱 Mengelola tiket digital dengan mudah</li>
        <li style="margin-bottom: 8px;">🔔 Mendapatkan notifikasi event terbaru</li>
        <li style="margin-bottom: 8px;">💰 Menikmati promo dan diskon eksklusif</li>
        <li style="margin-bottom: 8px;">📊 Melihat riwayat pembelian tiket</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 0 0 10px 0;">Email ini dikirim oleh ${this.config.companyName}</p>
      <p style="margin: 0 0 10px 0;">
        Jika Anda memiliki pertanyaan, hubungi kami di
        <a href="mailto:${this.config.replyTo}" style="color: #3b82f6;">${this.config.replyTo}</a>
      </p>
      <p style="margin: 0;">© 2025 ${this.config.companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Create text template for account verification
   */
  private createAccountVerificationText(
    userName: string,
    verificationUrl: string,
  ): string {
    return `
Selamat Datang di ${this.config.companyName}!

Halo ${userName},

Terima kasih telah mendaftar di ${this.config.companyName}! Untuk melengkapi proses pendaftaran dan mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik link berikut:

${verificationUrl}

Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi ini, abaikan email ini.

Setelah verifikasi, Anda dapat:
- Membeli tiket event favorit Anda
- Mengelola tiket digital dengan mudah
- Mendapatkan notifikasi event terbaru
- Menikmati promo dan diskon eksklusif
- Melihat riwayat pembelian tiket

Jika Anda memiliki pertanyaan, hubungi kami di ${this.config.replyTo}

© 2025 ${this.config.companyName}. All rights reserved.
    `.trim();
  }

  /**
   * Send account verification email
   */
  async sendAccountVerification({
    to,
    userName,
    verificationUrl,
  }: {
    to: string;
    userName: string;
    verificationUrl: string;
  }) {
    try {
      const htmlContent = this.createAccountVerificationHTML(
        userName,
        verificationUrl,
      );
      const textContent = this.createAccountVerificationText(
        userName,
        verificationUrl,
      );

      const result = await resend.emails.send({
        from: this.config.from,
        to: [to],
        replyTo: this.config.replyTo,
        subject: `Verifikasi Akun ${this.config.companyName} - ${userName}`,
        html: htmlContent,
        text: textContent,
        tags: [
          { name: "category", value: "account-verification" },
          { name: "user", value: userName },
        ],
      });

      console.log("✅ Account verification email sent:", result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error: any) {
      console.error("❌ Failed to send account verification email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create HTML template for ticket delivery
   */
  private createTicketDeliveryHTML(
    customerName: string,
    event: any,
    order: any,
    tickets: any[],
  ): string {
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const ticketsHTML = tickets
      .map(
        (ticket, index) => `
      <div style="border: 2px solid #3b82f6; border-radius: 12px; margin-bottom: 20px; overflow: hidden; background-color: #ffffff;">
        <!-- Ticket Header -->
        <div style="background-color: #3b82f6; color: #ffffff; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0; font-size: 16px;">Tiket #${index + 1}</h4>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${ticket.ticketType}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">Nomor Tiket</p>
            <p style="margin: 0; font-size: 14px; font-weight: bold;">${ticket.ticketNumber}</p>
          </div>
        </div>

        <!-- Ticket Body -->
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280;">Nama Pemegang Tiket:</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold;">${ticket.holderName}</p>
            </div>
            ${
              ticket.qrCode
                ? `
            <div style="text-align: center;">
              <img src="${ticket.qrCode}" alt="QR Code" style="width: 80px; height: 80px; border: 1px solid #e5e7eb; border-radius: 4px;" />
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">QR Code</p>
            </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiket Anda - ${event.title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 30px 20px; text-align: center;">
      <h1 style="font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">🎉 Tiket Anda Sudah Siap!</h1>
      <p style="font-size: 16px; margin: 0; opacity: 0.9;">Terima kasih telah mempercayai ${this.config.companyName}</p>
    </div>

    ${
      event.image
        ? `
    <!-- Event Banner -->
    <div style="height: 200px; background-image: url(${event.image}); background-size: cover; background-position: center; position: relative;">
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: #ffffff; padding: 20px;">
        <h2 style="font-size: 24px; margin: 0; font-weight: bold;">${event.title}</h2>
      </div>
    </div>
    `
        : ""
    }

    <!-- Main Content -->
    <div style="padding: 30px 20px;">
      <p style="font-size: 16px; margin-bottom: 20px;">Halo <strong>${customerName}</strong>,</p>

      <p style="font-size: 16px; margin-bottom: 30px;">
        Pembayaran Anda telah berhasil dikonfirmasi! Berikut adalah tiket digital Anda untuk event <strong>${event.title}</strong>.
      </p>

      <!-- Event Details -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">📅 Detail Event</h3>

        <div style="display: grid; gap: 10px;">
          <div><span style="font-weight: bold; color: #4b5563;">Event:</span> ${event.title}</div>
          <div><span style="font-weight: bold; color: #4b5563;">Tanggal:</span> ${event.date}</div>
          <div><span style="font-weight: bold; color: #4b5563;">Waktu:</span> ${event.time}</div>
          <div><span style="font-weight: bold; color: #4b5563;">Lokasi:</span> ${event.location}</div>
          <div><span style="font-weight: bold; color: #4b5563;">Alamat:</span> ${event.address}</div>
        </div>
      </div>

      <!-- Order Summary -->
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #92400e; font-size: 18px; margin: 0 0 15px 0;">🧾 Ringkasan Pesanan</h3>

        <div style="display: grid; gap: 8px;">
          <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Invoice:</span> <span>${order.invoiceNumber}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Total Bayar:</span> <span style="font-weight: bold; color: #059669;">${formatPrice(order.totalAmount)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Tanggal Bayar:</span> <span>${order.paymentDate}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Jumlah Tiket:</span> <span>${tickets.length} tiket</span></div>
        </div>
      </div>

      <!-- Tickets -->
      <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">🎫 Tiket Digital Anda</h3>

      ${ticketsHTML}

      <!-- Important Notes -->
      <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin-top: 30px;">
        <h3 style="color: #dc2626; font-size: 16px; margin: 0 0 15px 0;">⚠️ Penting - Harap Dibaca!</h3>

        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #7f1d1d;">
          <li style="margin-bottom: 8px;">Simpan email ini sebagai bukti pembelian tiket Anda</li>
          <li style="margin-bottom: 8px;">Tunjukkan QR Code atau nomor tiket saat masuk ke venue</li>
          <li style="margin-bottom: 8px;">Tiket tidak dapat dipindahtangankan tanpa persetujuan penyelenggara</li>
          <li style="margin-bottom: 8px;">Datang 30 menit sebelum acara dimulai untuk proses check-in</li>
          <li style="margin-bottom: 0;">Hubungi customer service jika ada pertanyaan</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 0 0 10px 0;">Terima kasih telah menggunakan ${this.config.companyName}</p>
      <p style="margin: 0 0 10px 0;">
        Butuh bantuan? Hubungi kami di
        <a href="mailto:${this.config.replyTo}" style="color: #3b82f6;">${this.config.replyTo}</a>
      </p>
      <p style="margin: 0;">© 2025 ${this.config.companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send ticket delivery email
   */
  async sendTicketDelivery({
    to,
    customerName,
    event,
    order,
    tickets,
  }: {
    to: string;
    customerName: string;
    event: {
      title: string;
      date: string;
      time: string;
      location: string;
      address: string;
      image?: string;
    };
    order: {
      invoiceNumber: string;
      totalAmount: number;
      paymentDate: string;
    };
    tickets: Array<{
      id: string;
      ticketNumber: string;
      ticketType: string;
      holderName: string;
      qrCode?: string;
    }>;
  }) {
    try {
      const htmlContent = this.createTicketDeliveryHTML(
        customerName,
        event,
        order,
        tickets,
      );

      // Create text version
      const textContent = this.createTicketDeliveryTextEmail({
        customerName,
        event,
        order,
        tickets,
      });

      const result = await resend.emails.send({
        from: this.config.from,
        to: [to],
        replyTo: this.config.replyTo,
        subject: `🎫 Tiket Anda - ${event.title} | ${order.invoiceNumber}`,
        html: htmlContent,
        text: textContent,
        tags: [
          { name: "category", value: "ticket-delivery" },
          { name: "event", value: event.title },
          { name: "invoice", value: order.invoiceNumber },
        ],
      });

      console.log("✅ Ticket delivery email sent:", result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error: any) {
      console.error("❌ Failed to send ticket delivery email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create plain text version of ticket delivery email
   */
  private createTicketDeliveryTextEmail({
    customerName,
    event,
    order,
    tickets,
  }: {
    customerName: string;
    event: any;
    order: any;
    tickets: any[];
  }): string {
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return `
🎉 TIKET ANDA SUDAH SIAP!

Halo ${customerName},

Pembayaran Anda telah berhasil dikonfirmasi! Berikut adalah tiket digital Anda untuk event ${event.title}.

📅 DETAIL EVENT
Event: ${event.title}
Tanggal: ${event.date}
Waktu: ${event.time}
Lokasi: ${event.location}
Alamat: ${event.address}

🧾 RINGKASAN PESANAN
Invoice: ${order.invoiceNumber}
Total Bayar: ${formatPrice(order.totalAmount)}
Tanggal Bayar: ${order.paymentDate}
Jumlah Tiket: ${tickets.length} tiket

🎫 TIKET DIGITAL ANDA
${tickets
  .map(
    (ticket, index) => `
Tiket #${index + 1}
- Jenis: ${ticket.ticketType}
- Nomor: ${ticket.ticketNumber}
- Pemegang: ${ticket.holderName}
`,
  )
  .join("")}

⚠️ PENTING - HARAP DIBACA!
- Simpan email ini sebagai bukti pembelian tiket Anda
- Tunjukkan QR Code atau nomor tiket saat masuk ke venue
- Tiket tidak dapat dipindahtangankan tanpa persetujuan penyelenggara
- Datang 30 menit sebelum acara dimulai untuk proses check-in
- Hubungi customer service jika ada pertanyaan

Terima kasih telah menggunakan ${this.config.companyName}

Butuh bantuan? Hubungi kami di support@vbticket.com

© 2025 ${this.config.companyName}. All rights reserved.
    `.trim();
  }

  /**
   * Send a generic email (for custom use cases)
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
    tags = [],
  }: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    tags?: Array<{ name: string; value: string }>;
  }) {
    try {
      const result = await resend.emails.send({
        from: this.config.from,
        to: Array.isArray(to) ? to : [to],
        replyTo: this.config.replyTo,
        subject,
        html,
        text,
        tags,
      });

      console.log("✅ Email sent:", result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error: any) {
      console.error("❌ Failed to send email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test email configuration
   */
  async testConfiguration() {
    try {
      // Send a simple test email
      const result = await this.sendEmail({
        to: "test@example.com",
        subject: "Test Email Configuration",
        html: "<p>This is a test email to verify configuration.</p>",
        text: "This is a test email to verify configuration.",
        tags: [{ name: "category", value: "test" }],
      });

      return result;
    } catch (error: any) {
      console.error("❌ Email configuration test failed:", error);
      return { success: false, error: error.message };
    }
  }
}

// Export default instance
export const emailService = new EmailService();

// Export types for use in other files
export type { EmailConfig };
