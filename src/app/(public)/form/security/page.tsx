"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";

const POS_SECURITY = ["Pos Jaga Utama / Gate 1", "Pos Jaga 2", "Pos Jaga 3", "Lainnya..."];

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
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === item.val ? 'border-green-600' : 'border-slate-300 group-hover:border-green-500'}`}>
              {value === item.val && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
            </div>
            <input
              type="radio"
              className="hidden"
              checked={value === item.val}
              onChange={() => onChange(item.val)}
            />
            <span className={`text-sm ${value === item.val ? 'text-green-800 font-medium' : 'text-slate-600'}`}>{item.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FormSecurity() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_security: "",
    sikap_petugas: 0,
    respons_pelayanan: 0,
    rasa_aman: 0,
    ketegasan_kedisiplinan: 0,
    kontrol_akses: 0,
    penanganan_kejadian: 0,
    kepatuhan_sop: 0,
    komunikasi: 0,
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
    form.sikap_petugas > 0 && form.respons_pelayanan > 0 && form.rasa_aman > 0 && 
    form.ketegasan_kedisiplinan > 0 && form.kontrol_akses > 0 && form.penanganan_kejadian > 0 && 
    form.kepatuhan_sop > 0 && form.komunikasi > 0 && form.kepuasan_keseluruhan > 0;

  return (
    <div className="py-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-green-700 mb-2 underline text-center">KUESIONER KEPUASAN LAYANAN SECURITY GA</h1>
      
      <div className="bg-green-50 border border-green-100 p-4 rounded-xl mb-6 mt-4">
        <h2 className="font-semibold text-green-800 mb-1">Tujuan:</h2>
        <p className="text-sm text-green-700 mb-3">Untuk mengetahui tingkat kepuasan pengguna terhadap layanan Security GA serta mendapatkan masukan untuk peningkatan kualitas pelayanan.</p>
        <h2 className="font-semibold text-green-800 mb-1">Petunjuk Pengisian:</h2>
        <p className="text-sm text-green-700">Berikan penilaian sesuai pengalaman Anda menggunakan layanan Security GA.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-800">Pilih Pos / Area Security:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {POS_SECURITY.map((p) => (
              <label
                key={p}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  form.nama_security === p
                    ? "border-green-600 bg-green-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${form.nama_security === p ? 'border-green-600' : 'border-slate-300'}`}>
                  {form.nama_security === p && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={form.nama_security === p}
                  onChange={() => handleChange("nama_security", p)}
                />
                <span className={`text-sm font-medium ${form.nama_security === p ? 'text-green-900' : 'text-slate-700'}`}>{p}</span>
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
            <h2 className="font-bold text-slate-800">C. Penilaian Layanan Security</h2>
          </div>

          <div className="flex flex-col gap-4">
            <RadioScale 
              label="1. Keramahan & Sikap Petugas (Bagaimana Anda menilai sikap dan keramahan petugas security?)" 
              value={form.sikap_petugas} 
              onChange={(v) => handleChange("sikap_petugas", v)} 
            />
            <RadioScale 
              label="2. Respons Pelayanan (Bagaimana respons security terhadap kebutuhan atau permintaan pengguna?)" 
              value={form.respons_pelayanan} 
              onChange={(v) => handleChange("respons_pelayanan", v)} 
            />
            <RadioScale 
              label="3. Rasa Aman (Seberapa baik security memberikan rasa aman di area kerja?)" 
              value={form.rasa_aman} 
              onChange={(v) => handleChange("rasa_aman", v)} 
            />
            <RadioScale 
              label="4. Ketegasan & Kedisiplinan (Bagaimana Anda menilai ketegasan dan kedisiplinan security?)" 
              value={form.ketegasan_kedisiplinan} 
              onChange={(v) => handleChange("ketegasan_kedisiplinan", v)} 
            />
            <RadioScale 
              label="5. Kontrol Akses (Bagaimana Anda menilai pelaksanaan kontrol akses oleh security?)" 
              value={form.kontrol_akses} 
              onChange={(v) => handleChange("kontrol_akses", v)} 
            />
            <RadioScale 
              label="6. Penanganan Kejadian (Bagaimana Anda menilai kemampuan security menangani kejadian?)" 
              value={form.penanganan_kejadian} 
              onChange={(v) => handleChange("penanganan_kejadian", v)} 
            />
            <RadioScale 
              label="7. Kepatuhan SOP (Bagaimana Anda menilai kepatuhan security terhadap SOP?)" 
              value={form.kepatuhan_sop} 
              onChange={(v) => handleChange("kepatuhan_sop", v)} 
            />
            <RadioScale 
              label="8. Komunikasi (Bagaimana Anda menilai komunikasi petugas security?)" 
              value={form.komunikasi} 
              onChange={(v) => handleChange("komunikasi", v)} 
            />
          </div>
        </div>

        <div className="border-t pt-6 pb-2">
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <h2 className="font-bold text-slate-800 mb-2">9. Kepuasan Keseluruhan</h2>
            <p className="text-sm text-slate-600 mb-4">Secara keseluruhan, bagaimana kepuasan Anda terhadap layanan Security GA?</p>
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
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-shadow"
              placeholder="...................................................................................................."
              value={form.saran_baik}
              onChange={(e) => handleChange("saran_baik", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Hal yang perlu diperbaiki:</label>
            <textarea
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-shadow"
              placeholder="...................................................................................................."
              value={form.saran_perbaikan}
              onChange={(e) => handleChange("saran_perbaikan", e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] mt-4"
        >
          {loading ? "Mengirim..." : "Kirim Penilaian"}
        </button>
      </form>
    </div>
  );
}
