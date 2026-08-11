"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ensureServicesSeeded } from "@/lib/seedServices";
import { BarChart3, LayoutDashboard, FileText, LogOut, Menu, X, Download, Inbox } from "lucide-react";
import Link from "next/link";

interface ServiceItem {
  id: string;
  name: string;
  icon_type: string;
}

export default function AdminResults() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  
  const [data, setData] = useState<any[]>([]);
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuth(true);
      fetchServices();
    }
  }, [router]);

  useEffect(() => {
    if (activeTab) {
      fetchData(activeTab);
    }
  }, [activeTab]);

  const fetchServices = async () => {
    try {
      await ensureServicesSeeded();

      const { data, error } = await supabase
        .from("services")
        .select("id, name, icon_type")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (!error && data) {
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
        if (sorted.length > 0 && !activeTab) {
          setActiveTab(sorted[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async (serviceId: string) => {
    setLoading(true);
    setDynamicQuestions([]);
    setData([]);
    
    try {
      // 1. Fetch questions for header
      const { data: qData } = await supabase
        .from("questions")
        .select("*")
        .eq("service_id", serviceId)
        .order("order_number", { ascending: true });
        
      if (qData) setDynamicQuestions(qData);

      // 2. Fetch responses from dynamic table
      const { data: result, error } = await supabase
        .from("responses")
        .select(`*, answers(*)`)
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      let combined = result || [];

      // 3. Fallback for legacy tables if applicable
      const activeObj = services.find(s => s.id === serviceId);
      const serviceName = activeObj?.name || "";

      if (serviceName.includes("Pengemudi") || serviceName.includes("Driver")) {
        const { data: leg } = await supabase.from("survey_pengemudi").select("*").order("created_at", { ascending: false });
        if (leg && leg.length > 0) {
          const mappedLeg = leg.map(l => ({
            id: l.id,
            respondent_name: l.pekerjaan || "Karyawan",
            vendor_name: l.nama_pengemudi || "-",
            created_at: l.created_at,
            is_legacy: true,
            legacy_data: l
          }));
          combined = [...combined, ...mappedLeg];
        }
      } else if (serviceName.includes("Kantin") || serviceName.includes("Catering")) {
        const { data: leg } = await supabase.from("survey_kantin").select("*").order("created_at", { ascending: false });
        if (leg && leg.length > 0) {
          const mappedLeg = leg.map(l => ({
            id: l.id,
            respondent_name: l.pekerjaan || "Karyawan",
            vendor_name: l.nama_kantin || "-",
            created_at: l.created_at,
            is_legacy: true,
            legacy_data: l
          }));
          combined = [...combined, ...mappedLeg];
        }
      } else if (serviceName.includes("Security")) {
        const { data: leg } = await supabase.from("survey_security").select("*").order("created_at", { ascending: false });
        if (leg && leg.length > 0) {
          const mappedLeg = leg.map(l => ({
            id: l.id,
            respondent_name: l.pekerjaan || "Karyawan",
            vendor_name: l.pos_security || "-",
            created_at: l.created_at,
            is_legacy: true,
            legacy_data: l
          }));
          combined = [...combined, ...mappedLeg];
        }
      }

      setData(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const activeObj = services.find(s => s.id === activeTab);
    const serviceName = activeObj?.name || "Survey";

    let headers = ["Tanggal", "Responden", "Target / Vendor"];
    dynamicQuestions.forEach(q => {
      const shortLabel = q.question_text.replace(/\s*\(.*?\)\s*/g, "");
      headers.push(`"${shortLabel}"`);
    });

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    data.forEach(row => {
      let rowVals = [
        `"${new Date(row.created_at).toLocaleDateString("id-ID")}"`,
        `"${row.respondent_name || '-'}"`,
        `"${row.vendor_name || '-'}"`
      ];

      dynamicQuestions.forEach(q => {
        const ansObj = (row.answers || []).find((a: any) => a.question_id === q.id);
        rowVals.push(`"${ansObj ? ansObj.answer_value : '-'}"`);
      });

      csvContent += rowVals.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hasil_Survey_${serviceName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const renderIcon = (iconStr: string) => {
    if (iconStr === "Car") return "🚐";
    if (iconStr === "Utensils") return "🍱";
    if (iconStr === "ShieldCheck") return "🛡️";
    return "📋";
  };

  if (!isAuth) return null;

  return (
    <div className="flex h-screen bg-slate-50 flex-col md:flex-row overflow-hidden font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/logo-kias.jpg" alt="KIAS" className="h-7 w-auto object-contain" />
          <h2 className="text-base font-bold text-slate-800">Admin Panel</h2>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 bg-slate-100 rounded-lg">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-20 w-full md:w-64 bg-white border-b md:border-r border-slate-200 p-6 flex-col h-[calc(100vh-73px)] md:h-full top-[73px] md:top-0 left-0`}>
        <div className="hidden md:flex flex-col mb-6">
          <img src="/logo-kias.jpg" alt="PT. Karanganyar Indo Auto Systems" className="h-10 w-auto object-contain mb-2 self-start" />
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">ADMIN PANEL GA</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <LayoutDashboard className="mr-3 w-5 h-5" />
            Dashboard Utama
          </Link>
          <Link href="/admin/services" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <FileText className="mr-3 w-5 h-5" />
            Kelola Layanan / Form
          </Link>
          <Link href="/admin/results" className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors">
            <BarChart3 className="mr-3 w-5 h-5" />
            Hasil Survey (GA)
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Hasil Survey (GA)</h1>
              <p className="text-slate-500 mt-1">Data feedback 100% dinamis dari engine kuesioner.</p>
            </div>
            {data.length > 0 && (
              <button 
                onClick={exportCSV}
                className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>

          {/* Dynamic Tab Selector */}
          <div className="bg-white p-4 rounded-t-xl border border-gray-200 shadow-xs flex flex-wrap gap-2 border-b-0">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === service.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{renderIcon(service.icon_type)}</span> {service.name}
              </button>
            ))}
          </div>

          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded-b-xl shadow-xs overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Memuat hasil survey...</div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-base font-semibold text-slate-700">Belum Ada Respon</p>
                <p className="text-xs text-slate-500 mt-1">
                  Respon yang dikirim oleh pengguna akan muncul di tabel ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Waktu</th>
                      <th className="py-3.5 px-4">Responden</th>
                      <th className="py-3.5 px-4">Target / Vendor</th>
                      {dynamicQuestions.map((q) => (
                        <th key={q.id} className="py-3.5 px-4 min-w-[150px]">
                          {q.question_text.replace(/\s*\(.*?\)\s*/g, "")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                    {data.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                          {new Date(row.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {row.respondent_name || "Anonim"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-blue-700">
                          {row.vendor_name || "-"}
                        </td>

                        {dynamicQuestions.map((q) => {
                          const ansObj = (row.answers || []).find((a: any) => a.question_id === q.id);
                          const val = ansObj ? ansObj.answer_value : "-";
                          return (
                            <td key={q.id} className="py-3.5 px-4">
                              {q.question_type === "star" ? (
                                <span className="font-bold text-amber-500 flex items-center gap-1">
                                  {val} ⭐
                                </span>
                              ) : (
                                <span className="text-slate-800">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
