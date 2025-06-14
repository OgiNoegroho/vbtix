import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Shield, Ticket, CreditCard, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Autentikasi - VBTicket",
    template: "%s - VBTicket",
  },
  description: "Autentikasi untuk aplikasi penjualan tiket konser VBTicket",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen w-screen overflow-hidden bg-gradient-mesh md:grid-cols-2">
      {/* Bagian kiri: Form autentikasi */}
      <div className="flex items-center justify-center overflow-hidden px-4 py-6 sm:px-6 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-sm" />
        <div className="w-full max-w-md relative z-10">
          {/* Form autentikasi */}
          {children}
        </div>
      </div>

      {/* Bagian kanan: Gambar dan informasi */}
      <div className="hidden bg-gradient-brand text-white md:flex md:flex-col md:justify-between md:overflow-hidden md:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="flex h-full flex-col justify-between relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">VBTicket</h1>
                <p className="text-lg text-white/80">
                  Platform tiket konser terpercaya
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 backdrop-blur-xl border border-white/20 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-white flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                Fitur Unggulan
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Pembelian Aman</h3>
                    <p className="text-sm text-white/70">
                      Transaksi terlindungi dengan enkripsi tingkat bank
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Ticket className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">E-Ticket Digital</h3>
                    <p className="text-sm text-white/70">
                      Akses tiket kapan saja dengan QR code unik
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Metode Pembayaran</h3>
                    <p className="text-sm text-white/70">
                      Berbagai pilihan pembayaran yang mudah dan cepat
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Notifikasi Real-time</h3>
                    <p className="text-sm text-white/70">
                      Update event terbaru langsung ke perangkat Anda
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-white/60">
              &copy; {new Date().getFullYear()} VBTicket. Semua hak dilindungi.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/terms"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Syarat dan Ketentuan
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Kebijakan Privasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
