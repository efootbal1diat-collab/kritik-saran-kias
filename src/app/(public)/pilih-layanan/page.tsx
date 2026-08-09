"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Utensils, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PilihLayananPage() {
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from("services").select("*").eq("is_active", true).order("created_at", { ascending: true });
      if (!error && data) {
        setDynamicServices(data);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  const renderIcon = (iconStr: string) => {
    if (iconStr === "Car") return <Car className="w-6 h-6" />;
    if (iconStr === "Utensils") return <Utensils className="w-6 h-6" />;
    if (iconStr === "ShieldCheck") return <ShieldCheck className="w-6 h-6" />;
    return <AlertCircle className="w-6 h-6" />;
  };

  return (
    <div className="flex flex-col py-6">
      <h1 className="text-xl font-bold text-slate-800 mb-6 text-center">
        Pilih Layanan
      </h1>
      <p className="text-center text-slate-600 mb-8 text-sm">
        Layanan manakah yang ingin Anda nilai hari ini?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Layanan Utama / Baku */}
        <Link
          href="/form/pengemudi"
          className="flex items-start p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all active:scale-95 h-full"
        >
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600 mr-4 shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-lg">A. Layanan Pengemudi</h2>
            <p className="text-sm text-slate-500 mt-1">Survey kepuasan layanan driver</p>
          </div>
        </Link>

        <Link
          href="/form/kantin"
          className="flex items-start p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all active:scale-95 h-full"
        >
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600 mr-4 shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-lg">B. Layanan Kantin/Catering</h2>
            <p className="text-sm text-slate-500 mt-1">Survey kebersihan & rasa makanan</p>
          </div>
        </Link>

        <Link
          href="/form/security"
          className="flex items-start p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-green-300 transition-all active:scale-95 h-full"
        >
          <div className="bg-green-100 p-3 rounded-xl text-green-600 mr-4 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-lg">C. Layanan Security</h2>
            <p className="text-sm text-slate-500 mt-1">Survey profesionalisme & tanggap darurat</p>
          </div>
        </Link>
      </div>

      {/* Layanan Tambahan (Dinamis) */}
      {!loading && dynamicServices.length > 0 && (
        <div className="mt-8 pt-8 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center mb-6">Layanan Lainnya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dynamicServices.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="flex items-start p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all active:scale-95 h-full"
              >
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 mr-4 shrink-0">
                  {renderIcon(service.icon_type)}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 text-lg">{service.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">{service.description || "Survey layanan tambahan"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
