"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, LayoutDashboard, FileText, Settings, LogOut, Menu, X, Download } from "lucide-react";
import Link from "next/link";

export default function AdminResults() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>("pengemudi");
  const [data, setData] = useState<any[]>([]);
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuth(true);
      fetchDynamicServices();
      fetchData("pengemudi");
    }
  }, [router]);

  const fetchDynamicServices = async () => {
    const { data } = await supabase.from("services").select("*").order("created_at", { ascending: true });
    if (data) setDynamicServices(data);
  };

  const fetchData = async (tab: string) => {
    setLoading(true);
    setDynamicQuestions([]);
    
    try {
      if (tab === "pengemudi") {
        const { data: result, error } = await supabase.from("survey_pengemudi").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setData(result || []);
      } else if (tab === "kantin") {
        const { data: result, error } = await supabase.from("survey_kantin").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setData(result || []);
      } else if (tab === "security") {
        const { data: result, error } = await supabase.from("survey_security").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setData(result || []);
      } else {
        // Dynamic Service
        const { data: qData } = await supabase.from("questions").select("*").eq("service_id", tab).order("order_number", { ascending: true });
        if (qData) setDynamicQuestions(qData);

        const { data: result, error } = await supabase.from("responses")
          .select(`*, answers(*)`)
          .eq("service_id", tab)
          .order("created_at", { ascending: false });
        if (error) throw error;
        
        setData(result || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchData(tab);
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Hasil Survey (GA)</h1>
              <p className="text-slate-500 mt-1">Data feedback yang masuk dari pengguna layanan GA.</p>
            </div>
            {data.length > 0 && (
              <button className="flex items-center px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col md:flex-row border-b border-slate-200">
              <button 
                onClick={() => handleTabChange("pengemudi")}
                className={`py-4 px-6 text-sm font-semibold transition-colors ${activeTab === 'pengemudi' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Pengemudi
              </button>
              <button 
                onClick={() => handleTabChange("kantin")}
                className={`py-4 px-6 text-sm font-semibold transition-colors ${activeTab === 'kantin' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Kantin
              </button>
              <button 
                onClick={() => handleTabChange("security")}
                className={`py-4 px-6 text-sm font-semibold transition-colors ${activeTab === 'security' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Security
              </button>
              
              {dynamicServices.length > 0 && (
                <div className="py-2 px-4 flex items-center md:ml-auto border-t md:border-t-0 md:border-l border-slate-200">
                  <select 
                    value={!['pengemudi', 'kantin', 'security'].includes(activeTab) ? activeTab : ""} 
                    onChange={(e) => {
                      if (e.target.value) handleTabChange(e.target.value);
                    }}
                    className={`text-sm p-2 rounded-lg border outline-none font-semibold ${!['pengemudi', 'kantin', 'security'].includes(activeTab) ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 border-slate-200'}`}
                  >
                    <option value="" disabled>Layanan Lainnya (Dinamis)...</option>
                    {dynamicServices.map(srv => (
                      <option key={srv.id} value={srv.id}>{srv.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="p-6 overflow-x-auto">
              {loading ? (
                <div className="py-12 text-center text-slate-500">Memuat data responden...</div>
              ) : data.length === 0 ? (
                <div className="py-12 text-center text-slate-500">Belum ada data respons untuk layanan ini.</div>
              ) : (
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Waktu (UTC)</th>
                      
                      {activeTab === "pengemudi" && (
                        <>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Pekerjaan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Nama Pengemudi</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Kepuasan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Ketepatan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Keselamatan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Saran (Baik)</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Saran (Perbaikan)</th>
                        </>
                      )}
                      
                      {activeTab === "kantin" && (
                        <>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Pekerjaan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Vendor Kantin</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Kepuasan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Rasa</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Higiene</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Saran (Baik)</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Saran (Perbaikan)</th>
                        </>
                      )}

                      {activeTab === "security" && (
                        <>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Pekerjaan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Pos / Area</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Kepuasan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Sikap</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Rasa Aman</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Saran (Baik)</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Saran (Perbaikan)</th>
                        </>
                      )}

                      {!["pengemudi", "kantin", "security"].includes(activeTab) && (
                        <>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Nama/Pekerjaan</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Nama Vendor</th>
                          {dynamicQuestions.map(q => (
                            <th key={q.id} className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 truncate max-w-[150px]" title={q.question_text}>
                              {q.question_text}
                            </th>
                          ))}
                          <th className="py-3 px-4 font-semibold text-slate-700 bg-slate-50">Komentar/Keluhan</th>
                        </>
                      )}
                      
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => {
                      // Helper to get answer for dynamic
                      const getAnswer = (qId: string) => {
                        if (!row.answers) return "-";
                        const ans = row.answers.find((a: any) => a.question_id === qId);
                        return ans ? ans.answer_value : "-";
                      };

                      return (
                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-600">{new Date(row.created_at).toLocaleString()}</td>
                          
                          {activeTab === "pengemudi" && (
                            <>
                              <td className="py-3 px-4 text-slate-800 font-medium">{row.pekerjaan || "-"}</td>
                              <td className="py-3 px-4 text-slate-800 font-medium">{row.nama_pengemudi}</td>
                              <td className="py-3 px-4 text-blue-600 font-bold">⭐ {row.kepuasan_keseluruhan}</td>
                              <td className="py-3 px-4 text-slate-600">{row.ketepatan_waktu}/4</td>
                              <td className="py-3 px-4 text-slate-600">{row.keselamatan_berkendara}/4</td>
                              <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={row.saran_baik}>{row.saran_baik || "-"}</td>
                              <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={row.saran_perbaikan}>{row.saran_perbaikan || "-"}</td>
                            </>
                          )}

                          {activeTab === "kantin" && (
                            <>
                              <td className="py-3 px-4 text-slate-800 font-medium">{row.pekerjaan || "-"}</td>
                              <td className="py-3 px-4 text-slate-800 font-medium">{row.nama_kantin}</td>
                              <td className="py-3 px-4 text-orange-600 font-bold">⭐ {row.kepuasan_keseluruhan}</td>
                              <td className="py-3 px-4 text-slate-600">{row.kualitas_rasa}/4</td>
                              <td className="py-3 px-4 text-slate-600">{row.kebersihan_higiene}/4</td>
                              <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={row.saran_baik}>{row.saran_baik || "-"}</td>
                              <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={row.saran_perbaikan}>{row.saran_perbaikan || "-"}</td>
                            </>
                          )}

                          {activeTab === "security" && (
                            <>
                              <td className="py-3 px-4 text-slate-800 font-medium">{row.pekerjaan || "-"}</td>
                              <td className="py-3 px-4 text-slate-800 font-medium">{row.nama_security}</td>
                              <td className="py-3 px-4 text-green-600 font-bold">⭐ {row.kepuasan_keseluruhan}</td>
                              <td className="py-3 px-4 text-slate-600">{row.sikap_petugas}/4</td>
                              <td className="py-3 px-4 text-slate-600">{row.rasa_aman}/4</td>
                              <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={row.saran_baik}>{row.saran_baik || "-"}</td>
                              <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={row.saran_perbaikan}>{row.saran_perbaikan || "-"}</td>
                            </>
                          )}

                          {!["pengemudi", "kantin", "security"].includes(activeTab) && (
                            <>
                              <td className="py-3 px-4 text-slate-800 font-medium">{row.respondent_name || "-"}</td>
                              <td className="py-3 px-4 text-slate-800 font-medium">{row.vendor_name || "-"}</td>
                              {dynamicQuestions.map(q => (
                                <td key={q.id} className="py-3 px-4 text-slate-600 truncate max-w-[150px]" title={getAnswer(q.id)}>
                                  {q.question_type === 'star' && getAnswer(q.id) !== "-" ? `⭐ ${getAnswer(q.id)}` : getAnswer(q.id)}
                                </td>
                              ))}
                              <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={row.feedback_text}>
                                {row.feedback_text || "-"}
                              </td>
                            </>
                          )}

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
