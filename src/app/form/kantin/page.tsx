"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";

const KANTIN = ["Kantin Utama", "Katering Sejahtera", "Katering Rasa Nusantara", "Lainnya"];

export default function FormKantin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_kantin: "",
    rasa_makanan: 0,
    porsi_makanan: 0,
    variasi_menu: 0,
    kondisi_makanan: 0,
    kebersihan_area: 0,
    kebersihan_alat: 0,
    kebersihan_petugas: 0,
    keramahan_petugas: 0,
    kecepatan_pelayanan: 0,
    harga: 0,
    menu_favorit: "",
    saran: "",
  });

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pekerjaan = sessionStorage.getItem("pekerjaan") || "Anonim";
      
      const { error } = await supabase.from("survey_kantin").insert([
        {
          pekerjaan,
          ...form,
        },
      ]);

      if (error) throw error;
      router.push("/success");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengirim data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.nama_kantin && 
    form.rasa_makanan > 0 && form.porsi_makanan > 0 && form.variasi_menu > 0 && form.kondisi_makanan > 0 &&
    form.kebersihan_area > 0 && form.kebersihan_alat > 0 && form.kebersihan_petugas > 0 &&
    form.keramahan_petugas > 0 && form.kecepatan_pelayanan > 0 && form.harga > 0;

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-orange-600 mb-2">B. Layanan Kantin / Catering</h1>
      <p className="text-sm text-slate-600 mb-6">Berikan penilaian bintang 1 sampai 5.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Nama Kantin / Catering</label>
          <select
            required
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
            value={form.nama_kantin}
            onChange={(e) => handleChange("nama_kantin", e.target.value)}
          >
            <option value="" disabled>Pilih nama kantin...</option>
            {KANTIN.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-slate-800 mb-4">Kualitas Makanan & Rasa</h2>
          <div className="flex flex-col gap-5">
            <StarRating label="Rasa makanan lezat dan sesuai selera" value={form.rasa_makanan} onChange={(v) => handleChange("rasa_makanan", v)} />
            <StarRating label="Porsi makanan cukup mengenyangkan" value={form.porsi_makanan} onChange={(v) => handleChange("porsi_makanan", v)} />
            <StarRating label="Variasi menu beragam dan tidak cepat bosan" value={form.variasi_menu} onChange={(v) => handleChange("variasi_menu", v)} />
            <StarRating label="Makanan disajikan dalam kondisi hangat/segar" value={form.kondisi_makanan} onChange={(v) => handleChange("kondisi_makanan", v)} />
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-slate-800 mb-4">Kebersihan & Kesehatan</h2>
          <div className="flex flex-col gap-5">
            <StarRating label="Area makan, meja, dan lantai kantin bersih" value={form.kebersihan_area} onChange={(v) => handleChange("kebersihan_area", v)} />
            <StarRating label="Peralatan makan (piring, sendok, mangkuk) bersih dan steril" value={form.kebersihan_alat} onChange={(v) => handleChange("kebersihan_alat", v)} />
            <StarRating label="Petugas kantin/katering menjaga kebersihan diri" value={form.kebersihan_petugas} onChange={(v) => handleChange("kebersihan_petugas", v)} />
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-slate-800 mb-4">Pelayanan & Fasilitas</h2>
          <div className="flex flex-col gap-5">
            <StarRating label="Petugas bersikap ramah, sopan, dan tanggap" value={form.keramahan_petugas} onChange={(v) => handleChange("keramahan_petugas", v)} />
            <StarRating label="Waktu penyajian atau antrean cepat dan tidak lama" value={form.kecepatan_pelayanan} onChange={(v) => handleChange("kecepatan_pelayanan", v)} />
            <StarRating label="Harga makanan sebanding dengan kualitas dan porsi" value={form.harga} onChange={(v) => handleChange("harga", v)} />
          </div>
        </div>

        <div className="border-t pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Apa sih menu favorit kalian (Opsional)</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Contoh: Ayam Geprek, Nasi Goreng..."
              value={form.menu_favorit}
              onChange={(e) => handleChange("menu_favorit", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Saran Perbaikan / Komentar (Opsional)</label>
            <textarea
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Tuliskan saran Anda di sini..."
              value={form.saran}
              onChange={(e) => handleChange("saran", e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
        >
          {loading ? "Mengirim..." : "Kirim Penilaian"}
        </button>
      </form>
    </div>
  );
}
