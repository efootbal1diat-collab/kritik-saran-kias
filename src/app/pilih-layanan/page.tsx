import Link from "next/link";
import { Car, Utensils, ShieldCheck } from "lucide-react";

export default function PilihLayananPage() {
  return (
    <div className="flex flex-col py-6">
      <h1 className="text-xl font-bold text-slate-800 mb-6 text-center">
        Pilih Layanan
      </h1>
      <p className="text-center text-slate-600 mb-8 text-sm">
        Layanan manakah yang ingin Anda nilai hari ini?
      </p>

      <div className="flex flex-col gap-4">
        <Link
          href="/form/pengemudi"
          className="flex items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all active:scale-95"
        >
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">A. Layanan Pengemudi</h2>
            <p className="text-xs text-slate-500 mt-1">Survey kepuasan layanan driver</p>
          </div>
        </Link>

        <Link
          href="/form/kantin"
          className="flex items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:orange-300 transition-all active:scale-95"
        >
          <div className="bg-orange-100 p-3 rounded-full text-orange-600 mr-4">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">B. Layanan Kantin/Catering</h2>
            <p className="text-xs text-slate-500 mt-1">Survey kebersihan & rasa makanan</p>
          </div>
        </Link>

        <Link
          href="/form/security"
          className="flex items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:green-300 transition-all active:scale-95"
        >
          <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">C. Layanan Security</h2>
            <p className="text-xs text-slate-500 mt-1">Survey profesionalisme & tanggap darurat</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
