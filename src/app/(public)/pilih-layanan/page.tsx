"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Utensils, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ensureServicesSeeded } from "@/lib/seedServices";

export default function PilihLayananPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      await ensureServicesSeeded();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
        
      if (!error && data) {
        // Sort services to ensure system services are always A, B, C
        const sorted = [...data].sort((a, b) => {
          const order = ["Layanan Pengemudi", "Layanan Kantin / Catering", "Layanan Security"];
          const idxA = order.indexOf(a.name);
          const idxB = order.indexOf(b.name);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
        setServices(sorted);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  const renderIcon = (iconStr: string) => {
    if (iconStr === "Car") return <Car className="w-6 h-6 text-blue-600" />;
    if (iconStr === "Utensils") return (
      <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="7.6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path
          fill="currentColor"
          d="M7.2 6.5h0.9v3.5h0.8V6.5h0.9v3.5h0.8V6.5h0.9v3.8c0 1.1-.7 1.8-1.6 2.0V17.5h-1.2v-5.2c-.9-.2-1.6-.9-1.6-2.0V6.5z"
        />
        <path
          fill="currentColor"
          d="M14.8 6.5c-1.4 0-2.3 1.3-2.3 3.1 0 1.3.7 2.3 1.7 2.7v5.2h1.2v-5.2c1-.4 1.7-1.4 1.7-2.7 0-1.8-.9-3.1-2.3-3.1z"
        />
      </svg>
    );
    if (iconStr === "ShieldCheck") return <ShieldCheck className="w-6 h-6 text-green-600" />;
    return <AlertCircle className="w-6 h-6 text-slate-600" />;
  };

  const getBadgeColor = (iconStr: string) => {
    if (iconStr === "Car") return "bg-blue-100";
    if (iconStr === "Utensils") return "bg-orange-100";
    if (iconStr === "ShieldCheck") return "bg-green-100";
    return "bg-slate-100";
  };

  const getBorderColorHover = (iconStr: string) => {
    if (iconStr === "Car") return "hover:border-blue-300";
    if (iconStr === "Utensils") return "hover:border-orange-300";
    if (iconStr === "ShieldCheck") return "hover:border-green-300";
    return "hover:border-indigo-300";
  };

  const getCleanDescription = (desc: string) => {
    if (!desc) return "Survey kepuasan layanan GA";
    try {
      if (desc.startsWith("{")) {
        const parsed = JSON.parse(desc);
        return parsed.desc || "Survey kepuasan layanan GA";
      }
    } catch (e) {}
    return desc;
  };

  return (
    <div className="flex flex-col py-6 font-sans">
      <h1 className="text-xl font-bold text-slate-800 mb-2 text-center">
        Pilih Layanan
      </h1>
      <p className="text-center text-slate-600 mb-8 text-sm">
        Layanan manakah yang ingin Anda nilai hari ini?
      </p>

      {loading ? (
        <p className="text-center text-slate-500 py-10">Memuat daftar layanan...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className={`flex items-start p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md ${getBorderColorHover(service.icon_type)} transition-all duration-300 ease-in-out hover:-translate-y-1 active:scale-95 h-full`}
            >
              <div className={`p-3 rounded-xl ${getBadgeColor(service.icon_type)} mr-4 shrink-0 flex items-center justify-center`}>
                {renderIcon(service.icon_type)}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-lg">
                  {String.fromCharCode(65 + index)}. {service.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{getCleanDescription(service.description)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
