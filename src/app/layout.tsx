import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kritik & Saran KIAS",
  description: "Survey Kepuasan Layanan KIAS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto flex items-center justify-center font-bold text-lg tracking-wide">
            Kritik & Saran KIAS
          </div>
        </header>
        <main className="max-w-md mx-auto w-full flex-grow p-4 bg-white shadow-sm min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
