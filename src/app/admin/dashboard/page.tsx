"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [totalResponden, setTotalResponden] = useState(0);
  const [totalLayanan, setTotalLayanan] = useState(3);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuth(true);
      fetchDashboardData();
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const { count: countPengemudi } = await supabase.from('survey_pengemudi').select('*', { count: 'exact', head: true });
      const { count: countKantin } = await supabase.from('survey_kantin').select('*', { count: 'exact', head: true });
      const { count: countSecurity } = await supabase.from('survey_security').select('*', { count: 'exact', head: true });
      const { count: countDynamicResp } = await supabase.from('responses').select('*', { count: 'exact', head: true });
      
      const total = (countPengemudi || 0) + (countKantin || 0) + (countSecurity || 0) + (countDynamicResp || 0);
      setTotalResponden(total);

      // Active Dynamic Services
      const { count: countDynamicSrv } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true);
      setTotalLayanan(3 + (countDynamicSrv || 0));
    } catch (error) {
      console.error("Error fetching respondents:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  if (!isAuth) return null;

  return (
    <div className="flex h-screen bg-slate-50 flex-col md:flex-row overflow-hidden">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 shrink-0">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          <Settings className="mr-2 w-5 h-5 text-blue-600" />
          Admin Panel
        </h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 bg-slate-100 rounded-lg">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-20 w-full md:w-64 bg-white border-b md:border-r border-slate-200 p-6 flex-col h-[calc(100vh-73px)] md:h-full top-[73px] md:top-0 left-0`}>
        <h2 className="hidden md:flex text-xl font-bold text-slate-800 mb-8 items-center">
          <Settings className="mr-2 w-6 h-6 text-blue-600" />
          Admin Panel
        </h2>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors">
            <LayoutDashboard className="mr-3 w-5 h-5" />
            Dashboard Utama
          </Link>
          <Link href="/admin/services" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <FileText className="mr-3 w-5 h-5" />
            Kelola Layanan / Form
          </Link>
          <Link href="/admin/results" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang, Admin!</h1>
          <p className="text-slate-500 mb-8">Ini adalah pusat kendali aplikasi Kuesioner Kepuasan Layanan GA.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Total Layanan Aktif</h3>
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalLayanan}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Total Responden</h3>
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalResponden}</p>
            </div>
          </div>

          <div className="mt-10 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Langkah Selanjutnya</h3>
            <p className="text-slate-600 mb-4">
              Anda dapat melihat dan menganalisis hasil masukan (feedback) dari seluruh responden yang telah mengisi kuesioner.
            </p>
            <Link href="/admin/results" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Lihat Hasil Survey
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
