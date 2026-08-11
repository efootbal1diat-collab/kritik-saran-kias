"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";

const KANTIN = ["Kantin A (Bu Ratna)", "Kantin B (Bu Saminem)", "Kantin C (Bu Sumini)", "Catering / Vendor"];

// Komponen Radio Button 1-4 Khusus Skala Penilaian
function RadioScale({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <div className="flex flex-col gap-2">
        {[
          { val: 4, text: "4. Sangat Baik" },
          { val: 3, text: "3. Baik" },
          { val: 2, text: "2. Kurang Baik" },
          { val: 1, text: "1. Tidak Baik" },
        ].map((item) => (
          <label key={item.val} className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === item.val ? 'border-orange-500' : 'border-slate-300 group-hover:border-orange-400'}`}>
              {value === item.val && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
            </div>
            <input
              type="radio"
              className="hidden"
              checked={value === item.val}
              onChange={() => onChange(item.val)}
            />
            <span className={`text-sm ${value === item.val ? 'text-orange-700 font-medium' : 'text-slate-600'}`}>{item.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FormKantin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_kantin: "",
    kualitas_rasa: 0,
    kebersihan_higiene: 0,
    variasi_menu: 0,
    porsi_makanan: 0,
    ketepatan_waktu: 0,
    kebersihan_area: 0,
    sikap_petugas: 0,
    respons_masukan: 0,
    kepuasan_keseluruhan: 0,
    saran_baik: "",
    saran_perbaikan: "",
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
    form.kualitas_rasa > 0 && form.kebersihan_higiene > 0 && form.variasi_menu > 0 && form.porsi_makanan > 0 &&
    form.ketepatan_waktu > 0 && form.kebersihan_area > 0 && form.sikap_petugas > 0 && form.respons_masukan > 0 &&
    form.kepuasan_keseluruhan > 0;

  return (
    <div className="py-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-2 underline text-center">KUESIONER KEPUASAN LAYANAN KANTIN / CATERING</h1>
      
      <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl mb-6 mt-4">
        <h2 className="font-semibold text-slate-800 mb-1">Tujuan:</h2>
        <p className="text-sm text-slate-700 mb-3">Untuk mengetahui tingkat kepuasan pengguna terhadap layanan Kantin/Catering serta mendapatkan masukan untuk peningkatan kualitas pelayanan.</p>
        <h2 className="font-semibold text-slate-800 mb-1">Petunjuk Pengisian:</h2>
        <p className="text-sm text-slate-700">Berikan penilaian sesuai pengalaman Anda menggunakan layanan Kantin/Catering.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-800">Pilih Kantin / Vendor:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {KANTIN.map((k) => (
              <label
                key={k}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  form.nama_kantin === k
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${form.nama_kantin === k ? 'border-orange-500' : 'border-slate-300'}`}>
                  {form.nama_kantin === k && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={form.nama_kantin === k}
                  onChange={() => handleChange("nama_kantin", k)}
                />
                <span className={`text-sm font-medium ${form.nama_kantin === k ? 'text-orange-900' : 'text-slate-700'}`}>{k}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-4">
            <h2 className="font-bold text-slate-800">Skala Penilaian: Nilai</h2>
            <p className="text-xs text-slate-600">Keterangan :<br/>4 - Sangat Baik ; 3 - Baik ; 2 - Kurang Baik ; 1 - Tidak Baik</p>
          </div>
          
          <div className="mb-4 mt-2">
            <h2 className="font-bold text-slate-800">B. Penilaian Layanan Kantin / Catering</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <RadioScale 
              label="1. Kualitas Rasa Makanan (Bagaimana Anda menilai kualitas rasa makanan yang disediakan?)" 
              value={form.kualitas_rasa} 
              onChange={(v) => handleChange("kualitas_rasa", v)} 
            />
            <RadioScale 
              label="2. Kebersihan & Higiene Makanan (Bagaimana Anda menilai kebersihan makanan dan proses penyajiannya?)" 
              value={form.kebersihan_higiene} 
              onChange={(v) => handleChange("kebersihan_higiene", v)} 
            />
            <RadioScale 
              label="3. Variasi Menu (Bagaimana Anda menilai variasi menu yang tersedia?)" 
              value={form.variasi_menu} 
              onChange={(v) => handleChange("variasi_menu", v)} 
            />
            <RadioScale 
              label="4. Ketersediaan / Porsi Makanan (Bagaimana Anda menilai ketersediaan dan porsi makanan?)" 
              value={form.porsi_makanan} 
              onChange={(v) => handleChange("porsi_makanan", v)} 
            />
            <RadioScale 
              label="5. Ketepatan Waktu Pelayanan (Bagaimana Anda menilai ketepatan waktu penyediaan makanan?)" 
              value={form.ketepatan_waktu} 
              onChange={(v) => handleChange("ketepatan_waktu", v)} 
            />
            <RadioScale 
              label="6. Kebersihan Area Kantin (Bagaimana Anda menilai kebersihan dan kenyamanan area kantin?)" 
              value={form.kebersihan_area} 
              onChange={(v) => handleChange("kebersihan_area", v)} 
            />
            <RadioScale 
              label="7. Sikap Petugas Kantin/Catering (Bagaimana Anda menilai sikap dan keramahan petugas kantin/catering?)" 
              value={form.sikap_petugas} 
              onChange={(v) => handleChange("sikap_petugas", v)} 
            />
            <RadioScale 
              label="8. Respons terhadap Masukan (Bagaimana respons vendor terhadap masukan atau keluhan?)" 
              value={form.respons_masukan} 
              onChange={(v) => handleChange("respons_masukan", v)} 
            />
          </div>
        </div>

        <div className="border-t pt-6 pb-2">
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <h2 className="font-bold text-slate-800 mb-2">9. Kepuasan Keseluruhan</h2>
            <p className="text-sm text-slate-600 mb-4">Secara keseluruhan, bagaimana kepuasan Anda terhadap layanan Kantin/Catering GA?</p>
            <div className="flex">
              <StarRating value={form.kepuasan_keseluruhan} onChange={(v) => handleChange("kepuasan_keseluruhan", v)} />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col gap-4">
          <h2 className="font-bold text-slate-800">10. Masukan dan Saran</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Hal yang sudah baik dan perlu dipertahankan:</label>
            <textarea
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-shadow"
              placeholder="Tuliskan masukan positif Anda di sini..."
              value={form.saran_baik}
              onChange={(e) => handleChange("saran_baik", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Hal yang perlu diperbaiki:</label>
            <textarea
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-shadow"
              placeholder="Tuliskan saran perbaikan Anda di sini..."
              value={form.saran_perbaikan}
              onChange={(e) => handleChange("saran_perbaikan", e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] mt-4"
        >
          {loading ? "Mengirim..." : "Kirim Penilaian"}
        </button>
      </form>
    </div>
  );
}
