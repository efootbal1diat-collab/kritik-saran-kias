"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";

const SECURITY = ["Pos Utama 1", "Pos Utara", "Pos Selatan", "Lainnya"];

export default function FormSecurity() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_security: "",
    ramah_sopan: 0,
    siaga_disiplin: 0,
    tegas_humanis: 0,
    rutinitas_patroli: 0,
    kesiagaan_pos: 0,
    tanggap_darurat: 0,
    arah_lalu_lintas: 0,
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
      
      const { error } = await supabase.from("survey_security").insert([
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

  const isFormValid = form.nama_security && 
    form.ramah_sopan > 0 && form.siaga_disiplin > 0 && form.tegas_humanis > 0 && 
    form.rutinitas_patroli > 0 && form.kesiagaan_pos > 0 && 
    form.tanggap_darurat > 0 && form.arah_lalu_lintas > 0;

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-green-700 mb-2">C. Layanan Security</h1>
      <p className="text-sm text-slate-600 mb-6">Berikan penilaian bintang 1 sampai 5.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Nama Pos / Security yang Bertanggung Jawab</label>
          <select
            required
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
            value={form.nama_security}
            onChange={(e) => handleChange("nama_security", e.target.value)}
          >
            <option value="" disabled>Pilih nama/pos...</option>
            {SECURITY.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-slate-800 mb-4">A. Sikap & Profesionalisme Personel</h2>
          <div className="flex flex-col gap-5">
            <StarRating label="Petugas security bersikap ramah, sopan, dan memberi salam" value={form.ramah_sopan} onChange={(v) => handleChange("ramah_sopan", v)} />
            <StarRating label="Petugas menunjukkan sikap siaga dan disiplin saat bertugas" value={form.siaga_disiplin} onChange={(v) => handleChange("siaga_disiplin", v)} />
            <StarRating label="Petugas bersikap tegas namun tetap humanis dalam menegakkan aturan" value={form.tegas_humanis} onChange={(v) => handleChange("tegas_humanis", v)} />
            <StarRating label="Rutinitas dan ketelitian dalam melakukan patroli keliling area perusahaan" value={form.rutinitas_patroli} onChange={(v) => handleChange("rutinitas_patroli", v)} />
            <StarRating label="Keberadaan dan kesiagaan petugas di pos jaga" value={form.kesiagaan_pos} onChange={(v) => handleChange("kesiagaan_pos", v)} />
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-slate-800 mb-4">B. Tanggap Darurat & Penanganan Masalah</h2>
          <div className="flex flex-col gap-5">
            <StarRating label="Petugas cepat tanggap saat dimintai bantuan atau menghadapi keluhan" value={form.tanggap_darurat} onChange={(v) => handleChange("tanggap_darurat", v)} />
            <StarRating label="Petugas mengarahkan arus lalu lintas saat keluar masuk kendaraan" value={form.arah_lalu_lintas} onChange={(v) => handleChange("arah_lalu_lintas", v)} />
          </div>
        </div>

        <div className="border-t pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Saran Perbaikan / Komentar (Opsional)</label>
            <textarea
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Tuliskan saran Anda di sini..."
              value={form.saran}
              onChange={(e) => handleChange("saran", e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
        >
          {loading ? "Mengirim..." : "Kirim Penilaian"}
        </button>
      </form>
    </div>
  );
}
