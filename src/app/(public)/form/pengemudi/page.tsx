"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { RadioGroup } from "@/components/RadioGroup";

const DRIVERS = ["Budi Santoso", "Andi Irawan", "Joko Widodo", "Supriadi", "Lainnya"];

export default function FormPengemudi() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_pengemudi: "",
    keselamatan: "",
    komunikasi: "",
    ketepatan_waktu: "",
    kebersihan: "",
    kepuasan_keseluruhan: "",
    saran: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pekerjaan = sessionStorage.getItem("pekerjaan") || "Anonim";
      
      const { error } = await supabase.from("survey_pengemudi").insert([
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

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-blue-700 mb-2">A. Layanan Pengemudi</h1>
      <p className="text-sm text-slate-600 mb-6">Silakan isi penilaian Anda dengan jujur.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Nama Pengemudi</label>
          <select
            required
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            value={form.nama_pengemudi}
            onChange={(e) => handleChange("nama_pengemudi", e.target.value)}
          >
            <option value="" disabled>Pilih nama pengemudi...</option>
            {DRIVERS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <RadioGroup
          label="Tentang keselamatan mengemudi"
          options={["Sangat Aman", "Aman", "Agak Kasar", "Kadang terasa berbahaya"]}
          value={form.keselamatan}
          onChange={(val) => handleChange("keselamatan", val)}
        />

        <RadioGroup
          label="Tentang Komunikasi (bahasa, sikap, dll)"
          options={["Sangat Baik", "Baik", "Biasa Saja", "Perlu Perbaikan"]}
          value={form.komunikasi}
          onChange={(val) => handleChange("komunikasi", val)}
        />

        <RadioGroup
          label="Ketepatan waktu"
          options={["Datang tepat waktu", "Terlambat", "Tidak dapat dihubungi"]}
          value={form.ketepatan_waktu}
          onChange={(val) => handleChange("ketepatan_waktu", val)}
        />

        <RadioGroup
          label="Kebersihan di dalam kendaraan"
          options={["Bersih", "Cukup Bersih", "Agak Kotor", "Kotor"]}
          value={form.kebersihan}
          onChange={(val) => handleChange("kebersihan", val)}
        />

        <RadioGroup
          label="Kepuasan secara keseluruhan"
          options={["Sangat puas", "Puas", "Biasa Saja", "Agak Tidak Puas", "Tidak Puas"]}
          value={form.kepuasan_keseluruhan}
          onChange={(val) => handleChange("kepuasan_keseluruhan", val)}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Saran Perbaikan / Komentar (Opsional)</label>
          <textarea
            rows={4}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Tuliskan saran Anda di sini..."
            value={form.saran}
            onChange={(e) => handleChange("saran", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.nama_pengemudi || !form.keselamatan || !form.komunikasi || !form.ketepatan_waktu || !form.kebersihan || !form.kepuasan_keseluruhan}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
        >
          {loading ? "Mengirim..." : "Kirim Penilaian"}
        </button>
      </form>
    </div>
  );
}
