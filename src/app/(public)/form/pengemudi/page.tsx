"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";

const DRIVERS = ["Hanan", "Adhit", "Richard", "Boby", "Eric", "Abdur", "Sriyono", "Lainnya..."];

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
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === item.val ? 'border-blue-500' : 'border-slate-300 group-hover:border-blue-400'}`}>
              {value === item.val && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
            </div>
            <input
              type="radio"
              className="hidden"
              checked={value === item.val}
              onChange={() => onChange(item.val)}
            />
            <span className={`text-sm ${value === item.val ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>{item.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FormPengemudi() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_pengemudi: "",
    ketepatan_waktu: 0,
    keselamatan_berkendara: 0,
    kondisi_kendaraan: 0,
    sikap_driver: 0,
    kepatuhan_aturan: 0,
    respons_pengguna: 0,
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

  const isFormValid = form.nama_pengemudi && 
    form.ketepatan_waktu > 0 && form.keselamatan_berkendara > 0 && form.kondisi_kendaraan > 0 && 
    form.sikap_driver > 0 && form.kepatuhan_aturan > 0 && form.respons_pengguna > 0 && 
    form.komunikasi > 0 && form.kepuasan_keseluruhan > 0;

  return (
    <div className="py-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-blue-700 mb-2 underline text-center">KUESIONER KEPUASAN LAYANAN DRIVER / TRANSPORT GA</h1>
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 mt-4">
        <h2 className="font-semibold text-blue-800 mb-1">Tujuan:</h2>
        <p className="text-sm text-blue-700 mb-3">Untuk mengetahui tingkat kepuasan pengguna terhadap layanan Driver/Transport GA serta mendapatkan masukan untuk peningkatan kualitas pelayanan.</p>
        <h2 className="font-semibold text-blue-800 mb-1">Petunjuk Pengisian:</h2>
        <p className="text-sm text-blue-700">Berikan penilaian sesuai pengalaman Anda menggunakan layanan Driver/Transport GA.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-800">Pilih Driver:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DRIVERS.map((d) => (
              <label
                key={d}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  form.nama_pengemudi === d
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0 ${form.nama_pengemudi === d ? 'border-blue-500' : 'border-slate-300'}`}>
                  {form.nama_pengemudi === d && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={form.nama_pengemudi === d}
                  onChange={() => handleChange("nama_pengemudi", d)}
                />
                <span className={`text-sm font-medium ${form.nama_pengemudi === d ? 'text-blue-900' : 'text-slate-700'}`}>{d}</span>
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
            <h2 className="font-bold text-slate-800">A. Penilaian Layanan Driver/ Transport</h2>
          </div>

          <div className="flex flex-col gap-4">
            <RadioScale 
              label="1. Ketepatan Waktu (Bagaimana ketepatan waktu kedatangan driver di titik penjemputan?)" 
              value={form.ketepatan_waktu} 
              onChange={(v) => handleChange("ketepatan_waktu", v)} 
            />
            <RadioScale 
              label="2. Keselamatan Berkendara (Bagaimana Anda menilai keselamatan berkendara driver selama perjalanan?)" 
              value={form.keselamatan_berkendara} 
              onChange={(v) => handleChange("keselamatan_berkendara", v)} 
            />
            <RadioScale 
              label="3. Kondisi Kendaraan (Bagaimana Anda menilai kondisi kendaraan yang digunakan?)" 
              value={form.kondisi_kendaraan} 
              onChange={(v) => handleChange("kondisi_kendaraan", v)} 
            />
            <RadioScale 
              label="4. Sikap/Keramahan Driver (Bagaimana Anda menilai sikap dan keramahan driver?)" 
              value={form.sikap_driver} 
              onChange={(v) => handleChange("sikap_driver", v)} 
            />
            <RadioScale 
              label="5. Kepatuhan Aturan (Bagaimana Anda menilai kepatuhan driver terhadap aturan?)" 
              value={form.kepatuhan_aturan} 
              onChange={(v) => handleChange("kepatuhan_aturan", v)} 
            />
            <RadioScale 
              label="6. Respons Pengguna (Bagaimana respons driver terhadap kebutuhan pengguna?)" 
              value={form.respons_pengguna} 
              onChange={(v) => handleChange("respons_pengguna", v)} 
            />
            <RadioScale 
              label="7. Komunikasi (Bagaimana komunikasi driver selama memberikan layanan?)" 
              value={form.komunikasi} 
              onChange={(v) => handleChange("komunikasi", v)} 
            />
          </div>
        </div>

        <div className="border-t pt-6 pb-2">
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <h2 className="font-bold text-slate-800 mb-2">8. Kepuasan Keseluruhan</h2>
            <p className="text-sm text-slate-600 mb-4">Secara keseluruhan, bagaimana kepuasan Anda terhadap layanan Driver/Transport GA?</p>
            <div className="flex">
              <StarRating value={form.kepuasan_keseluruhan} onChange={(v) => handleChange("kepuasan_keseluruhan", v)} />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col gap-4">
          <h2 className="font-bold text-slate-800">9. Masukan dan Saran</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Hal yang sudah baik dan perlu dipertahankan:</label>
            <textarea
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              placeholder="...................................................................................................."
              value={form.saran_baik}
              onChange={(e) => handleChange("saran_baik", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Hal yang perlu diperbaiki:</label>
            <textarea
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              placeholder="...................................................................................................."
              value={form.saran_perbaikan}
              onChange={(e) => handleChange("saran_perbaikan", e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] mt-4"
        >
          {loading ? "Mengirim..." : "Kirim Penilaian"}
        </button>
      </form>
    </div>
  );
}
