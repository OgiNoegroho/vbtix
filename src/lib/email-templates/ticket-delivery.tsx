import React from 'react';

interface TicketInfo {
  id: string;
  ticketNumber: string;
  ticketType: string;
  holderName: string;
  qrCode?: string;
}

interface EventInfo {
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  image?: string;
}

interface OrderInfo {
  invoiceNumber: string;
  totalAmount: number;
  paymentDate: string;
}

interface TicketDeliveryEmailProps {
  customerName: string;
  event: EventInfo;
  order: OrderInfo;
  tickets: TicketInfo[];
  companyName?: string;
}

export const TicketDeliveryEmail: React.FC<TicketDeliveryEmailProps> = ({
  customerName,
  event,
  order,
  tickets,
  companyName = "VBTicket"
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tiket Anda - {event.title}</title>
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
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#ffffff',
            padding: '30px 20px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '28px',
              margin: '0 0 10px 0',
              fontWeight: 'bold'
            }}>
              🎉 Tiket Anda Sudah Siap!
            </h1>
            <p style={{
              fontSize: '16px',
              margin: '0',
              opacity: '0.9'
            }}>
              Terima kasih telah mempercayai {companyName}
            </p>
          </div>

          {/* Event Banner */}
          {event.image && (
            <div style={{
              height: '200px',
              backgroundImage: `url(${event.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                color: '#ffffff',
                padding: '20px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  {event.title}
                </h2>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div style={{ padding: '30px 20px' }}>
            <p style={{
              fontSize: '16px',
              marginBottom: '20px'
            }}>
              Halo <strong>{customerName}</strong>,
            </p>

            <p style={{
              fontSize: '16px',
              marginBottom: '30px'
            }}>
              Pembayaran Anda telah berhasil dikonfirmasi! Berikut adalah tiket digital Anda untuk event <strong>{event.title}</strong>.
            </p>

            {/* Event Details */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#1f2937',
                fontSize: '18px',
                margin: '0 0 15px 0',
                borderBottom: '2px solid #3b82f6',
                paddingBottom: '5px'
              }}>
                📅 Detail Event
              </h3>
              
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '80px', color: '#4b5563' }}>Event:</span>
                  <span>{event.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '80px', color: '#4b5563' }}>Tanggal:</span>
                  <span>{event.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '80px', color: '#4b5563' }}>Waktu:</span>
                  <span>{event.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '80px', color: '#4b5563' }}>Lokasi:</span>
                  <span>{event.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '80px', color: '#4b5563' }}>Alamat:</span>
                  <span>{event.address}</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#92400e',
                fontSize: '18px',
                margin: '0 0 15px 0'
              }}>
                🧾 Ringkasan Pesanan
              </h3>
              
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>Invoice:</span>
                  <span>{order.invoiceNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>Total Bayar:</span>
                  <span style={{ fontWeight: 'bold', color: '#059669' }}>{formatPrice(order.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>Tanggal Bayar:</span>
                  <span>{order.paymentDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>Jumlah Tiket:</span>
                  <span>{tickets.length} tiket</span>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <h3 style={{
              color: '#1f2937',
              fontSize: '20px',
              margin: '0 0 20px 0',
              textAlign: 'center'
            }}>
              🎫 Tiket Digital Anda
            </h3>

            {tickets.map((ticket, index) => (
              <div key={ticket.id} style={{
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                marginBottom: '20px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                {/* Ticket Header */}
                <div style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  padding: '15px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: '0', fontSize: '16px' }}>Tiket #{index + 1}</h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: '0.9' }}>
                      {ticket.ticketType}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0', fontSize: '12px', opacity: '0.8' }}>Nomor Tiket</p>
                    <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>
                      {ticket.ticketNumber}
                    </p>
                  </div>
                </div>

                {/* Ticket Body */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#6b7280' }}>
                        Nama Pemegang Tiket:
                      </p>
                      <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                        {ticket.holderName}
                      </p>
                    </div>
                    
                    {ticket.qrCode && (
                      <div style={{ textAlign: 'center' }}>
                        <img 
                          src={ticket.qrCode} 
                          alt="QR Code" 
                          style={{ 
                            width: '80px', 
                            height: '80px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px'
                          }} 
                        />
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                          QR Code
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Important Notes */}
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '30px'
            }}>
              <h3 style={{
                color: '#dc2626',
                fontSize: '16px',
                margin: '0 0 15px 0'
              }}>
                ⚠️ Penting - Harap Dibaca!
              </h3>
              
              <ul style={{
                margin: '0',
                paddingLeft: '20px',
                fontSize: '14px',
                color: '#7f1d1d'
              }}>
                <li style={{ marginBottom: '8px' }}>
                  Simpan email ini sebagai bukti pembelian tiket Anda
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Tunjukkan QR Code atau nomor tiket saat masuk ke venue
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Tiket tidak dapat dipindahtangankan tanpa persetujuan penyelenggara
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Datang 30 menit sebelum acara dimulai untuk proses check-in
                </li>
                <li style={{ marginBottom: '0' }}>
                  Hubungi customer service jika ada pertanyaan
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>
              Terima kasih telah menggunakan {companyName}
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              Butuh bantuan? Hubungi kami di{' '}              <a href="mailto:support@vbticket.com" style={{ color: '#3b82f6' }}>
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
