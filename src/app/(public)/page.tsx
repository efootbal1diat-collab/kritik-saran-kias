"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, Building2, Check } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [pekerjaan, setPekerjaan] = useState("");
  const [plant, setPlant] = useState("");

  useEffect(() => {
    // Reset dan hapus sesi sebelumnya agar form selalu bersih saat dibuka/direfresh
    sessionStorage.removeItem("pekerjaan");
    sessionStorage.removeItem("plant");
    setPekerjaan("");
    setPlant("");
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pekerjaan.trim() || !plant) {
      return;
    }
    sessionStorage.setItem("pekerjaan", pekerjaan.trim());
    sessionStorage.setItem("plant", plant);
    router.push("/pilih-layanan");
  };

  const isReady = pekerjaan.trim().length > 0 && plant !== "";

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-10">
      <div className="mb-6 bg-white p-2 border border-slate-100 rounded-xl shadow-xs">
        <img
          src="/logo-kias.jpg"
          alt="PT. Karanganyar Indo Auto Systems"
          className="h-14 sm:h-18 w-auto object-contain"
        />
      </div>
      <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
        Selamat Datang
      </h1>
      <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
        Silakan isi nama anonim dan pilih plant lokasi Anda sebelum mengisi survei.
      </p>

      <form onSubmit={handleNext} autoComplete="off" className="w-full max-w-sm">
        {/* Input Nama Anonim */}
        <div className="mb-5">
          <label htmlFor="pekerjaan" className="block text-sm font-medium text-slate-700 mb-2">
            Masukan Nama Anonim <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="pekerjaan"
            value={pekerjaan}
            onChange={(e) => setPekerjaan(e.target.value)}
            placeholder="Ketik nama anonim..."
            required
            autoComplete="off"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 ease-in-out"
          />
        </div>

        {/* Pilihan Plant (Dua Tombol Kartu Berdampingan) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Pilih Plant <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPlant("KIAS 1")}
              className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer relative ${
                plant === "KIAS 1"
                  ? "border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {plant === "KIAS 1" && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <Building2 className={`w-6 h-6 ${plant === "KIAS 1" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="font-bold text-sm tracking-wide">KIAS 1</span>
              <span className="text-[11px] text-slate-500">Plant 1</span>
            </button>

            <button
              type="button"
              onClick={() => setPlant("KIAS 2")}
              className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer relative ${
                plant === "KIAS 2"
                  ? "border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {plant === "KIAS 2" && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <Building2 className={`w-6 h-6 ${plant === "KIAS 2" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="font-bold text-sm tracking-wide">KIAS 2</span>
              <span className="text-[11px] text-slate-500">Plant 2</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            *Nama anonim dan pilihan plant wajib diisi sebelum melanjutkan.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isReady}
          className={`w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out shadow-sm ${
            isReady
              ? "bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 active:scale-95 cursor-pointer hover:shadow-md"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Masuk
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </form>

      <div className="mt-12 text-center">
        <a href="/admin/login" className="text-xs text-slate-400 hover:text-slate-600 transition-all duration-300 ease-in-out">
          Login Admin GA
        </a>
      </div>
    </div>
  );
}
