"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [pekerjaan, setPekerjaan] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (pekerjaan) {
      sessionStorage.setItem("pekerjaan", pekerjaan);
    } else {
      sessionStorage.removeItem("pekerjaan"); // clear if empty
    }
    router.push("/pilih-layanan");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-10">
      <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
        Selamat Datang
      </h1>
      <p className="text-center text-slate-600 mb-8 max-w-sm">
        Silakan isi survey kepuasan layanan kami. Masukan Anda sangat berarti bagi peningkatan kualitas layanan.
      </p>

      <form onSubmit={handleNext} className="w-full max-w-sm">
        <div className="mb-6">
          <label htmlFor="pekerjaan" className="block text-sm font-medium text-slate-700 mb-2">
            Masukan nama anonim
          </label>
          <input
            type="text"
            id="pekerjaan"
            value={pekerjaan}
            onChange={(e) => setPekerjaan(e.target.value)}
            placeholder="Ketik nama anonim..."
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <p className="text-xs text-slate-500 mt-2">
            *Anda dapat membiarkan ini kosong untuk menjawab secara anonim.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
        >
          Masuk
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
