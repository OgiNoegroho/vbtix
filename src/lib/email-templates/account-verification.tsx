import React from 'react';

interface AccountVerificationEmailProps {
  userName: string;
  verificationUrl: string;
  companyName?: string;
}

export const AccountVerificationEmail: React.FC<AccountVerificationEmailProps> = ({
  userName,
  verificationUrl,
  companyName = "VBTicket"
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verifikasi Akun - {companyName}</title>
      </head>
      <body style={{ 
        fontFamily: 'Arial, sans-serif', 
        lineHeight: '1.6', 
        color: '#333333',
        margin: 0,
        padding: 0,
        backgroundColor: '#f4f4f4'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            paddingBottom: '20px',
            borderBottom: '2px solid #3b82f6'
          }}>
            <h1 style={{
              color: '#3b82f6',
              fontSize: '28px',
              margin: '0',
              fontWeight: 'bold'
            }}>
              {companyName}
            </h1>
            <p style={{
              color: '#666666',
              fontSize: '14px',
              margin: '5px 0 0 0'
            }}>
              Platform Tiket Event Terpercaya
            </p>
          </div>

          {/* Main Content */}
          <div style={{ padding: '30px 0' }}>
            <h2 style={{
              color: '#1f2937',
              fontSize: '24px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🎉 Selamat Datang di {companyName}!
            </h2>

            <p style={{
              fontSize: '16px',
              marginBottom: '20px'
            }}>
              Halo <strong>{userName}</strong>,
            </p>

            <p style={{
              fontSize: '16px',
              marginBottom: '20px'
            }}>
              Terima kasih telah mendaftar di {companyName}! Untuk melengkapi proses pendaftaran dan mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini.
            </p>

            {/* Verification Button */}
            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <a 
                href={verificationUrl}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  padding: '15px 30px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                }}
              >
                ✅ Verifikasi Email Saya
              </a>
            </div>

            <p style={{
              fontSize: '14px',
              color: '#666666',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              Atau salin dan tempel link berikut di browser Anda:
            </p>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #e9ecef',
              wordBreak: 'break-all',
              fontSize: '14px',
              color: '#495057'
            }}>
              {verificationUrl}
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              padding: '15px',
              marginTop: '20px'
            }}>
              <p style={{
                margin: '0',
                fontSize: '14px',
                color: '#92400e'
              }}>
                <strong>⚠️ Penting:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi ini, abaikan email ini.
              </p>
            </div>

            <h3 style={{
              color: '#1f2937',
              fontSize: '18px',
              marginTop: '30px',
              marginBottom: '15px'
            }}>
              Setelah verifikasi, Anda dapat:
            </h3>

            <ul style={{
              fontSize: '14px',
              color: '#4b5563',
              paddingLeft: '20px'
            }}>
              <li style={{ marginBottom: '8px' }}>🎫 Membeli tiket event favorit Anda</li>
              <li style={{ marginBottom: '8px' }}>📱 Mengelola tiket digital dengan mudah</li>
              <li style={{ marginBottom: '8px' }}>🔔 Mendapatkan notifikasi event terbaru</li>
              <li style={{ marginBottom: '8px' }}>💰 Menikmati promo dan diskon eksklusif</li>
              <li style={{ marginBottom: '8px' }}>📊 Melihat riwayat pembelian tiket</li>
            </ul>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>
              Email ini dikirim oleh {companyName}
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              Jika Anda memiliki pertanyaan, hubungi kami di{' '}              <a href="mailto:support@vbticket.com" style={{ color: '#3b82f6' }}>
                support@vbticket.com
              </a>
            </p>
            <p style={{ margin: '0' }}>
              © 2025 {companyName}. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

// Plain text version for email clients that don't support HTML
export const getAccountVerificationTextEmail = (
  userName: string,
  verificationUrl: string,
  companyName: string = "VBTicket"
) => {
  return `
Selamat Datang di ${companyName}!

Halo ${userName},

Terima kasih telah mendaftar di ${companyName}! Untuk melengkapi proses pendaftaran dan mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik link berikut:

${verificationUrl}

Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi ini, abaikan email ini.

Setelah verifikasi, Anda dapat:
- Membeli tiket event favorit Anda
- Mengelola tiket digital dengan mudah
- Mendapatkan notifikasi event terbaru
- Menikmati promo dan diskon eksklusif
- Melihat riwayat pembelian tiket

Jika Anda memiliki pertanyaan, hubungi kami di support@vbticket.com

© 2025 ${companyName}. All rights reserved.
  `.trim();
};
