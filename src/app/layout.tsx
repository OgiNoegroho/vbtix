// src/app/layout.tsx
import { Providers } from './providers';
import '~/styles/globals.css';

export const metadata = {
  title: 'VBTicket - Tiket Konser Online',
  description: 'Platform penjualan tiket konser online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}