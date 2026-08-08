"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-10">
      <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
        Terima Kasih!
      </h1>
      <p className="text-center text-slate-600 mb-8 max-w-sm">
        Penilaian dan masukan Anda telah berhasil kami terima. Kami akan terus berupaya meningkatkan kualitas layanan kami.
      </p>

      <Link
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
      >
        Kembali ke Halaman Awal
      </Link>
    </div>
  );
}
