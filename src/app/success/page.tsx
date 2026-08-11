"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();

  const handleReturnToServices = () => {
    // Replace current history entry with "/" (Home / Masuk Anonim), then navigate to "/pilih-layanan"
    // So pressing browser Back on "/pilih-layanan" will correctly land on "/" (Masuk Anonim)!
    window.history.replaceState(null, "", "/");
    router.push("/pilih-layanan");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-10 font-sans">
      <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
        Terima Kasih!
      </h1>
      <p className="text-center text-slate-600 mb-8 max-w-sm text-sm">
        Penilaian dan masukan Anda telah berhasil kami terima. Kami akan terus berupaya meningkatkan kualitas layanan kami.
      </p>

      <button
        onClick={handleReturnToServices}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-sm"
      >
        Kembali ke Pilihan Kuesioner
      </button>
    </div>
  );
}
